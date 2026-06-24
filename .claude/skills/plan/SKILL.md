---
name: plan
description: Scope a task into an approved plan.md before any implementation. Use at the start of every unit of work in the Build Loop — turns a task brief into an approach, decomposition, test strategy, and acceptance criteria, then stops at an approval gate. The plan is a file the tdd skill reads, not a chat message.
---

# plan — scope a task into an approved plan

The first stage of the Build Loop. Convert a task brief into a written plan that the next stage
(`tdd`) reads and works from. **Stop at an approval gate before any implementation.**

## Artifact

`plan.md` at the repo root (or under the relevant package for a monorepo). It is the input
artifact for `tdd`. Overwrite or version it per task; do not bury planning in chat.

## Why a written plan, gated

A plan in a file can be read, diffed, and reviewed; a plan in chat cannot. The approval
gate exists because the cheapest place to fix a misunderstanding is before any code is written —
once `tdd` starts, a wrong plan costs a full implementation pass to unwind.

## Steps

1. **Read the task brief in full.** Extract the acceptance criteria verbatim — do not paraphrase
   them away. If the brief is ambiguous, list the open questions in the plan rather than guessing.
2. **State the approach.** One or two paragraphs: how you intend to solve it and why this approach
   over the obvious alternatives. Name trade-offs you are accepting.
3. **Decompose the work.** Break it into ordered, independently verifiable steps. Each step should
   be small enough that a single RED → GREEN → REFACTOR cycle covers it.
4. **Define the test strategy.** For each acceptance criterion, name the test(s) that will prove it
   and the level (unit / integration / end-to-end). This is the contract `tdd` implements against.
5. **Lift the acceptance criteria.** Copy them from the brief into the plan as a checklist so the
   `review-gate` and `verify` stages can score against the same list.
6. **Stop at the approval gate.** Present the plan and explicitly ask for approval. Do not begin
   implementation until approved. Record any approval feedback in the plan.

## plan.md structure

```markdown
# Plan: <task name>

## Task brief
<source reference, e.g. link or path>

## Acceptance criteria (verbatim from brief)
- [ ] ...
- [ ] ...

## Approach
<how, and why this approach; trade-offs accepted>

## Decomposition
1. <step> — verified by <test>
2. ...

## Test strategy
| Acceptance criterion | Test(s) | Level |
|---|---|---|
| ... | ... | unit/integration/e2e |

## Open questions
- ...

## Approval
- [ ] Approved by <who> on <date>
- Feedback: ...
```

## Definition of done for this stage

- `plan.md` exists with all sections filled (open questions may remain, flagged).
- Acceptance criteria are copied verbatim and mapped to tests.
- The approval gate has been reached and approval recorded before handing off to `tdd`.

## Next stage

`tdd` reads `plan.md` and implements it RED → GREEN → REFACTOR.
