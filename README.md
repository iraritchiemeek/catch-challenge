# catch-challenge

A local monorepo housing two coding challenges, built with the **Build Loop** workflow
(`plan → tdd → review-gate → verify`). See `PROCESS.md` for the workflow and `CLAUDE.md` for the
operating contract and tech rules.

## Apps

| Workspace | Stack | Status |
|---|---|---|
| `apps/jamstack` | Next.js (App Router), React 19, Tailwind v4 | **Done** — paginated GitHub repository listing (see [`apps/jamstack/README.md`](apps/jamstack/README.md)) |
| `apps/be-dev` | Hono on Node (`@hono/node-server`) | Skeleton — JSON API + SQLite/Drizzle + CSV import come later |

## Requirements

- **Node** ≥ 20 (developed on Node 25)
- **pnpm** 10 (`corepack enable` or see https://pnpm.io/installation) — this repo is **pnpm only**

## Setup

```bash
pnpm install
```

## Everyday commands (run from the repo root)

| Command | What it does |
|---|---|
| `pnpm dev` | Run every app's dev server (Turborepo). |
| `pnpm build` | Build every app. |
| `pnpm typecheck` | Type-check root config + every app. |
| `pnpm lint` | Biome lint + format check (no writes). |
| `pnpm format` | Biome fix + format (writes changes). |
| `pnpm test` | Run all Vitest unit/integration tests. |
| `pnpm e2e` | Run Playwright e2e + accessibility tests (boots the jamstack app automatically). |
| `pnpm a11y` | Scan the running app with `@axe-core/cli` (start the app first; see jamstack README). |
| `pnpm knip` | Dead-code / unused-dependency detection. |

### The clean-clone gate

These four must pass from a fresh clone (what `verify` checks):

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```

### Running the apps directly

```bash
pnpm --filter jamstack dev    # GitHub repo listing on http://localhost:3000
pnpm --filter be-dev dev      # Hono API on http://localhost:3000 (PORT to override)
curl http://localhost:3000/health   # be-dev health check -> {"status":"ok"}
```

The jamstack app lists the `github` org's repositories ten per page with Previous/Next
navigation. See [`apps/jamstack/README.md`](apps/jamstack/README.md) for its architecture,
the Tailwind Plus component sourcing, the GitHub API rate-limit note, and how to run the
`@axe-core/cli` accessibility scan.

### End-to-end tests (first run)

Playwright needs its browser once per machine:

```bash
pnpm exec playwright install chromium
pnpm e2e
```

## Repository layout

```
.
├── apps/
│   ├── be-dev/        # Hono on Node skeleton (src/app.ts, src/server.ts)
│   └── jamstack/      # Next.js App Router skeleton (app/, lib/, e2e/)
├── .claude/skills/    # Build Loop stages: plan, tdd, review-gate, verify
├── evals/rubric.md    # The bar every unit of work is judged against
├── biome.json         # Lint + format
├── knip.json          # Dead-code detection
├── turbo.json         # Task pipeline
├── tsconfig.base.json # Shared strict TypeScript config
├── vitest.config.ts   # Unit test projects (one per app)
└── playwright.config.ts  # e2e + accessibility
```

## Starting a challenge

Work always begins with the planning stage:

```
/plan <task brief or path to the brief>
```

Then follow the loop through `tdd → review-gate → verify`.
