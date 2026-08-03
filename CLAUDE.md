# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Editalis — a search UI for Brazil's Diário Oficial da União (DOU). Users search official government publications (portarias, licitações, nomeações, etc.) by keyword, organ, date range, or CNPJ.

## Commands

```bash
npm run dev      # start dev server (Next.js, localhost:3000)
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

There is no test suite configured.

## Critical: Next.js version

This repo runs **Next.js 16.2.12**, not the version in your training data. APIs, conventions, and file structure may differ from what you expect. Before writing or changing any Next.js-specific code (routing, data fetching, config, metadata, etc.), read the relevant guide under `node_modules/next/dist/docs/` (organized into `01-app`, `02-pages`, `03-architecture`, `04-community`). Heed any deprecation notices found there. Do not assume older Next.js patterns (e.g. from Next 13/14) still apply.

## Architecture

- **App Router** (`src/app/`), TypeScript, React 19, Tailwind CSS v4.
- **Pages**:
  - `/` — public marketing landing page (hero, pricing, FAQ).
  - `/login` — unified auth screen with an Entrar/Criar conta tab toggle (`/cadastro` just redirects here).
  - `/dashboard` ("Painel"), `/busca`, `/alertas`, `/licitacao/[id]`, `/perfil`, `/artigo/[slug]` — the authenticated app, reached after login. `/perfil` (account data, password, plan) has no design-handoff screen to match — it was built to fit the existing Modernist system, not extracted from the prototype like the others. `/artigo/[slug]` (real DOU article reader, see Data below) is gated behind `AuthGuard` — it is **not** public — and reuses the "Detalhe" pattern from `/licitacao/[id]` (header + content/meta split), adapted to the article's actual fields (no favoriting or PDF download, since neither exists for real articles).
- **Two layout shells**, in [src/components/layout/PageLayout.tsx](src/components/layout/PageLayout.tsx) and [DashboardLayout.tsx](src/components/layout/DashboardLayout.tsx) — pick the one that matches where a page lives:
  - `MarketingLayout` — sticky top nav + footer (`MarketingHeader`/`MarketingFooter` in [Header.tsx](src/components/layout/Header.tsx)), used only by `/`.
  - `DashboardLayout` — dark left [Sidebar](src/components/dashboard/Sidebar.tsx) (232px, nav + signed-in user footer) + content area, used by every authenticated page. Wrap page content in `<AuthGuard><DashboardLayout>…</DashboardLayout></AuthGuard>`.
  - The plain `PageLayout`/`Header`/`Footer` trio in the same files is legacy and currently **unused by any page** — nothing imports it anymore now that `/artigo/[slug]` moved to `DashboardLayout`. Don't reach for it; it's a removal candidate, not a pattern to follow.
- **Auth**: Supabase (`@supabase/supabase-js`), client configured in [src/lib/auth.ts](src/lib/auth.ts). Auth is enforced client-side via [src/components/AuthGuard.tsx](src/components/AuthGuard.tsx), which checks `supabase.auth.getSession()` in a `useEffect` and redirects to `/login` if unauthenticated. There is intentionally no server middleware for auth — a prior attempt using middleware cookies was removed (see commit `73bafd5`) because it didn't work; wrap protected pages in `<AuthGuard>` instead.
- **Data — real DOU content and mock "licitação" content are separate models, don't conflate them**:
  - Real DOU articles come from an external "DOU Scrapper API" via [src/lib/api.ts](src/lib/api.ts) (`searchArticles`, `getArticle`, `getRecentArticles`, `getStats`, `getOrgans`, `searchByCNPJ`), base URL from `NEXT_PUBLIC_API_URL` (defaults to `https://editalis-api.smartpeople.us`). Shared response types live in [src/lib/types.ts](src/lib/types.ts) (`Article`, `Organ`, `SearchResponse`) — keep these in sync with the API's actual response shape rather than assuming. `/artigo/[slug]` renders a single article via `getArticle`; `/dashboard`'s header metrics and "Publicações recentes" list use `getStats`/`getRecentArticles`.
  - Everything else in the authenticated app (`/busca`, `/alertas`, `/licitacao/[id]`, and the rest of `/dashboard` — deadlines, monitored profiles, volume chart) is **static mock data**: [src/lib/bids.ts](src/lib/bids.ts) (`bids`, `getBidById`) and [src/lib/alertProfiles.ts](src/lib/alertProfiles.ts) (`alertProfiles`, `favoritasDestaque`). These "licitação" bids are not real records from any backend — don't assume `/dashboard`'s right-hand sidebar or `/busca`/`/alertas`/`/licitacao` reflect real data just because the metrics/article list next to them do. `/perfil`'s account/password forms are the other exception — real Supabase user data (`user_metadata.nome`/`cnpj`, email, password) via `getUser()`/`updateUser()`; its plan card is still mock.
  - `src/components/articles/` (`ArticleCard`, `ArticleList`) and `src/components/search/` (`SearchBar`) are currently **unused** — leftover from before the landing page became pure marketing. Don't assume they're wired into any route.
