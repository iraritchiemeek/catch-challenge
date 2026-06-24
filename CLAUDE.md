# Project conventions

Work in this repo follows the **Build Loop**. See `PROCESS.md` for the full description; this file is
the short operating contract. _(Build Loop is a working name and can be changed later — keep it in sync
with `PROCESS.md`.)_

> This file covers **workflow conventions only**. Tech rules (language, package manager, lint/test/run
> commands) are intentionally absent and are added by a later setup pass. Skills use `<placeholder>`
> commands until then.

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
