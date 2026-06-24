# Verify: Build Loop monorepo scaffold & tooling

- Clone sha: `fa2f6b2` (branch `chore/build-loop-scaffold`)
- Environment: fresh `git clone` of the local repo into a throwaway dir (39 tracked files, no
  `node_modules`/build output copied in); Node v25.0.0, pnpm 10.18.3.
- Method: cloned the repo fresh and followed `README.md` verbatim — no steps from memory, no files
  copied in.

## Setup (from README, verbatim)

```
$ pnpm install
Done in 2.3s using pnpm v10.18.3
```
Result: ok — lockfile resolved cleanly from a clean clone.

### Clean-clone gate (README "The clean-clone gate")

```
$ pnpm lint
Checked 25 files in 20ms. No fixes applied.        # exit 0
$ pnpm typecheck
Tasks: 2 successful, 2 total                         # tsc (root configs) + turbo run typecheck; exit 0
$ pnpm test
Test Files  2 passed (2)
     Tests  2 passed (2)                             # exit 0
```
Result: ok — all four required commands (`install`, `lint`, `typecheck`, `test`) succeed from the
clean clone. Exit codes confirmed `0` for lint, typecheck, and test.

### e2e (README "End-to-end tests (first run)")

```
$ pnpm exec playwright install chromium
$ pnpm e2e
✓ [chromium] home page renders its heading (525ms)
✓ [chromium] home page has no detectable accessibility violations (807ms)
2 passed (8.5s)
```
Result: ok — Playwright boots the jamstack Next.js app via `webServer`, renders the page, and the
axe accessibility scan reports zero violations. (This also proves the jamstack app boots and
renders from a clean clone.)

## Happy path

Scenario: the `be-dev` Hono service boots and its health endpoint returns success (the primary
"skeleton runs" acceptance criterion for be-dev).

```
$ cd apps/be-dev && PORT=4123 pnpm exec tsx src/server.ts
be-dev listening on http://localhost:4123
$ curl -s -w "HTTP %{http_code}" http://localhost:4123/health
{"status":"ok"}
HTTP 200
```
Result: pass — `200` with body `{"status":"ok"}`.

For the jamstack app, the happy path (page loads with the expected `<h1>Hello, Catch!</h1>`) is
exercised and asserted by the Playwright e2e run above.

## Error path

Scenario: request an unknown route on the running be-dev server — it must fail gracefully (documented
404), not crash the process.

```
$ curl -s -w "HTTP %{http_code}" http://localhost:4123/does-not-exist
404 Not Found
HTTP 404
$ kill -0 <server-pid>   # process still alive after the bad request
yes — no crash
```
Result: graceful — Hono returns a clean `404 Not Found` and the server stays up to serve further
requests.

## Verdict

- [x] Setup reproducible from README (no undocumented steps; everything needed was committed)
- [x] Happy path works (be-dev `/health` → 200 JSON; jamstack page renders via e2e)
- [x] Error path handled gracefully (unknown route → 404, no crash)

**Result: PASS.** The scaffold runs from a clean clone exactly as the README describes. The unit of
work (scaffold + tooling) is **done**. Challenge features are intentionally not present and are built
later through the Build Loop.
