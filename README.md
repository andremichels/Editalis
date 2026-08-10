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

| Rota | Status | Descrição |
|------|--------|-----------|
| `/` | ✅ | Landing page com hero, planos e FAQ |
| `/login` | ✅ | Login Supabase Auth |
| `/cadastro` | ✅ | Cadastro com Supabase |
| `/dashboard` | ✅ | Métricas reais, artigos recentes, volume |
| `/busca` | ✅ | Full-text search + filtros + paginação |
| `/artigo/[slug]` | ✅ | Detalhe com dados normalizados (modalidade, valor, UFs) |
| `/alertas` | ✅ | CRUD de perfis + matches em tempo real |
| `/favoritos` | ✅ | Lista com toggle inline via API |
| `/perfil` | ✅ | 4 abas: Conta, Empresa, Assinatura, Equipe |
| `/planos` | ⬜ | Página de planos + checkout Stripe |
| `/checkout` | ✅ | Stripe hosted checkout redirect |

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
- AuthGuard envolve todas as páginas logadas com `DashboardLayout`
- Modelo multi-tenant: 1 organização → N usuários com roles (admin/editor/leitor)

### Dados

TODOS os dados vêm da DOU Scrapper API — não há mais mock data. A API serve ~25.000 artigos do Diário Oficial com dados normalizados (regex-based):

```
Article.normalized_data = {
  doc_type, modality, process_number, object_summary,
  value, opening_date, cnpjs, ufs, keywords, contract_number
}
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
