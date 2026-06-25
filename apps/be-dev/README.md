# be-dev — customers API + list view

Imports `data/customers.csv` into SQLite, serves it through a paginated JSON API, and renders it in a
page that loads the data asynchronously. One app, one process. Built for the **Backend Developer Test**
(catch-design/be-dev-test).

## Run it

From the repo root:

```bash
pnpm install
pnpm --filter be-dev dev        # http://localhost:3001
```

`dev` imports the CSV into SQLite, builds the stylesheet, and starts the server — no separate setup
step. The import recreates the table each run, so it's safe to re-run. Set `PORT` to override 3001.

## API

`GET /api/customers?page=<n>&pageSize=<n>`

- `page` — integer ≥ 1 (default `1`)
- `pageSize` — integer ≥ 1, clamped to max `100` (default `25`)

Returns `{ data, page, pageSize, total, totalPages, hasPrev, hasNext, offset }`. Bad input
(`?page=abc`, `?pageSize=-1`) returns `400`; a page past the end returns `200` with empty `data`.

`GET /health` → `{ "status": "ok" }`.

## Tests

```bash
pnpm exec vitest run apps/be-dev
```

Covers validation, CSV import, the query layer, the API, and the renderer's HTML-escaping.
