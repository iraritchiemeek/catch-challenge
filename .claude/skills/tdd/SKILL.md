---
name: tdd
description: Implement an approved plan.md strictly test-first — RED then GREEN then REFACTOR — showing the failing test before the implementation. Use after the plan stage of the Build Loop. Enforces that each requirement is proven by a test that was written and seen to fail before any code makes it pass.
---

# tdd — implement test-first from the plan

The implementation stage of the Build Loop. Work only from an approved `plan.md`. Implement in
strict RED → GREEN → REFACTOR cycles, one decomposition step at a time.

## Artifact

Working code plus its tests, committed in small steps. The test suite is the durable artifact the
`review-gate` and `verify` stages rely on. No new untested behavior.

## Why test-first (not test-after)

A test written **after** the code tends to encode the code's behavior — including its bugs — because
you write the assertion to match what the code already does. A test written **before** the code
encodes the *requirement*, so it fails for the right reason and only passes when the requirement is
actually met. Showing the failing test first is the proof that the test can fail at all; a test that
has never been seen red might be asserting nothing.

## The cycle (repeat per decomposition step)

1. **RED — write one failing test.** Pick the next step from `plan.md`. Write the smallest test that
   asserts the requirement. **Run it and show it failing**, with the failure message. Confirm it
   fails for the intended reason (assertion not met), not an import error or typo.
   - Test command: `<fast test command>`
2. **GREEN — make it pass.** Write the minimum code to pass the test. No extra features, no
   speculative generality. Run the test and show it passing.
3. **REFACTOR — clean up under green.** With the test passing, improve names, remove duplication,
   simplify. Re-run the test (and the suite) after each change to confirm it stays green.
   - Lint: `<fast lint command>` · Typecheck: `<typecheck command>`
4. **Commit the step.** A small, scoped commit (test + implementation together, or test first then
   implementation) with a message that names the requirement covered.
5. Repeat for the next step until every acceptance criterion in `plan.md` is covered.

## Rules

- Never write implementation code before a failing test that requires it exists.
- One reason to change per test; keep tests small and independent.
- If a test is hard to write, treat it as a signal the design or the plan needs revisiting — go back
  to `plan` rather than forcing it.
- Keep the suite green between steps; never leave a known-red test uncommitted as "I'll fix it later."

## Definition of done for this stage

- Every acceptance criterion in `plan.md` is mapped to at least one test that was seen to fail then
  pass.
- `<fast test command>`, `<fast lint command>`, and `<typecheck command>` all pass.
- Work is committed in small, scoped steps.

## Next stage

`review-gate` judges the work against `evals/rubric.md`.
