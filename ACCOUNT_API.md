# Minha conta — o que falta no backend

Doc de especificação para o time/serviço de backend (`editalis-api`, o mesmo serviço por trás de `/api/v1/search`, `/api/v1/alerts`, `/api/v1/favorites`). Escopo: fazer a página **`/perfil`** do frontend funcionar de ponta a ponta — hoje ela é metade real, metade mock.

## Estado atual da página `/perfil`

| Seção | Componente | Status |
|---|---|---|
| Dados da conta (nome, CNPJ, e-mail) | [AccountForm.tsx](src/components/perfil/AccountForm.tsx) | ✅ **Real** — Supabase Auth (`user_metadata.nome`/`cnpj`, `email`) |
| Trocar senha | [PasswordForm.tsx](src/components/perfil/PasswordForm.tsx) | ✅ **Real** — Supabase Auth (`updateUser({ password })`) |
| Plano e cobrança | [PlanCard.tsx](src/components/perfil/PlanCard.tsx) | ❌ **100% mock** — "Profissional / R$ 199/mês / renova em 12/08/2026" hardcoded, botão "Gerenciar assinatura" não faz nada |
| Notificações | link para `/alertas` | ✅ Real (não duplica nada, só linka) |

**Não é preciso mexer em Dados da conta ou Trocar senha** — isso já é 100% Supabase Auth, sem endpoint próprio no `editalis-api`. O trabalho de backend descrito aqui é só para **Plano e cobrança**, mais um efeito colateral em Alertas (limite de perfis por plano).

## Os planos já são públicos (landing page)

A precificação e os limites por plano já estão publicados em [src/app/page.tsx](src/app/page.tsx) — **não são uma decisão em aberto**, é o que o cliente já vê antes de assinar:

| Plano | Preço | Perfis de busca monitorados (= linhas em `/api/v1/alerts`) | Outros limites |
|---|---|---|---|
| Essencial | R$ 49/mês (R$ 39 no anual) | 3 | Histórico 30 dias, alerta só e-mail |
| Profissional | R$ 199/mês (R$ 159 no anual) | 25 | Histórico completo, e-mail+WhatsApp+app |
| Enterprise | Sob consulta | Ilimitado | API/webhooks, SSO, gestor de conta, SLA |

FAQ da landing (também já público, também vira requisito):
- 7 dias de trial, sem cartão — cobrança só começa se o usuário confirmar.
- Nota fiscal emitida em **todos** os planos.
- Enterprise aceita **empenho e faturamento por contrato** (não só cartão) — típico de venda para setor público.

## Decisão em aberto: provedor de pagamento

Não há nenhum provedor escolhido no código hoje. Isso trava o formato exato dos endpoints de checkout abaixo, então precisa ser decidido antes de implementar essa parte (o resto — dados da assinatura, limite de perfis — pode ser feito antes e não depende disso).

Restrição real: **nota fiscal + boleto/empenho** não são suportados nativamente pelo Stripe puro (comum em SaaS gringo). Opções usadas no mercado BR que já resolvem NF-e/boleto:
- **Iugu**, **Vindi**, **Pagar.me** — cobrança recorrente + emissão de nota fiscal nativa.
- Stripe + serviço de NF-e à parte (ex: NFe.io) — mais trabalho de integração, mas mantém Stripe pro cartão/assinatura.

## Endpoints propostos

Seguindo a convenção já usada por Alertas/Favoritos (`?user_id=<supabase_user_id>` na query, sem middleware de auth próprio — ver nota de segurança abaixo):

### `GET /api/v1/account/subscription?user_id=X`

Retorna o estado atual da assinatura. É o que alimenta o `PlanCard`.

```ts
interface Subscription {
  plan: 'essencial' | 'profissional' | 'enterprise';
  plan_label: string;              // "Profissional" — pra exibir direto
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  billing_cycle: 'monthly' | 'annual';
  price_cents: number | null;      // null = Enterprise ("sob consulta")
  current_period_end: string;      // ISO date — "renova em"
  cancel_at_period_end: boolean;
  trial_ends_at: string | null;
  usage: {
    alert_profiles_used: number;   // count atual em /api/v1/alerts
    alert_profiles_limit: number | null; // null = ilimitado (Enterprise)
  };
}
```

### `POST /api/v1/account/subscription/portal?user_id=X`

