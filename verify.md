# Verify: GitHub-style repo layout + functional sort (apps/jamstack)

- Clone sha: `ebcd901` (branch `feat/jamstack-repo-layout`)
- Environment: clean clone at `/private/tmp/verify-ebcd901e` (cloned from the local repo, not the
  working tree), Node v25.0.0, pnpm 10.18.3, macOS (darwin 24.3.0).

## Setup (from README, verbatim)

```
$ git clone --branch feat/jamstack-repo-layout <repo> /private/tmp/verify-ebcd901e && cd $_
$ pnpm install
Done in 3.4s using pnpm v10.18.3
```
Result: ok — no extra/undocumented steps; no env vars required.

### Clean-clone gate (CLAUDE.md: install, lint, typecheck, test)

```
$ pnpm lint        → biome check: Checked 56 files. No fixes applied.            (clean)
$ pnpm typecheck   → 2 packages (jamstack, be-dev): both pass (tsc --noEmit)
$ pnpm test        → Test Files 13 passed (13); Tests 96 passed (96)
```
Result: ok — gate green from a clean clone.

## Happy path

Scenario (acceptance criteria): the list renders in the GitHub org Repositories layout with a
toolbar (count + sort) and rich metadata; sorting via `?sort=` reorders the list; pagination
preserves the active sort.

**e2e (boots the real app on :3100 via Playwright webServer):**
```
$ pnpm exec playwright install chromium
$ pnpm e2e
Running 8 tests using 4 workers
  ✓ shows ten repositories with the toolbar and sort control
  ✓ each row shows star count and a relative updated time
  ✓ does not render a search bar (search is out of scope)
  ✓ disables Previous and offers Next on the first page
  ✓ Next navigates to page two, where Previous becomes available
  ✓ pagination Next is operable by keyboard
  ✓ the sort dropdown re-sorts via the URL and persists across pagination
  ✓ has no detectable accessibility violations
  8 passed (10.0s)
```

**HTTP evidence (booted `pnpm --filter jamstack dev --port 3210`):**
```
$ curl -s localhost:3210/ | grep -oE '...' | uniq -c
  10 >Public<            # ten repos, each with a visibility badge
   1 repositories</p>    # "552 repositories" count line (from GET /orgs/github public_repos)
   1 Sort by             # the labelled sort control
  16 MIT License         # license meta rendered
   0 Search repositories # no search bar (out of scope)  ← absent, as intended

# Sort actually changes order:
$ curl -s 'localhost:3210/'            → first repo: copilot-sdk   (default = Last pushed)
$ curl -s 'localhost:3210/?sort=name'  → first repo: .github      (alphabetical)

# Pagination preserves the active sort, and omits the default sort for clean URLs:
$ curl -s 'localhost:3210/?page=2&sort=name'  → prev: ?page=1&sort=name  next: ?page=3&sort=name
$ curl -s 'localhost:3210/'                   → next: ?page=2            (default sort not in URL)
```

Screenshot of the clean clone (matches the target layout; graph omitted, no search bar):
`scratchpad/verify-clean-clone.png` — subdued "GitHub repositories" h1, "552 repositories" + "Last
pushed" toolbar, rows with name + Public badge, description, topic pills, language dot, license,
forks/stars/issues icons, and relative "Updated …" times.

Result: **pass**.

## Error path

Scenario: the GitHub API returns a non-OK status (e.g. 403 rate limit) → the page must render the
accessible error panel, not crash. Because the fetch happens on the **server**, the browser cannot
intercept it, so this path is covered deterministically by unit tests (as documented in the README).

```
$ pnpm vitest run lib/github.test.ts app/components/ErrorState.test.tsx
  Test Files  2 passed (2)
  Tests  16 passed (16)
```
Covered: `fetchRepos` throws a typed `GitHubError` on a non-OK response (asserts status 403);
`fetchOrgRepoCount` degrades to `null` on non-OK/network error (so a count failure never breaks the
listing); `ErrorState` exposes `role="alert"`, a Try-again link, and the rate-limit message on 403.

Result: **graceful** — failures surface as an accessible alert with retry, not an unhandled crash.

## Verdict

- [x] Setup reproducible from README (clean clone, no undocumented steps, no env)
- [x] Happy path works (layout + functional sort + sort-preserving pagination; e2e 8/8, axe-clean)
- [x] Error path handled gracefully (typed error → accessible panel; count fetch degrades to null)

**Verification passes.** The unit of work runs from a clean clone exactly as a grader would run it.
