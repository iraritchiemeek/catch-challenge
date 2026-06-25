# Verify: be-dev-test (customers import → API → list view)

- Clone sha: `af5b42f` (branch `feat/be-dev-customers-api`)
- Environment: fresh `git clone` into `/tmp/verify-bedev-af5b42f` (separate from the working tree),
  Node v25.0.0, pnpm 10.18.3. The clone tracks **no** generated artifacts — `public/styles.css` and
  `*.db` are git-ignored and are produced by the documented setup.

## Setup (from apps/be-dev/README.md, verbatim)

```
$ pnpm install
Done in 2.5s

$ pnpm --filter be-dev db:import
Imported 1000 customers into /private/tmp/verify-bedev-af5b42f/apps/be-dev/data/customers.db
```

Clean-clone gate:

```
$ pnpm lint       → Checked 46 files. No fixes applied.        (ok)
$ pnpm typecheck  → tsc --noEmit, both projects                (ok)
$ pnpm test       → Test Files 9 passed | Tests 63 passed      (ok)
```

Boot (documented `dev` flow — builds the stylesheet, then serves):

```
$ PORT=4071 pnpm --filter be-dev dev
≈ tailwindcss v4.3.1  Done in 34ms        (public/styles.css → 10511 bytes)
be-dev listening on http://localhost:4071
```

Result: **ok** — no undocumented steps, no guesswork.

## Happy path

Scenario: import the CSV, serve it paginated, and display it asynchronously in a list.

```
GET /                                  → 200  text/html
GET /health                            → {"status":"ok"}
GET /api/customers?page=3&pageSize=4   → {ids:[9,10,11,12], page:3, pageSize:4, total:1000,
                                          totalPages:250, hasPrev:true, hasNext:true}
GET /api/customers?pageSize=999        → pageSize=100 (clamped), rows=100
GET /api/customers?page=9999&pageSize=10 → rows=0, hasNext=false, total=1000
```

Browser (real Chromium via agent-browser):
- The page renders the Tailwind Plus table populated with customer data — name, email, company,
  title, city, gender, IP address, and website (linked to the host). Empty fields show "—"
  (e.g. Terry Ruiz's Title and Website). Screenshot: `/tmp/verify-bedev-page.png`.
- Clicking **Next** advanced the list to page 2; the status line updated to
  `Showing 26–50 of 1000 · page 2 of 40`.

Result: **pass**.

## Error path

Scenario: malformed user input to the API.

```
GET /api/customers?page=abc      → 400  {"error":"Invalid page: expected a positive integer, got \"abc\"."}
GET /api/customers?pageSize=-1   → 400  {"error":"Invalid pageSize: expected a positive integer, got \"-1\"."}
```

No crash, no stack trace — a clear JSON error with a 400 status, exactly as documented.

Result: **graceful**.

## Verdict

- [x] Setup reproducible from README (clean clone, no undocumented steps)
- [x] Happy path works (paginated API + async list view, verified in a real browser)
- [x] Error path handled gracefully (400 JSON on bad input)
