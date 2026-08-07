# Minha conta — o que falta no backend

Doc de especificação para o time/serviço de backend (`editalis-api`, o mesmo serviço por trás de `/api/v1/search`, `/api/v1/alerts`, `/api/v1/favorites`). Cobre a tela **"Minha conta"** do design (`design-handoff/Editalis.dc.html`, aba **PERFIL**), que substitui a antiga `/perfil` de uma página só por 4 abas: **Conta**, **Empresa e faturamento**, **Assinatura**, **Equipe e segurança**.

> **v2 deste doc.** A v1 cobria só "Plano e cobrança" (parcialmente implementada, ver [Assinatura](#aba-3-assinatura) abaixo). O design cresceu bastante desde então — agora é uma área de administração completa, com gestão de equipe multiusuário. Isso muda a arquitetura de dados (ver [Mudança de modelo](#mudança-de-modelo-usuário-único--organização) primeiro).

## Mudança de modelo: usuário único → organização

Hoje o backend modela tudo como **1 `user_id` (Supabase) → 1 registro** (`/api/v1/alerts?user_id=X`, `/api/v1/favorites?user_id=X`, `/api/v1/account/subscription?user_id=X`). O design de "Equipe e segurança" mostra 3 usuários (Ana, Marcos, Júlia) com papéis diferentes, todos acessando os **mesmos** perfis de alerta e a **mesma** assinatura da "Construtora Órion Ltda" — ou seja, a assinatura e os dados pertencem à **empresa**, não a um usuário individual.

Isso é uma mudança de arquitetura, não só um endpoint novo:

```
organizations
  id
  razao_social, cnpj, inscricao_municipal, cep, cidade, uf
  email_nota_fiscal
  cnaes            (array ou tabela filha — ver Empresa e faturamento)
  created_at

organization_members
  id
  organization_id
  user_id          (supabase auth uid)
  role             enum: admin | editor | leitor
  scope            texto livre ou null ("Todos os perfis" / "Obras civis SP/MG" / "Somente leitura")
  invited_at, joined_at
```

`subscriptions` passa a referenciar `organization_id` em vez de `user_id`. `alerts` e `favorites` idealmente também — hoje são por `user_id`, então ou viram por `organization_id` (todo mundo da empresa vê os mesmos perfis, como o design sugere) ou ganham um dono + visibilidade por `scope`. **Essa decisão de modelagem trava boa parte da aba Equipe e segurança** — recomendo resolver isso com o time antes de implementar convite/papéis.

Dado o tamanho da mudança, a [ordem sugerida](#ordem-sugerida-de-implementação) no final trata isso como sua própria fase, não algo pra encaixar junto com o resto.

## Aba 1: Conta

### Dados pessoais

Novo em relação à v1: `cargo` e `celular` não existem hoje. `nome_completo` pode continuar em `user_metadata` (Supabase), mas se a "Atividade recente" (abaixo) precisa atribuir ações a um nome exibível entre membros da equipe, vale considerar mover isso pra `organization_members` ou uma tabela `user_profiles` — `user_metadata` não é consultável por outros usuários da mesma org.

```ts
interface AccountProfile {
  nome_completo: string;
  cargo: string;
  email: string;       // já é o Supabase auth email, só exibição
  celular: string;
}
```
`GET/PUT /api/v1/account/profile?user_id=X`

### Preferências de busca

**Isso não é só uma tela de configuração — precisa alterar comportamento real** em `/dashboard` e `/busca`:
- "Abrir o painel já filtrado pelas UFs padrão" → `/dashboard` aplica esse filtro na carga inicial.
- "Ocultar licitações já homologadas nos resultados" → `/busca` filtra por situação.
- "Marcar automaticamente como favorita ao baixar o edital" → não há "baixar edital" implementado hoje pra artigos reais (só existe pro mock de licitação); avisar o time de frontend se isso depender de uma feature que ainda não existe.

```ts
interface SearchPreferences {
  ufs_padrao: string[];
  valor_minimo_interesse: number | null;
  abrir_painel_filtrado: boolean;
  ocultar_homologadas: boolean;
  favoritar_ao_baixar: boolean;
}
```
`GET/PUT /api/v1/account/preferences?user_id=X`

### Canais de notificação (padrão global)

Três toggles (e-mail diário 06h30, WhatsApp 48h, notificação no app) com um botão **"Configurar por perfil"** ao lado — ou seja, isso é o **default**, e cada perfil de alerta em `/api/v1/alerts` pode sobrescrever. Hoje `alerts` não tem campo de canal nenhum (conferir se o schema atual dos alertas já tem `channels` ou equivalente — se não tiver, precisa adicionar lá, não só aqui).

```ts
interface NotificationDefaults {
  email_diario: boolean;
  whatsapp_48h: boolean;
  notificacao_app: boolean;
}
```
`GET/PUT /api/v1/account/notification-defaults?user_id=X`

### Atividade recente

Feed de eventos: "Exportou 2.418 resultados em CSV", "Criou o perfil 'Reformas escolares'", "Favoritou o Pregão 114/2026", cada um com timestamp relativo. Isso exige instrumentar as ações existentes (export CSV em `/busca`, criar em `/api/v1/alerts`, favoritar em `/api/v1/favorites`) pra gravar um evento — é transversal, não um endpoint isolado.

```ts
interface ActivityEvent {
  id: string;
  type: 'export_csv' | 'alert_created' | 'alert_updated' | 'favorited' | 'unfavorited';
  description: string;   // "Criou o perfil "Reformas escolares"" — pronto pra exibir
  created_at: string;
}
```
`GET /api/v1/account/activity?user_id=X&limit=10`

### Uso no ciclo

"312 buscas · 9 exportações · 41 editais abertos. Sem limite no plano Profissional." — contadores por ciclo de cobrança. Dá pra embutir no `GET /account/subscription` (que já existe) em vez de criar endpoint novo:

```ts
// adicionar em Subscription.usage:
searches_this_cycle: number;
exports_this_cycle: number;
articles_opened_this_cycle: number;
```

## Aba 2: Empresa e faturamento

Tudo aqui pertence à `organization`, não ao usuário — ver [Mudança de modelo](#mudança-de-modelo-usuário-único--organização).

### Dados cadastrais

Razão social, CNPJ, Inscrição municipal, CEP, Cidade/UF, E-mail para nota fiscal — CRUD simples, sem dependência externa.

```ts
interface CompanyProfile {
  razao_social: string;
  cnpj: string;
  inscricao_municipal: string;
  cep: string;
  cidade: string;
  uf: string;
  email_nota_fiscal: string;
}
```
`GET/PUT /api/v1/account/company?user_id=X`

### CNAEs de atuação

Lista de códigos CNAE (ex: "41.20-4 · Construção de edifícios") com um "+ adicionar". A cópia do design é explícita: **"Os CNAEs alimentam a sugestão automática de licitações compatíveis no painel."** — isso é uma feature real de matching, não decoração. Se `/api/v1/alerts` ou o painel já tem alguma lógica de sugestão/match, ela precisa passar a considerar os CNAEs da empresa. Vale confirmar com o time se isso já existe em algum lugar ou é novo.

```ts
interface Cnae {
  codigo: string;   // "41.20-4"
  descricao: string; // "Construção de edifícios"
}
```
`GET/PUT /api/v1/account/company/cnaes?user_id=X`

### Situação cadastral — integração externa

"🔴 Ativa na Receita Federal · Consultada em 30/07/2026" — isso é uma consulta a uma API de CNPJ (BrasilAPI, ReceitaWS, ou a Receita Federal diretamente), cacheada com timestamp de última consulta. Recomendo:
- Consultar sob demanda (usuário abre a aba) com cache de ~24h, não em tempo real a cada request.
- `GET /api/v1/account/company/status?user_id=X` → `{ situacao: 'ativa' | 'inapta' | 'baixada' | ..., consultado_em: string }`

### Documentos de habilitação

CND Federal, CRF/FGTS, Certidão trabalhista, cada um com data de vencimento + aviso "por e-mail 15 dias antes de cada vencimento". Duas formas de implementar, com custo bem diferente:
1. **Entrada manual** (mais simples): usuário digita a data de vencimento de cada certidão, backend só guarda e dispara e-mail via cron/scheduled job 15 dias antes. Não valida se a certidão é real.
2. **Consulta automática**: integrar com a API de cada órgão emissor (Receita Federal pra CND, Caixa pra CRF/FGTS, TST pra certidão trabalhista) — três integrações diferentes, complexidade bem maior.

Recomendo começar com (1) e decidir depois se vale automatizar.

```ts
interface ComplianceDocument {
  tipo: 'cnd_federal' | 'crf_fgts' | 'certidao_trabalhista';
  vence_em: string; // ISO date
}
```
`GET/PUT /api/v1/account/company/documents?user_id=X`

## Aba 3: Assinatura

**Boa notícia: a base já está implementada e bate com a v1 deste doc.** `GET /api/v1/account/subscription?user_id=X` está em produção e o frontend já consome (ver [PlanCard.tsx](src/components/perfil/PlanCard.tsx)). O que falta é só o que o design acrescentou:

### Já implementado (v1, sem mudança)
- `GET /api/v1/account/subscription?user_id=X` — plano, status, ciclo, preço, renovação, uso de perfis. ✅
- `POST /api/v1/account/subscription/portal?user_id=X` — **ainda 404**, sem provedor de pagamento escolhido (ver decisão abaixo). O frontend já trata a falha com um toast, então isso pode esperar.

### Novo, visto no design

**Histórico de faturas** — tabela com data, número da NF-e (linkado), situação ("Paga"), valor:
```ts
interface Invoice {
  date: string;
  document_number: string; // "NF-e 1042"
  document_url: string;
  status: 'paga' | 'pendente' | 'atrasada';
  amount_cents: number;
}
```
`GET /api/v1/account/subscription/invoices?user_id=X`

**Forma de pagamento** — cartão salvo + ação de trocar:
```ts
interface PaymentMethod {
  brand: string;      // "Visa"
  last4: string;
  holder_name: string;
  expiry: string;      // "09/29"
}
```
`GET /api/v1/account/subscription/payment-method?user_id=X`
`POST /api/v1/account/subscription/payment-method` → normalmente delega pro provedor (ex: Stripe SetupIntent), não recebe o número do cartão direto.

**Cancelar assinatura** — com a regra de negócio explícita no design: *"O acesso continua até o fim do ciclo pago e seus perfis ficam guardados por 90 dias."*
`POST /api/v1/account/subscription/cancel?user_id=X` — marca `cancel_at_period_end: true`, não cancela na hora. Precisa de um job que, 90 dias após o fim do acesso, de fato apaga/arquiva os perfis de alerta.

**Limites do plano** — já tem `alert_profiles_used/limit`; o design mostra também **usuários** (`3 · ilimitado`) com barra de progresso, e **histórico** ("completo desde 2018", texto estático por plano). Adicionar ao `usage`:
```ts
users_used: number;
users_limit: number | null;
```

**"Trocar para anual e economizar 20%"** e **"Falar com vendas"** — a primeira é só trocar `billing_cycle` no checkout existente; a segunda é provavelmente um `mailto:` ou link externo, não precisa de endpoint.

## Aba 4: Equipe e segurança

**Esta é a aba que depende da mudança de modelo (organização multiusuário).** Recomendo tratar como projeto próprio — é RBAC completo, não um CRUD simples.

### Usuários da equipe

Lista com avatar (iniciais), nome, e-mail, papel, escopo, botão editar. Cabeçalho mostra contagem "Usuários · 3" e botão "Convidar usuário".

```ts
interface TeamMember {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'editor' | 'leitor';
  scope: string | null; // "Todos os perfis" (admin) / "Obras civis SP/MG" (editor com restrição) / "Somente leitura" (leitor)
}
```
- `GET /api/v1/account/team?user_id=X`
- `POST /api/v1/account/team/invite` — `{ email, role, scope? }`, dispara e-mail de convite
- `PUT /api/v1/account/team/:member_id` — trocar role/scope
- `DELETE /api/v1/account/team/:member_id` — remover da equipe

Os **três papéis são fixos** (não é um sistema de permissões customizável) — a cópia exata do design, pra manter no frontend também:
| Papel | Permissão |
|---|---|
| Administrador | Cobrança, usuários e todos os perfis |
| Editor | Cria perfis e alertas nos temas liberados |
| Leitor | Consulta e favorita, sem editar alertas |

### Segurança

- Trocar senha: **já é real hoje** via Supabase (`updateUser({password})`), não precisa de endpoint novo.
- **Verificação em duas etapas por SMS**: precisa de provedor de SMS (Twilio ou similar) — Supabase Auth tem suporte nativo a MFA/TOTP, mas SMS especificamente pode exigir plano pago do Supabase ou integração à parte. Vale checar o que já está disponível no projeto Supabase atual antes de construir algo do zero.
- **Encerrar sessões inativas em 30 dias**: política de expiração de sessão — conferir se dá pra configurar direto no Supabase Auth (JWT expiry) em vez de reimplementar.
- **Exigir Gov.br para novos usuários**: SSO com Gov.br é uma integração de escopo grande (o design-handoff já menciona "Entrar com Gov.br" no login, mas não está implementado — ver CLAUDE.md). Esse toggle depende dessa integração existir primeiro.
- **Sessões ativas** (device, localização, última atividade) + "Encerrar outras sessões": Supabase Auth expõe `listUserSessions`/`signOut(scope: 'others')` no admin SDK — antes de modelar isso do zero, checar se dá pra usar o que o Supabase já oferece.

```ts
interface ActiveSession {
  device: string;      // "Chrome · Windows"
  location: string;     // "Campinas/SP"
  last_active: string;  // "esta sessão" / "há 3 horas"
  is_current: boolean;
}
```
`GET /api/v1/account/sessions?user_id=X`
`POST /api/v1/account/sessions/revoke-others?user_id=X`

## Decisão em aberto: provedor de pagamento

(Sem mudança desde a v1 — segue travando `portal`/`checkout`/faturas/forma de pagamento.)

Não há provedor escolhido. Restrição real do produto: nota fiscal em todos os planos + boleto/empenho no Enterprise — Stripe puro não resolve nativo. Opções BR que já emitem nota fiscal: **Iugu**, **Vindi**, **Pagar.me**. Ou Stripe + serviço de NF-e à parte (NFe.io).

## Nota de segurança

Vale ainda mais agora que existem papéis: `/api/v1/alerts` e `/api/v1/favorites` confiam no `user_id` da query string, sem validar contra o Supabase. Com RBAC (Administrador vs Leitor), esse é o tipo de falha que vira "qualquer um consegue se passar por admin de qualquer empresa trocando o `user_id` na URL". **Isso precisa estar resolvido antes de qualquer endpoint de `/account/team/*` ir pro ar** — exigir `Authorization: Bearer <supabase_access_token>` validado no backend, não confiar em nada vindo do cliente sem verificação.

## Ordem sugerida de implementação

1. **Conta** (sem depender de organização): dados pessoais, preferências de busca, canais de notificação, atividade recente, uso no ciclo. Tudo por `user_id`, extensão direta do que já existe.
2. **Assinatura**: já tem a base rodando — só falta invoices/forma de pagamento (dependem do provedor) e cancelamento. Baixo risco, alto valor.
3. **Empresa e faturamento** sem integrações externas: dados cadastrais + CNAEs (CRUD simples). Deixar situação cadastral (Receita Federal) e documentos de habilitação pra depois — dependem de decisão sobre automatizar ou não.
4. **Modelagem de organização multiusuário** — pré-requisito de tudo que segue. Decidir com o time antes de escrever código: alerts/favorites passam a ser por org ou continuam por usuário com visibilidade controlada por papel?
5. **Equipe e segurança** — depende do passo 4. Maior peça do escopo todo; considerar como entrega própria, não uma tarefa a mais dentro dessa doc.
