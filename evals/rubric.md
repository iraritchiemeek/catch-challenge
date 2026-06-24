# Eval Rubric — "What Good Looks Like"

> **This file is the keystone of the Build Loop.** The `review-gate` skill judges every
> unit of work against the criteria below. It is the single source of truth for "what good
> looks like" in this repo.
>
> **This file is versioned. Edits must be deliberate.** Changing a criterion changes the bar
> for every future review, so treat changes like an API change: discuss, justify in the commit
> message, and never edit it just to make a failing review pass.

## How the gate uses this file

For each criterion below, every reviewer lens (see the `review-gate` skill) records a verdict:

- `pass` — the work meets the bar described.
- `fail` — the work does not meet the bar; a finding must explain why and point to evidence.
- `n/a` — the criterion does not apply to this unit of work (must be justified).

A criterion is only scored against what is in scope for the unit of work under review. The gate
aggregates per-lens verdicts into a routing recommendation (see `review-gate`).

## Criteria

Each line is a checkable assessment criterion. The gate fills in the verdict and a one-line
justification with a pointer to evidence (`file:line`, artifact path, or command output).

- [ ] **Comprehension** — The work demonstrates correct understanding of the task brief and its
  acceptance criteria; nothing important is misread, dropped, or invented.
  - Verdict: _pending_ — _justification_

- [ ] **Setup / running the code is smooth and simple** — A newcomer can set up and run the code
  from the README with no undocumented steps, hidden state, or guesswork.
  - Verdict: _pending_ — _justification_

- [ ] **Selection of frameworks (justified)** — Framework and library choices fit the problem and
  are explicitly justified; no unexplained or gratuitous dependencies.
  - Verdict: _pending_ — _justification_

- [ ] **Code is clean, well documented / annotated / typed, simple, easy to maintain** — Code is
  readable, appropriately typed/annotated and documented, free of needless complexity, and a
  maintainer could extend it without surprises.
  - Verdict: _pending_ — _justification_

- [ ] **Good package management and git practices** — Dependencies are managed deliberately and
  reproducibly; git history is clean with clear, scoped commits and sensible messages.
  - Verdict: _pending_ — _justification_

- [ ] **Documentation and architecture** — The project explains itself: architecture is described,
  decisions are recorded, and structure matches the documented design.
  - Verdict: _pending_ — _justification_

- [ ] **Security / Performance / SEO / Accessibility considerations** — The work shows deliberate
  attention to security, performance, SEO, and accessibility appropriate to its scope; obvious
  pitfalls are addressed, not ignored.
  - Verdict: _pending_ — _justification_

- [ ] **Tests** — Behavior is covered by meaningful tests that assert the requirements (not just the
  implementation), and they pass in a clean environment.
  - Verdict: _pending_ — _justification_

- [ ] **General code quality, organisation, and best practices** — Overall the work reflects
  professional standards: sensible organisation, consistency, and adherence to established best
  practices.
  - Verdict: _pending_ — _justification_

## Scoring note

Any single `error`-severity finding, or a majority of lenses returning `fail`, blocks a `pass`
and routes the work back to an earlier stage. See the `review-gate` skill for the exact
aggregation rule.
