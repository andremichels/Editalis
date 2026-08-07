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
  - `/dashboard` ("Painel"), `/busca`, `/alertas`, `/favoritos`, `/perfil`, `/artigo/[slug]` — the authenticated app, reached after login. `/perfil` (account data, password, plan) has no design-handoff screen to match — it was built to fit the existing Modernist system, not extracted from the prototype like the others; its "Plano e cobrança" section is still mock, see [ACCOUNT_API.md](ACCOUNT_API.md) for the backend work needed to finish it. `/artigo/[slug]` (real DOU article reader, see Data below) is gated behind `AuthGuard` — it is **not** public — and reuses the "Detalhe" pattern originally built for the (now-retired) mock licitação page (header + content/meta split), adapted to the article's actual fields (no PDF download — doesn't exist for real articles).
  - `/licitacao/[id]` and its `bids.ts`/`components/licitacao/` still exist on disk but are **orphaned** — nothing links to them anymore now that `/busca`, `/dashboard`, and `/favoritos` all point at real articles (`/artigo/[slug]`) instead. Same for `components/dashboard/BidList.tsx`. Treat these as removal candidates, not a pattern to extend.
- **Two layout shells**, in [src/components/layout/PageLayout.tsx](src/components/layout/PageLayout.tsx) and [DashboardLayout.tsx](src/components/layout/DashboardLayout.tsx) — pick the one that matches where a page lives:
  - `MarketingLayout` — sticky top nav + footer (`MarketingHeader`/`MarketingFooter` in [Header.tsx](src/components/layout/Header.tsx)), used only by `/`.
  - `DashboardLayout` — dark left [Sidebar](src/components/dashboard/Sidebar.tsx) (232px, nav + signed-in user footer) + content area, used by every authenticated page. Wrap page content in `<AuthGuard><DashboardLayout>…</DashboardLayout></AuthGuard>`.
  - The plain `PageLayout`/`Header`/`Footer` trio in the same files is legacy and currently **unused by any page** — nothing imports it anymore now that `/artigo/[slug]` moved to `DashboardLayout`. Don't reach for it; it's a removal candidate, not a pattern to follow.
- **Auth**: Supabase (`@supabase/supabase-js`), client configured in [src/lib/auth.ts](src/lib/auth.ts). Auth is enforced client-side via [src/components/AuthGuard.tsx](src/components/AuthGuard.tsx), which checks `supabase.auth.getSession()` in a `useEffect` and redirects to `/login` if unauthenticated. There is intentionally no server middleware for auth — a prior attempt using middleware cookies was removed (see commit `73bafd5`) because it didn't work; wrap protected pages in `<AuthGuard>` instead.
- **Data**: almost everything in the authenticated app now hits the same external `editalis-api` service (`NEXT_PUBLIC_API_URL`, defaults to `https://editalis-api.smartpeople.us`) — it started as a "DOU Scrapper API" but has grown well beyond scraping. It is **not** protected by a real auth check: endpoints take the Supabase `user_id` as a plain query string (`?user_id=...`) with no server-side token verification. Treat any endpoint that reads/writes per-user data as trusting the client — see the security note in [ACCOUNT_API.md](ACCOUNT_API.md) before adding anything billing-related.
  - DOU articles: [src/lib/api.ts](src/lib/api.ts) (`searchArticles`, `getArticle`, `getRecentArticles`, `getStats`, `getOrgans`, `searchByCNPJ`). Types in [src/lib/types.ts](src/lib/types.ts) (`Article`, `Organ`, `SearchResponse`) — `Article.normalized_data` (doc type, modality, process/contract number, value, opening date, UFs, keywords, CNPJs) is populated by the API for *some* articles, not all; always guard for it being `undefined`, don't assume it's there.
  - `/busca` searches `/api/v1/search` for real (full-text, filters, pagination) — it is **not** mock data anymore.
  - `/alertas` is a real CRUD against `/api/v1/alerts` (create/edit/pause/delete a saved-search profile, preview matches) — also not mock.
  - `/favoritos` and the ★ buttons scattered around ([FavoriteButton.tsx](src/components/ui/FavoriteButton.tsx), [useFavorites.ts](src/lib/useFavorites.ts)) are real too: localStorage-first for instant UI, synced to `/api/v1/favorites` in the background.
  - `/dashboard` is real except one card: "Prazos desta semana" (`DeadlinesCard`) is still the original hardcoded mock array in `dashboard/page.tsx` — everything else on that page (stats, recent articles, volume-per-day, monitored profiles) now calls the API.
  - `/perfil`'s account/password forms are real Supabase user data (`user_metadata.nome`/`cnpj`, email, password) via `getUser()`/`updateUser()` — no custom backend involved. Its "Plano e cobrança" card is still 100% mock; that's the one piece of this app with no real data source at all right now. See [ACCOUNT_API.md](ACCOUNT_API.md).
  - `src/components/articles/` (`ArticleCard`, `ArticleList`) and `src/components/search/` (`SearchBar`) are still **unused** — leftover from before the landing page became pure marketing.
