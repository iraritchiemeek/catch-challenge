# jamstack — GitHub repository listing

A Next.js (App Router) app that lists repositories from the GitHub org `github`, ten per page,
modelled on GitHub's own [org Repositories page](https://github.com/orgs/github/repositories).
Pagination and sort are both driven by the URL (`?page=N&sort=key`). Built for the
[catch-design/jamstack-test](https://github.com/catch-design/jamstack-test) challenge.

## Run it

From the repo root:

```bash
pnpm install
pnpm --filter jamstack dev      # http://localhost:3000
```

Page with **Next** / **Previous** (or `?page=N`); reorder with the sort dropdown (or `?sort=` — one
of `pushed`, `updated`, `name`, `created`).

## Notes

- **Unauthenticated GitHub API**, limited to **60 requests/hour per IP**. Responses are cached for
  60s. If you hit the limit, the page shows a rate-limit message — wait a minute and retry.
- **Out of scope:** search, the density toggle, and the activity sparkline from GitHub's page are not
  rendered. Sort omits "Stars" because the org repos endpoint doesn't support it.

## Tests

```bash
pnpm test                       # unit/integration (lib + components)
pnpm e2e                        # Playwright: navigation, sort, axe accessibility
```
