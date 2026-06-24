---
name: review-gate
description: The eval centerpiece of the Build Loop. Reads evals/rubric.md and spawns several independent reviewer subagents, each with a distinct lens (correctness, security/performance, simplicity/maintainability, docs/setup-smoothness). Each returns a structured per-lens verdict and judges only what the rubric asks. Aggregate to a routing recommendation — pass, return-to-plan, return-to-tdd, or return-to-verify.
---

# review-gate — independent, rubric-driven review

The eval centerpiece of the Build Loop. Judge a completed unit of work against `evals/rubric.md`
using several **independent** reviewer subagents, then aggregate their verdicts into a routing
recommendation. This is the gate that decides whether work proceeds to `verify` or goes back.

## Artifact

A review report written to `review.json` at the repo root (or under the relevant package),
containing each per-lens verdict and the aggregate routing recommendation in the shapes below.

## Why independent lenses

Diverse reviewers catch failure modes that redundant ones miss: a correctness reviewer and a
security reviewer fail on different things, so together they cover more than two correctness
reviewers would. Independence also stops a reviewer from grading its own work — the gate must be a
judge, not the author re-reading their code. Each lens is given only the rubric criteria it is
responsible for and is told to judge **only what the rubric asks**, nothing it personally would
have done differently.

## The lenses

Spawn one subagent per lens. Each reads `evals/rubric.md` and the work under review, and judges the
rubric criteria within its remit:

1. **correctness** — does it do what the brief and acceptance criteria require? Tests meaningful and
   passing? (Rubric: Comprehension, Tests, parts of General code quality.)
2. **security/performance** — security, performance, SEO, accessibility considerations appropriate to
   scope. (Rubric: Security / Performance / SEO / Accessibility.)
3. **simplicity/maintainability** — clean, simple, typed, maintainable code; sound framework choices;
   sensible organisation. (Rubric: Code is clean…, Selection of frameworks, General code quality.)
4. **docs/setup-smoothness** — can a newcomer set up and run it from the README? Architecture and
   decisions documented? Package/git practices sound? (Rubric: Setup/running…, Documentation and
   architecture, Good package management and git practices.)

Each subagent must be independent (its own context) and must return **only** the structured verdict
below — no prose outside the schema.

## Per-lens verdict shape

Each reviewer subagent returns exactly:

```json
{
  "lens": "correctness",
  "verdict": "pass",
  "confidence": 0.0,
  "findings": [
    {
      "severity": "info",
      "message": "what is wrong or noteworthy, tied to a rubric criterion",
      "pointer": "file:line"
    }
  ]
}
```

- `lens` — one of `correctness` | `security/performance` | `simplicity/maintainability` | `docs/setup-smoothness`.
- `verdict` — `pass` or `fail`.
- `confidence` — float `0.0`–`1.0`.
- `findings[].severity` — `info` | `warning` | `error`.
- `findings[].pointer` — `file:line` (or artifact path / command output reference).

## Aggregate shape

Aggregate the per-lens verdicts into:

```json
{
  "aggregate": "pass",
  "rationale": "one-line summary of the routing decision",
  "lenses": [ /* the per-lens verdicts above */ ],
  "blocking_findings": [ /* any error-severity findings that forced a non-pass */ ]
}
```

- `aggregate` — one of `pass` | `return-to-plan` | `return-to-tdd` | `return-to-verify`.

## Aggregation rule (exact)

1. **Any `error`-severity finding** in any lens → **block the pass**.
2. **A majority of lenses returning `fail`** → **block the pass**.
3. If blocked, route to the earliest stage that can fix the dominant problem:
   - Misunderstanding of the brief / missing or wrong acceptance criteria → `return-to-plan`.
   - Implementation or test defects (correctness, missing tests, messy code) → `return-to-tdd`.
   - Works in review but setup/runtime evidence is missing or weak → `return-to-verify`.
4. Otherwise → `pass`, and the work proceeds to `verify`.

Record the chosen route and its rationale in the aggregate.

## Definition of done for this stage

- One independent verdict per lens, each in the per-lens shape, judging only its rubric criteria.
- An aggregate with a routing recommendation produced by the exact aggregation rule above.
- The report written to `review.json`.

## Next stage

`pass` → `verify`. Any `return-to-*` → re-enter that stage and run the loop forward again.