- **Components**, organized by domain under `src/components/`:
  - `ui/` — generic primitives (Button, Badge, Card, Input, FormField, SegmentedControl).
  - `layout/` — `Header` (both marketing and legacy nav variants), `PageLayout`/`MarketingLayout`/`DashboardLayout`.
  - `auth/` — `AuthPromoPanel`, `LoginForm`, `CadastroForm` (used by `/login`).
  - `dashboard/` — `Sidebar`, `MetricsBar`, `BidList`, `DeadlinesCard`, `ProfilesCard`, `VolumeChart` (used by `/dashboard`).
  - `busca/` — `SearchHeader`, `SearchFilters`, `SearchResultsHeader`, `SearchResultItem`, `Pagination`.
  - `alertas/` — `AlertProfileCard`, `SendPreferences`, `FavoritesSidebar`.
  - `licitacao/` — `BidDetailHeader`, `BidObjectSection`, `BidSidebar` (used by `/licitacao/[id]`, mock data).
  - `perfil/` — `AccountForm`, `PasswordForm`, `PlanCard` (used by `/perfil`).
  - `artigo/` — `ArticleDetailHeader`, `ArticleContent`, `ArticleMeta` (used by `/artigo/[slug]`, mirrors the `licitacao/` header+content/meta pattern but backed by real DOU data).
  - `articles/` (ArticleCard, ArticleList) and `search/` (SearchBar) — unused, see Data above.
- Path alias `@/*` → `src/*` (see [tsconfig.json](tsconfig.json)).

## Design system

Pages are built to match a design handoff (see [DESIGN.md](DESIGN.md) and `design-handoff/`) — a flat, architectural "Modernist" style. Tokens live in [src/app/globals.css](src/app/globals.css) as CSS variables mapped into Tailwind v4 via `@theme inline`. Key constraints to preserve when styling or adding UI:

- **Zero border radius everywhere** (`--radius-*: 0px`) — no rounded corners.
- **Archivo** is the only font (headings weight 800, via `next/font/google`); don't introduce other font families.
- Labels/text are flush left, never centered — including inside buttons.
- Section dividers are strong 2px rules (`.divider` / `var(--color-divider)`), not soft borders.
- Photos use `.grayscale-img` (grayscale + contrast), never full color.
- Colors come from the neutral/accent tonal ramps (`--color-neutral-100..900`, `--color-accent-100..900`) — prefer ramp steps over ad-hoc hex values.
- Focus rings are always the accent color (`#ec3013`), never the browser default blue.

If a UI task's requirements aren't covered above, check [DESIGN.md](DESIGN.md) and `design-handoff/Editalis.dc.html` before improvising.

`design-handoff/Editalis.dc.html` is an interactive prototype with its own top tab bar (Landing / Entrar / Checkout / Painel / Busca / Detalhe / Alertas / Mobile) — that bar is prototype-tool chrome, not part of the real site. Click a tab (or drive it via `document.querySelectorAll('button')`, since the tabs aren't uniquely labeled in the DOM) to inspect that screen's real markup/inline styles. Landing, Entrar, Painel, Busca, Detalhe, and Alertas are all implemented (`/`, `/login`, `/dashboard`, `/busca`, `/licitacao/[id]`, `/alertas`). The Detalhe pattern is used twice — once for the mock licitação (`/licitacao/[id]`) and once for real DOU articles (`/artigo/[slug]`). **Checkout** (a 3-step plan/payment/confirmation flow) is designed but intentionally not built — it reads as onboarding/billing rather than the logged-in app. **Mobile** isn't a separate screen; it's a note showing how Painel/Busca/Detalhe should adapt below ~390px (bottom tab bar, filters in a bottom sheet) — none of the implemented pages have that responsive treatment yet, they're desktop-first.
