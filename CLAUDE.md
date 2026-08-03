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
- Pages: `/` (landing/search), `/dashboard` (authenticated results dashboard), `/login`, `/cadastro` (signup), `/artigo/[slug]` (article detail).
- **Auth**: Supabase (`@supabase/supabase-js`), client configured in [src/lib/auth.ts](src/lib/auth.ts). Auth is enforced client-side via [src/components/AuthGuard.tsx](src/components/AuthGuard.tsx), which checks `supabase.auth.getSession()` in a `useEffect` and redirects to `/login` if unauthenticated. There is intentionally no server middleware for auth — a prior attempt using middleware cookies was removed (see commit `73bafd5`) because it didn't work; wrap protected pages in `<AuthGuard>` instead.
- **Data**: the DOU content itself does not come from Supabase — it's fetched from an external "DOU Scrapper API" via [src/lib/api.ts](src/lib/api.ts) (`searchArticles`, `getArticle`, `getOrgans`, `searchByCNPJ`), base URL from `NEXT_PUBLIC_API_URL` (defaults to `https://editalis-api.smartpeople.us`). Shared response types live in [src/lib/types.ts](src/lib/types.ts) (`Article`, `Organ`, `SearchResponse`) — keep these in sync with the API's actual response shape rather than assuming.
- **Components**: `src/components/ui/` (Button, Badge, Card, Input — generic primitives), `src/components/layout/` (Header, PageLayout), `src/components/articles/` (ArticleCard, ArticleList), `src/components/search/` (SearchBar).
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
