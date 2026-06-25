# The Build Loop

**The Build Loop** is the way work is done in this repo. _(Working name — it can be changed later;
if you rename it, update this file and `CLAUDE.md` together.)_ It models software work as a short,
disciplined pipeline: scope a task into a plan, implement it test-first, judge it against a rubric
with an independent review gate, and verify it runs from a clean clone. Each stage is
`(inputs) → output`, and the artifacts it leaves behind (`plan.md`, `review.json`, `verify.md`) are
the trail a grader can follow.

## The loop

```
plan → tdd → review-gate ──pass──→ verify → done
                  │
             return-to-stage
```

- `review-gate` either **passes** the work on to `verify`, or routes it back with a `return-to-*`
  recommendation (`return-to-plan`, `return-to-tdd`, or `return-to-verify`).

## The stages

Each stage is a skill under `.claude/skills/<name>/SKILL.md`. Read the skill before running its stage.

**plan** — Scopes a task into an approved `plan.md`: approach, decomposition, test strategy, and the
acceptance criteria lifted verbatim from the brief. Ends at an approval gate before any
implementation. The plan is a file the next stage reads, not a chat message — so it can be read,
diffed, and reviewed.

**tdd** — Implements `plan.md` strictly RED → GREEN → REFACTOR, showing each test failing before the
code that makes it pass. A test written after the code tends to encode the code's bugs; a test
written first encodes the requirement, so behavior is proven, not assumed.

**review-gate** — Reads `evals/rubric.md` and spawns several **independent**
reviewer subagents, each with a distinct lens (correctness, security/performance,
simplicity/maintainability, docs/setup-smoothness). Each returns a structured verdict judging only
what the rubric asks; the gate aggregates them into a routing recommendation. Independent, diverse
lenses catch failure modes redundant ones miss, and an independent judge avoids grading its own work.
Any `error` finding or a majority `fail` blocks the pass.

**verify** — Clean-clone, real-environment check: clones the repo fresh, runs the README setup
verbatim, boots the thing, exercises a happy path and an error path, and records evidence to
`verify.md`. "I made the change" is not evidence; the grader runs it from a clean clone, so we do too.

## The rubric

`evals/rubric.md` defines what the review gate checks for. Every unit of work is judged against it.
It is versioned, and edits to it should be deliberate — changing a criterion changes the bar for all
future work.

## Starting a task

Begin with the `plan` skill (see `CLAUDE.md` for the exact invocation), then follow the loop.
