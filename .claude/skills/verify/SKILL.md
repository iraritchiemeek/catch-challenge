---
name: verify
description: Clean-clone, real-environment verification — clone the repo fresh, run the README setup verbatim, boot the thing, exercise a happy path and an error path, and record evidence to verify.md. Use after the review-gate passes in the Build Loop. Proves the work runs the way the grader will run it, from a clean clone, not just "on my machine".
---

# verify — clean-clone, real-environment check

The verification stage of the Build Loop, run after `review-gate` passes. Prove the work runs from a
**clean clone** exactly as a grader would run it, and record the evidence.

## Artifact

`verify.md` at the repo root: the verification log with commands run, observed output, and a
pass/fail for the happy path and the error path.

## Why a clean clone

"I made the change and it works" is not evidence — your working tree carries uncommitted files,
installed state, environment variables, and caches the grader will not have. The grader clones the
repo fresh and follows the README. So you should too: a clean clone is the only environment that
tests whether setup is actually reproducible and whether everything needed was committed.

## Steps

1. **Clone fresh.** Clone the repo into a throwaway directory (`git clone <repo-url> /tmp/verify-<sha> && cd /tmp/verify-<sha>`), separate from
   your working tree. Do not copy files in. Check out the exact sha under review.
2. **Follow the README verbatim.** Run the setup steps exactly as written, in order, with no extra
   steps from memory. If a step is missing, undocumented, or fails, that is a finding — record it and
   route back (it likely means `return-to-verify` work or a `tdd`/docs fix).
   - Install: `pnpm install` · Gate: `pnpm lint && pnpm typecheck && pnpm test` · e2e setup (first run): `pnpm exec playwright install chromium`
3. **Boot it.** Start the application or run the entrypoint as a user would.
   - Run: `pnpm dev` (all apps) · single app: `pnpm --filter jamstack dev` / `pnpm --filter be-dev dev` · e2e: `pnpm e2e`
4. **Exercise the happy path.** Perform the primary success scenario from the acceptance criteria.
   Record the input, the action, and the observed output (paste output or attach a screenshot path).
5. **Exercise an error path.** Trigger a representative failure (bad input, missing resource) and
   confirm it fails gracefully and as documented — not with an unhandled crash.
6. **Record evidence.** Write everything to `verify.md`: commands, outputs, and a verdict per path.
   Evidence means reproducible commands and their actual output, not assertions.
7. **Open a pull request.** Once verification PASSES, automatically open a PR for the work — this is
   the standard end of the Build Loop, no need to ask. Push the feature branch and run
   `gh pr create --base main --head <branch>` with a simple title and body (a one-line summary plus a
   short bullet list; link `verify.md` and `review.json`). If a PR for the branch already exists,
   update it instead of creating a duplicate (`gh pr edit`). Do not push to or open a PR straight
   against `main`. If verification FAILS, do not open a PR — route back via `review-gate`'s routing.

## verify.md structure

```markdown
# Verify: <task name>

- Clone sha: <sha>
- Environment: <clean clone path, runtime versions>

## Setup (from README, verbatim)
$ <command>
<output>
Result: ok / failed — <notes>

## Happy path
Scenario: <from acceptance criteria>
$ <command / steps>
<observed output>
Result: pass / fail

## Error path
Scenario: <failure exercised>
<observed behavior>
Result: graceful / not graceful

## Verdict
- [ ] Setup reproducible from README
- [ ] Happy path works
- [ ] Error path handled gracefully
```

## Definition of done for this stage

- The work was cloned fresh and set up from the README with no undocumented steps.
- Happy path and error path were both exercised with recorded, reproducible evidence.
- `verify.md` exists with a verdict per path; failures route back via `review-gate`'s routing.
- On PASS, a pull request has been opened (or updated) for the feature branch.

## Next stage

If verification passes, the PR is opened automatically and the unit of work is **done**.
