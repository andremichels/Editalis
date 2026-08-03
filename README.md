# Editalis

Busca no Diário Oficial da União (DOU) — pesquisa de portarias, licitações, nomeações e outros atos oficiais por palavra-chave, órgão, data ou CNPJ.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # se existir; senão veja as variáveis abaixo
npm run dev                        # http://localhost:3000
```

### Variáveis de ambiente (`.env.local`)

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (auth) |
| `NEXT_PUBLIC_SUPABASE_KEY` | Chave pública (anon) do Supabase |
| `NEXT_PUBLIC_API_URL` | Base da DOU Scrapper API (opcional — tem default) |

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run start    # roda o build de produção
npm run lint     # eslint
```

Não há suíte de testes configurada.

## Estado do projeto

A área logada (`/dashboard`, `/busca`, `/alertas`, `/licitacao/[id]`) roda inteiramente sobre dados mock (`src/lib/bids.ts`, `src/lib/alertProfiles.ts`) — ainda não está conectada a um backend real de licitações. Já a landing (`/`) e a leitura de artigo (`/artigo/[slug]`) usam dados reais do DOU via API externa.

## Documentação

- [CLAUDE.md](CLAUDE.md) — arquitetura, layouts, fontes de dados, convenções.
- [DESIGN.md](DESIGN.md) — sistema de design (tokens, tipografia, componentes).
- `design-handoff/` — protótipo interativo original de onde o design foi extraído.
