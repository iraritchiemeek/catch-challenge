# Plan: be-dev-test — CSV → SQLite → paginated API → async list view

## Task brief
- Challenge: https://github.com/catch-design/be-dev-test (the "Backend Developer Test").
- Scope: **everything except the email submission step.**
- Self-contained in **`apps/be-dev`** (the Hono app). **Do not touch** the existing GitHub-repos
  challenge in `apps/jamstack` or the repo-root Build Loop artifacts (`plan.md`, `review.json`,
  `verify.md`) — those belong to that separate challenge. This challenge's artifacts live under
  `apps/be-dev/` (`plan.md`, `review.json`, `verify.md`).
- User constraints layered on top of the brief:
  - **Extremely simple to run locally** — documented in the README.
  - All visual/design elements come from **Tailwind Plus** blocks; no self-authored design decisions.
  - Database is **SQLite** (confirmed).

## Acceptance criteria (verbatim from brief)
- [ ] "Build a data import system that reads the CSV file in `data/customers.csv` and loads it into a
  database."
- [ ] "Include either migration tooling or a setup script to create database tables."
- [ ] "Develop an API serving the database records" with **"Pagination" support**.
- [ ] API must **"Handle user input appropriately."**
- [ ] "Create a web application that asynchronously retrieves and displays the JSON data in a list
  format."
- [ ] "Provide detailed instructions in README.md for setup and execution."
- [ ] (User) "Setup / running the code should be smooth and simple."
- [ ] Evaluation dimensions to honour: code clarity/maintainability, framework selection (justified),
  git + package management, **security, performance, accessibility, SEO** considerations, **test
  coverage**, organisation/best practices.
- [ ] (User) All design elements sourced from **Tailwind Plus**; no self-authored design.

## Approach
**One self-contained Hono app does all three jobs.** The backend, the API, and the page that displays
the data all live in `apps/be-dev`, served by a single process. This is the simplest thing to run —
one `install`, one `import`, one `dev` — and keeps the be-dev-test deliverable cleanly separate from
the unrelated jamstack challenge. Trade-off accepted: the frontend is a small vanilla-JS page served
as a static asset rather than a React app; that's *less* machinery than a second framework and a
second dev server, which directly serves the "extremely simple to run locally" goal. The page still
satisfies "asynchronously retrieves and displays the JSON data" — it `fetch()`es the API on load and
on Prev/Next and renders the list client-side.

**Database = SQLite via the built-in `node:sqlite` module.** No native compilation (unlike
`better-sqlite3`), no external service (unlike Postgres), no extra runtime dependency at all — it
ships with Node. This is the single biggest lever on "extremely simple to run locally." Trade-off:
`node:sqlite` is flagged experimental and needs **Node ≥ 22.5 (we target ≥ 24)**; the experimental
warning is silenced in our scripts and the Node requirement is documented and enforced via `engines`.

**Import is an idempotent setup script**, not a migration framework — appropriate for a one-table,
one-CSV import and well within "a setup script to create database tables." It (1) creates the
`customers` table (`CREATE TABLE IF NOT EXISTS`), (2) parses `data/customers.csv` with a real CSV
parser (`csv-parse` — the CSV has quoted fields containing commas, empty fields, and unicode, so
naive `split(",")` is wrong), and (3) bulk-inserts inside a transaction. Re-running it resets the
table so the result is deterministic.

**The API is `GET /api/customers?page=&pageSize=`** returning
`{ data, page, pageSize, total, totalPages, hasPrev, hasNext }`. "Handle user input appropriately":
`page`/`pageSize` are parsed and validated in one shared, unit-tested module — non-integer/garbage
input → `400` with a clear JSON error; `pageSize` is clamped to `1..100` to bound load (performance);
queries use parameterised SQL (no string interpolation → no SQL injection). The page count is the
single source of truth (DRY) shared by API and meta.

**Design from Tailwind Plus only.** A list/table block (Application UI → Lists) for the customer rows
and a Previous/Next pagination block for the controls, extracted via the `tailwind-plus` skill, with
`dark:` variants stripped (light mode). Tailwind v4 CSS is precompiled to a static file via
`@tailwindcss/cli` and served by Hono — offline, no CDN, no per-request cost.

## Decomposition
Each step is one RED → GREEN → REFACTOR cycle and a scoped commit, on branch
`feat/be-dev-customers-api` (off `main`).

1. **Vendor the data + dependencies.** Copy the challenge `customers.csv` to
   `apps/be-dev/data/customers.csv`; add `csv-parse`, `@tailwindcss/cli`; bump be-dev `engines.node`
   to `>=24`. *(Config step — proven by the steps that consume it.)*
