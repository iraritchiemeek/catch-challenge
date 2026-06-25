# be-dev — customers API + list view

The **Backend Developer Test** (catch-design/be-dev-test): import `data/customers.csv` into a
database, serve it through a paginated JSON API, and show it in a web page that loads the data
asynchronously. Everything lives in this one app and runs from a single process.

> This is one of two independent challenges in this monorepo. The other (a GitHub-repos listing)
> lives in [`apps/jamstack`](../jamstack) and is unrelated to this one.

## Requirements

- **Node ≥ 24.** The import and API use Node's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html)
  module, so there is **no database server and no native build step** — the database is a local file.
- **pnpm 10** — `corepack enable`, or see https://pnpm.io/installation.

## Run it locally

From the **repo root**:

```bash
pnpm install                       # 1. install dependencies
pnpm --filter be-dev db:import     # 2. create the SQLite schema + load customers.csv
pnpm --filter be-dev dev           # 3. build the stylesheet + start the server
```

Then open **http://localhost:3000**. Page through the customers with **Previous** / **Next** (the
current page is mirrored in `?page=N`, so a page is shareable). Set the port with `PORT=...` if 3000
is taken.

That's the whole setup: one install, one import, one run. The import is safe to re-run — it recreates
the table from the CSV each time.

## API

`GET /api/customers?page=<n>&pageSize=<n>`

| Param | Default | Rules |
|---|---|---|
| `page` | `1` | integer ≥ 1 |
| `pageSize` | `25` | integer ≥ 1, clamped to a max of `100` |

Response:

```jsonc
{
  "data": [ { "id": 1, "first_name": "Laura", /* …all columns… */ } ],
  "page": 1, "pageSize": 25,
  "total": 1000, "totalPages": 40,
  "hasPrev": false, "hasNext": true,
  "offset": 0
}
```

**Input handling.** Non-integer or out-of-range input (`?page=abc`, `?pageSize=-1`) returns
**`400`** with a JSON `{ "error": … }`. An over-large `pageSize` is **clamped** rather than rejected.
A `page` past the end returns **`200`** with an empty `data` array and correct metadata.

`GET /health` → `{ "status": "ok" }`.

## Architecture

```
data/customers.csv ──import.ts──▶ SQLite (data/customers.db)
                                      │  getCustomers() — LIMIT/OFFSET + COUNT
                                      ▼
            Hono app (app.ts) ── GET /api/customers ──▶ JSON
                    │
                    └─ serves public/ (index.html · app.js · render.js · styles.css)
                                      │  app.js fetch()es the API and renders rows
                                      ▼
                                 the browser list view
```

Module responsibilities (`src/`):

- **`import.ts`** — opens SQLite, creates the schema (`CREATE TABLE IF NOT EXISTS`), and loads the
  CSV with [`csv-parse`](https://csv.js.org/parse/) inside a transaction. A real parser is needed
  because the CSV has quoted fields containing commas; empty cells become SQL `NULL`. It is also the
  `pnpm db:import` entrypoint.
- **`pagination.ts`** — the single home of input validation (`parsePagination`) and page-metadata
  math (`paginate`). Kept free of HTTP and SQL so the rules are unit-testable in isolation.
- **`customers.ts`** — the SQL query layer; one id-ordered page plus the total count, all bound as
  parameters.
- **`app.ts`** — `createApp(db)` builds the Hono app with the database injected as a closure, so the
  whole API is testable via `app.request(...)` against an in-memory database.
- **`public/render.js`** — plain ESM shared by the browser and the unit tests, so the
  HTML-escaping (the security-critical part) is covered by tests rather than trusted by eye.

### Why these choices

- **`node:sqlite`** — the brief asks for a database and "simple to run". A built-in module means no
  Postgres/Docker and no native compilation (`better-sqlite3`), which is the single biggest lever on
  setup simplicity. The cost is requiring Node ≥ 24 (the module is still flagged experimental; the
  warning is silenced in the scripts).
- **Hono** — already the app's framework; tiny, web-standard `Request`/`Response`, and `app.request`
  makes the API testable without binding a socket.
- **Vanilla page, no SPA framework** — "asynchronously load JSON into a list" needs a `fetch` and some
  DOM updates; a second framework + dev server would add setup, not value.
- **Tailwind Plus for all design** — layout/markup come from real Tailwind Plus blocks (see
  [`docs/tailwind-plus-sources.md`](docs/tailwind-plus-sources.md)); Tailwind v4 compiles them to a
  static `public/styles.css`.

## Security / performance / accessibility / SEO

- **Security** — SQL is fully parameterised (no injection). Every rendered value is HTML-escaped, and
  only `http(s)` website URLs become links (a `javascript:` URL is shown as text), both unit-tested.
  `pageSize` is capped so a client can't request an unbounded scan.
- **Performance** — paginated `LIMIT/OFFSET` queries against an indexed integer primary key; the
  stylesheet is minified; only the requested page crosses the wire.
- **Accessibility** — semantic `<table>` with `<th scope="col">` and a caption, an `aria-live` status
  line, `aria-busy` on the body while loading, a `role="alert"` error region, and real `<button>`
  controls that disable at the ends.
- **SEO** — `<title>`, meta description, `lang`, and a `<noscript>` fallback. Note the list is
  **client-rendered**, which limits crawlability; that's an accepted trade-off for the brief's
  "asynchronously load" requirement. Server-rendering the first page would be the next step if SEO
  mattered here.

## Tests

```bash
pnpm exec vitest run apps/be-dev      # this app's unit/integration tests
```

Covers pagination/validation rules, CSV import (quoted commas, empty→NULL, unicode), the query layer,
the API (shape, pagination, 400 on bad input, empty page past the end), static serving, and the
escaping/anti-XSS behaviour of the renderer.
