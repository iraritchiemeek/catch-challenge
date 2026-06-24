# Project conventions

Work in this repo follows the **Build Loop**. See `PROCESS.md` for the full description; this file is
the short operating contract. _(Build Loop is a working name and can be changed later — keep it in sync
with `PROCESS.md`.)_

> This file pairs **workflow conventions** (the Build Loop, below) with the **tech + quality rules**
> for the monorepo (further down). The tech rules were added by the scaffold setup pass; the stage
> skills in `.claude/skills/` now use the real commands listed under **Commands**.

## The default way of working

For every unit of work, run the loop:

```
plan → tdd → review-gate ──pass──→ verify → done
                  │
             return-to-stage
```

1. **Read the skill before running its stage.** Each stage lives at
   `.claude/skills/<name>/SKILL.md`: `plan`, `tdd`, `review-gate`, `verify`.
2. **plan first.** No implementation before an approved `plan.md`.
3. **tdd, test-first.** RED → GREEN → REFACTOR; show each test failing before the code that passes it.
4. **review-gate** judges the work against `evals/rubric.md`. `pass` → `verify`; any
   `return-to-*` → re-enter that stage.
5. **verify** from a clean clone, recording evidence to `verify.md`.

## The bar

`evals/rubric.md` is the standard every unit of work is judged against. Treat it as the definition of
done. It is versioned; **edits to it must be deliberate.**

## Conventions

- **Artifacts are files, not chat.** `plan.md`, `review.json`, and `verify.md` are the durable
  outputs. If it matters, write it down.
- **The review gate is independent.** Reviewers judge only what the rubric asks and do not grade their
  own work.

## Starting a task

Invoke the first stage:

```
/plan <task brief or path to the brief>
```

Then follow the loop through to `verify`.

---

# Tech + quality rules

These rules govern *how* code is written in this repo; the Build Loop above governs *how work flows*.

## Stack

- **Monorepo:** pnpm workspaces (`apps/*`) + Turborepo (`turbo.json`). **pnpm only** — never `npm`/`yarn`.
- **Language:** TypeScript, **strict** everywhere. The shared base is `tsconfig.base.json`; every package
  extends it. Hardened flags are on (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noUnusedLocals/Parameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noImplicitOverride`).
- **Lint + format:** **Biome** (`biome.json`) — one tool for both. No ESLint/Prettier/oxlint.
- **Dead code:** **Knip** (`knip.json`).
- **Tests:** **Vitest** for unit/integration (root `vitest.config.ts`, one project per app), **Playwright**
  for e2e + accessibility (root `playwright.config.ts`).
- **Apps:** `apps/jamstack` — Next.js (App Router). `apps/be-dev` — Hono on Node (`@hono/node-server`).

## Commands (run from the repo root)

| Command | What it does |
|---|---|
| `pnpm install` | Install all workspace dependencies. |
| `pnpm dev` | Run every app's dev server (`turbo run dev`). |
| `pnpm build` | Build every app (`turbo run build`). |
| `pnpm typecheck` | Type-check root config + every app (`tsc --noEmit` + `turbo run typecheck`). |
| `pnpm lint` | Biome lint + format check, no writes (`biome check`). |
| `pnpm format` | Biome fix + format, writing changes (`biome check --write`). |
| `pnpm test` | Run all Vitest unit/integration tests (`vitest run`). |
| `pnpm test:watch` | Vitest in watch mode. |
| `pnpm e2e` | Run Playwright e2e/accessibility tests (boots the app via `webServer`). |
| `pnpm knip` | Dead-code / unused-dependency detection. |

The clean-clone gate (what `verify` must see pass) is: `pnpm install`, `pnpm lint`, `pnpm typecheck`,
`pnpm test`.

## Workflow rules

1. **After every edit:** run `pnpm lint` (Biome is sub-second) to catch issues immediately.
2. **After a round of changes:** run `pnpm typecheck`.
3. **Before committing:** the gate is green — `pnpm lint && pnpm typecheck && pnpm test`.
4. **Scope discipline:** touch the minimum files necessary; don't refactor unrelated code.
5. **One concern per commit:** keep functional changes separate from formatting/lint churn.

## Code patterns — wrong vs right

**Indexed access is `T | undefined` (`noUncheckedIndexedAccess`).** Guard before use.

```ts
// Wrong — assumes the element exists
const first = rows[0].name;

// Right — guard, then use
const first = rows[0];
if (!first) throw new Error("expected at least one row");
return first.name;
```

**Hono: read bindings/config off the context, not module scope.** Keeps the app testable via
`app.request()`.

```ts
// Wrong — module-level singletons make the app hard to test/configure
import { db } from "./db";
app.get("/x", (c) => c.json(db.query()));

// Right — keep the app pure; inject via context/closure
export const app = new Hono();
app.get("/health", (c) => c.json({ status: "ok" }));
```

**Next.js App Router: components are Server Components by default.** Add `"use client"` only when you
need browser APIs/state — and keep it at the leaf, not the page root.

```tsx
// Wrong — forces the whole page to the client for one button
"use client";
export default function Page() { /* ... */ }

// Right — server page, client only where interactivity lives
export default function Page() { return <Counter />; } // Counter.tsx has "use client"
```

## Known quality patterns

- `apps/jamstack/next-env.d.ts` is **generated by Next.js** — do not edit; it's git-ignored and excluded
  from Biome.
- Build output (`.next/`, `dist/`, `.turbo/`, `coverage/`, `playwright-report/`) is git-ignored and
  excluded from Biome and Knip.
- Vitest only collects `*.test.ts` (unit); Playwright only collects `*.spec.ts` under `e2e/`. Keep the
  suffixes distinct so the two runners never pick up each other's files.