2. **Input-handling module `src/pagination.ts`** — `parsePagination(query)` → validated
   `{ page, pageSize }` or a typed `ValidationError`; `paginate(total, page, pageSize)` → meta
   (`totalPages`, `hasPrev`, `hasNext`, `offset`). *RED→GREEN:* `pagination.test.ts` — defaults,
   clamping (`pageSize>100`→100, `<1`→error/clamp), non-integer/garbage → error, page past the end →
   empty with correct meta.
3. **DB + import `src/db.ts`, `src/import.ts`** — `openDb(path)`, `createSchema(db)`,
   `importCsv(db, csvPath)` returning the inserted count. *RED→GREEN:* `import.test.ts` against an
   in-memory db with a fixture CSV — correct row count, quoted-comma URL kept intact, empty field
   stored as `NULL`, unicode preserved, parameterised insert.
4. **Query layer `src/customers.ts`** — `getCustomers(db, page, pageSize)` returning
   `{ data, total }` using `LIMIT/OFFSET` + a `COUNT(*)`. *RED→GREEN:* `customers.test.ts` against a
   seeded in-memory db — correct slice per page, correct `total`, last/partial page, empty page.
5. **API route in `src/app.ts`** — `GET /api/customers` wires `parsePagination` + `getCustomers` +
   `paginate`; injects the db via context (testable through `app.request`). *RED→GREEN:*
   `app.test.ts` — 200 + correct shape/meta, page 2 differs from page 1, invalid input → 400 JSON
   error, out-of-range page → 200 empty data. Existing `/health` test stays green.
6. **Frontend page** — `public/index.html` (semantic HTML from a Tailwind Plus list + pagination
   block) + `public/app.js` (on load `fetch`es `/api/customers`, renders rows, wires Prev/Next).
   Row rendering is a pure, exported `renderRows(customers)` that **HTML-escapes** every value
   (XSS-safe). Hono serves `/`, `/app.js`, `/styles.css`. *RED→GREEN:* `render.test.ts` — rows render
   expected fields, values are escaped, empty fields render gracefully; `app.test.ts` — `/` returns
   HTML wired to the API and `/styles.css` is served.
7. **README + run scripts** — document the three-command local run, the architecture, the framework
   justifications, the `node:sqlite`/Node-24 note, and a security/perf/a11y/SEO summary. Wire scripts:
   `import`, `build:css`, `dev` (build CSS then serve), `start`.

## Test strategy
| Acceptance criterion | Test(s) | Level |
|---|---|---|
| CSV import into DB (quoted commas, empty fields, unicode) | `import.test.ts` over fixture CSV → in-memory SQLite | unit/integration |
| Schema setup script | `createSchema` + `importCsv` create table & rows; `import.test.ts` | integration |
| API serves records | `app.test.ts` `GET /api/customers` 200 + shape | integration |
| Pagination | `pagination.test.ts` (math) + `app.test.ts` (page 1 ≠ page 2, meta) | unit + integration |
| Handle user input | `pagination.test.ts` (garbage/clamp) + `app.test.ts` (400 JSON, out-of-range) | unit + integration |
| Async list view | `render.test.ts` (pure render + escaping) + `app.test.ts` (`/` serves wired HTML) | unit + integration |
| Security (SQLi, XSS, PII) | parameterised SQL assert; `render.test.ts` escaping | unit |
| Setup is simple | README; clean-clone run in `verify` | process |
| Tailwind Plus only / light mode | review-gate (markup from blocks, no `dark:`) | review |

## Open questions (RESOLVED at approval)
1. **Invalid input policy** — _Resolved:_ non-integer/garbage `page`/`pageSize` → **`400`** with a
   JSON error; valid-but-too-large `pageSize` → **clamped to 100** (not an error); `page` past the
   last page → **`200`** with empty `data` and correct meta.
2. **`ip_address` exposure** — _Resolved:_ **expose everywhere.** The API returns all columns
   including `ip_address`, and the list view displays it like any other field (most literal reading
   of "serve the records").
3. **Run shape** — _Resolved:_ README setup is `pnpm install` → `pnpm --filter be-dev import` →
   `pnpm --filter be-dev dev` (builds CSS, serves on http://localhost:3000).

## Approval
- [x] Approved by iraritchiemeek on 2026-06-24
- Feedback: SQLite; do not touch the jamstack challenge; 400-on-garbage + clamp pageSize; expose
  `ip_address` everywhere (API and UI); design from Tailwind Plus only.
