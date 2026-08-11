# Editalis

Plataforma SaaS de monitoramento de licitações a partir de diários oficiais. Busca, alertas e favoritos sobre publicações do DOU com dados normalizados (modalidade, valor, CNPJs, UFs).

**API**: [DOU Scrapper API](https://github.com/andremichels/DOU-Scrapper-API)

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript + Tailwind
- **Auth**: Supabase Auth (localStorage sessions via `@supabase/supabase-js`)
- **API**: FastAPI no VPS (editalis-api.smartpeople.us)
- **Pagamento**: Stripe Checkout (hosted page)
- **Deploy**: Vercel (auto-deploy do branch `main`)

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page com hero, live counter, planos e FAQ |
| `/login` | Login Supabase Auth |
| `/cadastro` | Cadastro com Supabase |
| `/planos` | Planos (Essencial/Profissional/Enterprise) com toggle mensal/anual |
| `/checkout` | Stripe hosted checkout redirect |
| `/checkout/success` | Confirmação pós-pagamento com animação e redirect |
| `/dashboard` | Painel: métricas reais, artigos recentes, volume, deadlines |
| `/busca` | Full-text search + booleanos + semântica + linguagem natural + filtros |
| `/artigo/[slug]` | Detalhe: dados normalizados, itens/lotes, artigos similares (IA) |
| `/orgaos` | Lista de órgãos indexados com contagem de artigos |
| `/busca/cnpj` | Busca por CNPJ com input formatado |
| `/alertas` | CRUD de perfis de alerta + matches em tempo real |
| `/favoritos` | Lista com toggle inline via API |
| `/perfil` | 4 abas: Conta, Empresa, Assinatura, Equipe |

Todas as páginas são mobile-responsive com menu hambúrguer (< 768px).

## Features

### Busca (3 modos)
- **Keyword (FTS)**: full-text search com excertos, highlight, ordenação, filtro por data
- **Booleana**: operadores AND/OR/NOT, frases exatas, salvamento como alerta
- **IA**:
  - Busca **semântica** (híbrida FTS + vetor via pgvector, Reciprocal Rank Fusion)
  - Busca em **linguagem natural** ("pregão de TI em SP acima de 100k")
  - **Artigos similares** no detalhe (cosine similarity nos embeddings)
  - **Resumos automáticos** de 2 linhas nos resultados (extrativo, sem API)

### Alertas
- Perfis com keywords, órgãos, UFs, modalidades
- Matching automático contra novos artigos (scheduler interno na API)
- CNAE → alerta automático (mapeia keywords relevantes)

### Conta
- Perfil pessoal, dados da empresa, CNAEs
- Convite de membros por email (admin/editor/leitor)
- Stripe Customer Portal (gerenciar assinatura)
- Activity feed (favoritos + alertas)

## Quickstart

```bash
git clone https://github.com/andremichels/Editalis.git
cd Editalis
npm install
cp .env.local.example .env.local
npm run dev  # http://localhost:3000
```

### Variáveis de ambiente (`.env.local`)

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_KEY` | Chave pública (anon) |
| `NEXT_PUBLIC_API_URL` | DOU Scrapper API (default: `https://editalis-api.smartpeople.us`) |

## Arquitetura

```
Usuário → Next.js (Vercel) → DOU Scrapper API (VPS) → Supabase PostgreSQL
                ↕
         Supabase Auth
```

### Auth flow

- **Editalis**: `createClient` de `@/lib/auth` — localStorage sessions, nunca `@supabase/ssr` (cookies)
- JWT Bearer token em todas as chamadas autenticadas (`authFetch`)
- AuthGuard envolve todas as páginas logadas com `DashboardLayout`
- Modelo multi-tenant: 1 organização → N usuários com roles (admin/editor/leitor)

### Dados

TODOS os dados vêm da DOU Scrapper API — não há mais mock data. A API serve ~30.000 artigos do Diário Oficial com dados normalizados (regex-based) + embeddings semânticos + resumos:

```
Article.normalized_data = {
  doc_type, modality, process_number, object_summary,
  value, opening_date, cnpjs, ufs, keywords, contract_number, summary
}
Article.embedding = vector(384)  // pgvector para busca semântica
```

## Design System

- **Accent**: `#ec3013` (Modernist Archivo)
- **CSS Variables**: `--color-bg`, `--color-text`, `--color-accent`, `--color-neutral-*`, `--color-divider`
- **Fonts**: `var(--font-heading)` / `var(--font-body)`
- Componentes usam CSS variables, não classes Tailwind de cor diretamente

## Documentação

- [CLAUDE.md](CLAUDE.md) — arquitetura, convenções
- [DESIGN.md](DESIGN.md) — design tokens e componentes
- Obsidian: `Projects/Editalis/` (visão geral, API, database, arquitetura, pagamentos)

## Scripts

```bash
npm run dev      # dev server (Turbopack)
npm run build    # produção
npm run start    # rodar build
npm run lint     # eslint
```
