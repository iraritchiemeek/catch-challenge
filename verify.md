# Verify: review-polish pass (both apps)

- Clone sha: `16a8ca0` (branch `chore/review-polish`).
- The only commit after this on the branch is the one that records **this file** — a docs-only
  change that touches no source, test, or config. So the verified tree is the tree that ships.
- Environment: clean clone at `/private/tmp/verify-16a8ca0` (cloned from the local repo, not the
  working tree), Node v25.0.0, pnpm 10.18.3, macOS (darwin 24.3.0).

## Setup (from README, verbatim)

```
$ git clone --branch chore/review-polish <repo> /private/tmp/verify-16a8ca0 && cd $_
$ pnpm install
Done in 2.4s using pnpm v10.18.3
```
Result: ok — no extra/undocumented steps; no env vars required.

### Clean-clone gate (CLAUDE.md: install, lint, typecheck, test)

```
$ pnpm lint        → biome check: Checked 56 files. No fixes applied.            (clean)
$ pnpm typecheck   → root tsc --noEmit + 2 packages (jamstack, be-dev): all pass
$ pnpm test        → Test Files 12 passed (12); Tests 94 passed (94)
```
Result: ok — gate green from a clean clone.

## Happy path — both apps via Playwright (boots real servers on :3100 and :3101)

```
$ pnpm e2e
Running 12 tests using 4 workers
  ✓ apps/jamstack › shows ten repositories with the toolbar and sort control
  ✓ apps/jamstack › each row shows star count and a relative updated time
  ✓ apps/jamstack › does not render a search bar (search is out of scope)
  ✓ apps/jamstack › disables Previous and offers Next on the first page
  ✓ apps/jamstack › Next navigates to page two, where Previous becomes available
  ✓ apps/jamstack › pagination Next is operable by keyboard
  ✓ apps/jamstack › the sort dropdown re-sorts via the URL and persists across pagination
  ✓ apps/jamstack › has no detectable accessibility violations
  ✓ apps/be-dev  › asynchronously loads the first page of customers into the table
  ✓ apps/be-dev  › pages forward and back, reflecting the page in the URL
  ✓ apps/be-dev  › shows an accessible error when the API fails
  ✓ apps/be-dev  › has no detectable accessibility violations once loaded
  12 passed (11.9s)
```

**be-dev API (booted `PORT=3101 pnpm --filter be-dev dev`):**
```
$ curl -s 'localhost:3101/api/customers?page=1&pageSize=2'
  → rows: 2  total: 1000  totalPages: 500  hasNext: true
$ curl -s 'localhost:3101/api/customers?page=9999'
  → HTTP 200, rows: 0, hasNext: false      (past the end → empty page, not an error)
```

Result: **pass** — both apps render and paginate from a clean clone, axe-clean.

## Error path

**be-dev — bad input is a 400 (live):**
```
$ curl -s -w 'HTTP %{http_code}' 'localhost:3101/api/customers?page=abc'
  HTTP 400  {"error":"Invalid page: expected a positive integer, got \"abc\"."}
```
The browser error region (API failure → `role="alert"` panel) is covered by the be-dev e2e spec
above via route interception.

**jamstack — GitHub API non-OK:** the fetch happens on the server, so the browser can't intercept
it; this path is covered deterministically by unit tests (`lib/github.test.ts`,
`app/components/ErrorState.test.tsx`): `fetchRepos` throws a typed `GitHubError` on a non-OK
response, `fetchOrgRepoCount` degrades to `null`, and `ErrorState` renders an accessible alert with
a retry link and the rate-limit message on 403.

Result: **graceful** — failures surface as a 400 / an accessible alert, never an unhandled crash.

## Verdict

- [x] Setup reproducible from README (clean clone, no undocumented steps, no env)
- [x] Happy path works for both apps (e2e 12/12, axe-clean; be-dev API shape confirmed)
- [x] Error path handled gracefully (400 on bad input; typed server error → accessible panel)

**Verification passes**, against the sha that ships.