Alvo do botão **"Gerenciar assinatura"**. Cria uma sessão no portal de billing do provedor (Stripe Customer Portal ou equivalente) e devolve a URL pra redirecionar:

```ts
{ url: string }
```

Evita reimplementar troca de cartão/cancelamento/2ª via de nota no frontend — o provedor já resolve isso pronto.

### `POST /api/v1/account/subscription/checkout?user_id=X`

Body: `{ plan: 'essencial' | 'profissional' | 'enterprise', billing_cycle: 'monthly' | 'annual' }`

Cria a sessão de checkout pro fluxo de assinar/trocar de plano e devolve `{ url: string }` pra redirecionar. É o backend do **Checkout** que já está desenhado no `design-handoff` (3 passos: Plano → Pagamento → Confirmação) mas nunca foi construído no frontend — ver nota no CLAUDE.md.

### Webhook do provedor → backend

Endpoint (fora do `/api/v1`, formato depende do provedor escolhido) pra sincronizar `status`/`current_period_end`/`plan` quando pagamento passa, falha, ou a assinatura muda no painel do provedor. Sem isso, `GET /account/subscription` fica desatualizado toda vez que algo muda fora do fluxo de checkout (ex: cartão recusado na renovação).

## Efeito colateral: limite de perfis em `/api/v1/alerts`

O plano promete um número de "perfis de busca monitorados" — isso é exatamente uma linha em `/api/v1/alerts`. Hoje esse endpoint não parece aplicar limite nenhum. Precisa:

- `POST /api/v1/alerts` validar `count(alerts do user) < limite do plano` antes de criar, e devolver `403`/`422` com uma mensagem clara (`"Limite de 25 perfis do plano Profissional atingido"`) quando estourar.
- O frontend usa isso pra desabilitar "+ Novo alerta" ou mostrar o aviso — hoje não faz nada disso porque não tem de onde ler o limite.

## Nota de segurança — vale para isso e para o que já existe

`/api/v1/alerts` e `/api/v1/favorites` confiam no `user_id` que vem *da query string, mandado pelo cliente* — não há verificação de que quem está chamando é de fato esse usuário (ex: JWT do Supabase validado no backend). Pra dados de busca salva isso já é um risco; pra dados de **cobrança** é bem mais sério (nome, valor pago, status de pagamento de outra pessoa ficam a um `?user_id=` de distância).

Recomendação mínima pros endpoints novos (`/account/*`): exigir `Authorization: Bearer <supabase_access_token>` e derivar o `user_id` validando o token no backend (Supabase expõe a chave pública do projeto pra isso), em vez de aceitar o valor da query. Vale considerar retroaplicar o mesmo em Alertas/Favoritos, mas isso é uma decisão separada do time de backend.

## Modelo de dados sugerido

Não precisa de tabela `plans` — são 3 tiers fixos, já hardcoded também no frontend (`src/app/page.tsx`), então um enum/config estático no backend é suficiente e evita duas fontes de verdade brigando.

```
subscriptions
  id
  user_id            (supabase auth uid)
  plan               enum: essencial | profissional | enterprise
  billing_cycle      enum: monthly | annual
  status             enum: trialing | active | past_due | canceled
  current_period_end timestamp
  cancel_at_period_end boolean
  trial_ends_at      timestamp nullable
  external_customer_id      (id do cliente no provedor de pagamento)
  external_subscription_id  (id da assinatura no provedor)
  created_at
  updated_at
```

**Fora de escopo por enquanto, mas fica registrado**: o Enterprise promete "SSO e gestão de equipes" — isso implica múltiplos usuários por conta/CNPJ (uma `organization` com N `users`), o que essa modelagem 1 `user_id` → 1 `subscription` não cobre. Não é preciso resolver agora (nenhuma tela do frontend depende disso hoje), mas se o Enterprise sair do "sob consulta" a modelagem de conta vai precisar mudar de usuário individual pra organização.

## Ordem sugerida de implementação

1. **Stub sem provedor de pagamento**: `GET /account/subscription` devolve um registro fixo por usuário (ex: todo mundo novo cai em `profissional`/`trialing`) — já destrava o `PlanCard` mostrando dado real em vez de mock, sem esperar a escolha do provedor.
2. Limite de perfis em `/api/v1/alerts` (não depende de pagamento, só do enum de plano acima).
3. Escolher provedor → checkout + portal + webhook.