- **Components**, organized by domain under `src/components/`:
  - `ui/` — generic primitives (Button, Badge, Card, Input, FormField, SegmentedControl, FavoriteButton).
  - `layout/` — `Header` (both marketing and legacy nav variants), `PageLayout`/`MarketingLayout`/`DashboardLayout`.
  - `auth/` — `AuthPromoPanel`, `LoginForm`, `CadastroForm` (used by `/login`).
  - `dashboard/` — `Sidebar`, `MetricsBar`, `DeadlinesCard`, `ProfilesCard`, `VolumeChart` (used by `/dashboard`). `BidList.tsx` also lives here but is orphaned, see above.
  - `busca/` — `SearchHeader`, `SearchFilters`, `SearchResultsHeader`, `SearchResultItem`, `Pagination` (real search).
  - `alertas/` — `AlertForm`, `AlertCard`, `MatchesList` (real CRUD).
  - `licitacao/` — `BidDetailHeader`, `BidObjectSection`, `BidSidebar` — orphaned along with `/licitacao/[id]`, see above.
  - `perfil/` — `AccountForm`, `PasswordForm`, `PlanCard` (used by `/perfil`).
  - `artigo/` — `ArticleDetailHeader`, `ArticleContent`, `ArticleMeta` (used by `/artigo/[slug]`).
  - `articles/` (ArticleCard, ArticleList) and `search/` (SearchBar) — unused, see Data above.
  - [Toast.tsx](src/components/Toast.tsx) — app-wide toast notifications, `ToastProvider` wraps the app in `layout.tsx`; use the `useToast()` hook rather than adding another feedback mechanism.
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

`design-handoff/Editalis.dc.html` is an interactive prototype with its own top tab bar (Landing / Entrar / Checkout / Painel / Busca / Detalhe / Alertas / Mobile) — that bar is prototype-tool chrome, not part of the real site. Click a tab (or drive it via `document.querySelectorAll('button')`, since the tabs aren't uniquely labeled in the DOM) to inspect that screen's real markup/inline styles. Landing, Entrar, Painel, Busca, Detalhe, and Alertas are all implemented (`/`, `/login`, `/dashboard`, `/busca`, `/artigo/[slug]`, `/alertas`) and now run on real data end to end. `/licitacao/[id]` was the original build of the Detalhe pattern against mock data; it's orphaned now that `/artigo/[slug]` covers the same pattern for real articles (see Data above). **Checkout** (a 3-step plan/payment/confirmation flow) is designed but intentionally not built — it reads as onboarding/billing rather than the logged-in app. **Mobile** isn't a separate screen; it's a note showing how Painel/Busca/Detalhe should adapt below ~390px (bottom tab bar, filters in a bottom sheet) — none of the implemented pages have that responsive treatment yet, they're desktop-first.
