# catch-challenge

A monorepo with two independent coding challenges:

| App | Stack | What it is |
|---|---|---|
| [`apps/jamstack`](apps/jamstack) | Next.js (App Router) | Paginated GitHub repository listing |
| [`apps/be-dev`](apps/be-dev) | Hono + SQLite (`node:sqlite`) | CSV → SQLite import, paginated JSON API, async list view |

## Requirements

- **Node ≥ 24** (`apps/be-dev` uses the built-in `node:sqlite` module)
- **pnpm 10** — `corepack enable`, or see https://pnpm.io/installation

## Run both apps

```bash
pnpm install
pnpm dev
```

- jamstack → http://localhost:3000
- be-dev → http://localhost:3001 (its CSV import runs automatically on start)

To run just one: `pnpm --filter jamstack dev` or `pnpm --filter be-dev dev`.

See each app's README for details: [jamstack](apps/jamstack/README.md), [be-dev](apps/be-dev/README.md).

## Tech stack

- **Monorepo:** pnpm workspaces + [Turborepo](https://turborepo.dev)
- **Language:** TypeScript (strict)
- **Frontend:** Next.js (App Router), React, Tailwind CSS — `apps/jamstack`
- **Backend:** Hono on Node + `node:sqlite` — `apps/be-dev`
- **Lint + format:** [Biome](https://biomejs.dev)
- **Dead-code:** [Knip](https://knip.dev)
- **Tests:** [Vitest](https://vitest.dev) (unit/integration) + [Playwright](https://playwright.dev) (e2e)
- **Accessibility:** [axe](https://github.com/dequelabs/axe-core) — `@axe-core/playwright` inside the e2e suite, plus a standalone `@axe-core/cli` scan (`pnpm a11y`)

Built agentically with Claude Code (Opus 4.8, high reasoning effort, auto mode), using the
[context7](https://github.com/upstash/context7) MCP server to pull current library docs during
development.

## Checks

```bash
pnpm lint        # Biome lint + format check
pnpm typecheck   # TypeScript
pnpm test        # Vitest unit/integration
pnpm e2e         # Playwright (run `pnpm exec playwright install chromium` once first)
pnpm a11y        # axe-core/cli accessibility scan (start an app first; see app READMEs)
```
