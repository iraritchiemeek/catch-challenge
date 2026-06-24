# Plan: Build Loop monorepo scaffold & tooling

## Task brief
Conversation task brief: "Set up the Build Loop monorepo scaffold and tooling so the workflow is
runnable — stop before building the challenge features." Repo conventions: `CLAUDE.md`, `PROCESS.md`.

## Acceptance criteria (verbatim from brief)
- [ ] `pnpm install`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` all succeed from a clean clone.
- [ ] No `<placeholder>` remains in `.claude/skills/` or `CLAUDE.md`; the commands there match real scripts.
- [ ] `CLAUDE.md` keeps the Build Loop conventions and gains the tech + quality rules.
- [ ] Git history is a clean series of one-commit-per-step.
- [ ] Final report: the commands wired in, what each app skeleton contains, and the exact next step to start challenge one (`/plan <brief>`).

## Approach
Build the monorepo bottom-up so each commit leaves the workspace in a runnable state: root workspace +
Turborepo + strict base `tsconfig` first, then Biome (lint+format), then the quality pass
(`/setup-agentic-quality` → Knip + tsconfig hardening, adapted to Biome), then test tooling (Vitest +
Playwright), then the two app skeletons, then wire the real commands into the skill placeholders and
merge CLAUDE.md. Root scripts are thin Turborepo pass-throughs (`turbo run <task>`) so adding the
challenge apps later needs no root changes.

This is scaffold/infra work, so "TDD" is interpreted honestly: the proving tests are (a) a per-app
**smoke test** (Vitest) that fails before the app skeleton exists and passes after, (b) a Playwright
**e2e smoke** against the jamstack page, and (c) the brief's own definition of done — the four root
scripts succeeding from a clean clone, which is exercised in the `verify` stage. I will not invent
unit tests for static config files; instead each config step is verified by running its command and
showing it fail (RED: command/script missing) then pass (GREEN: configured).

Trade-offs accepted: Biome replaces the oxlint+Prettier pair that `/setup-agentic-quality` installs by
default (one tool, less config drift); Knip and tsconfig hardening from that skill are kept. No
challenge features (no Drizzle schema, no CSV import, no GitHub fetch, no pagination) — only enough app
skeleton that the root scripts resolve and run.

Tool versions and exact config are confirmed via **context7** at implementation time (Next.js,
Turborepo, Biome, Vitest, Playwright, Hono) rather than from memory.

## Decomposition
Each numbered step is one commit.

1. **Workspace root** — `pnpm-workspace.yaml` (`apps/*`), root `package.json` (private, `packageManager`,
   Turborepo dev dep, scripts: `dev/build/test/lint/typecheck/e2e/format/check`), `turbo.json` pipeline,
   `tsconfig.base.json` (strict), root `tsconfig.json`, `.gitignore`.
   *Verified by:* `pnpm install` succeeds; `pnpm turbo run build --dry` resolves the (empty) graph.
2. **Biome** — `biome.json` at root (lint + format), root `lint`/`format`/`check` scripts call Biome.
   *Verified by:* `pnpm lint` runs clean on the repo (RED first: script absent).
3. **Quality pass** — run `/setup-agentic-quality`; keep Knip (`knip.json`) + tsconfig hardening; drop its
   oxlint/Prettier in favour of Biome; merge its CLAUDE.md output into existing `CLAUDE.md` without
   clobbering the Build Loop conventions.
   *Verified by:* `pnpm knip` runs; `pnpm typecheck` passes; CLAUDE.md still contains the Build Loop section.
4. **Test tooling** — root Vitest config (workspace-aware) + Playwright config (`webServer` boots jamstack),
   root `test` (vitest) and `e2e` (playwright) scripts.
   *Verified by:* `pnpm test` passes (initially zero/one trivial test), `pnpm e2e` is invokable.
5. **apps/be-dev skeleton** — minimal Hono-on-Node app (`src/index.ts` with a health route), `package.json`,
   `tsconfig.json` extending base, a Vitest smoke test asserting the health route returns 200.
   *Verified by:* RED (smoke test fails — no app) → GREEN (route returns 200); `pnpm test` includes it.
6. **apps/jamstack skeleton** — minimal Next.js App Router app (`app/layout.tsx`, `app/page.tsx`),
   `package.json`, `tsconfig.json` extending base, a Vitest unit smoke test + a Playwright e2e smoke
   (page loads, has a heading, basic a11y assertion).
   *Verified by:* RED (smoke fails) → GREEN; `pnpm test` + `pnpm e2e` pass.
7. **Wire skills + finalise CLAUDE.md** — replace every `<placeholder>` in `.claude/skills/*/SKILL.md`
   and `CLAUDE.md` with the real commands; confirm the tech/quality rules are documented.
   *Verified by:* `grep -r '<placeholder>\|<fast .*command>\|<.*command>' .claude CLAUDE.md` returns nothing.

## Test strategy
| Acceptance criterion | Test(s) | Level |
|---|---|---|
| Root scripts succeed from clean clone | Run `pnpm install/lint/typecheck/test` in a fresh clone (verify stage) | e2e / process |
| be-dev skeleton runs | Vitest smoke: Hono health route → 200 | unit/integration |
| jamstack skeleton runs | Vitest unit smoke + Playwright e2e: page loads, heading present, a11y check | unit + e2e |
| No `<placeholder>` remains | `grep` over `.claude/skills/` and `CLAUDE.md` returns empty | static check |
| CLAUDE.md keeps Build Loop + gains tech rules | grep for "Build Loop" section + presence of tech/quality sections | static check |
| Clean one-commit-per-step history | `git log --oneline` shows the 7 scoped commits | review |

## Open questions (resolved at approval)
1. **Biome vs the skill's default formatter** — RESOLVED: Biome for both lint+format, replacing the
   skill's oxlint/Prettier. (Per brief.)
2. **e2e in the must-pass set** — RESOLVED: `pnpm e2e` (Playwright) is wired and invokable, exercised in
   `verify`, but NOT a clean-clone hard gate. The hard gate stays install/lint/typecheck/test.
3. **Branch** — RESOLVED: `chore/build-loop-scaffold`.

## Approval
- [x] Approved by iraritchiemeek on 2026-06-24
- Feedback: Use recommended defaults for all three open questions (Biome for both; e2e wired but not a
  hard gate; branch `chore/build-loop-scaffold`).
