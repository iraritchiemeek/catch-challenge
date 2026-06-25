# jamstack — GitHub repository listing

A Next.js (App Router) app that fetches and displays repositories from the GitHub
organisation `github`, **ten at a time**, with a layout modelled on GitHub's own org
[Repositories page](https://github.com/orgs/github/repositories): each row shows the name and
visibility badge, description, topic pills, and a metadata line (language, license, forks, stars,
issues, and a relative "Updated …" time). A **sort** control and Previous/Next pagination are both
driven entirely by the URL. Built for the
[catch-design/jamstack-test](https://github.com/catch-design/jamstack-test) challenge.

## Scope notes

- **No search.** The search box from GitHub's page is intentionally out of scope for this iteration,
  so it is not rendered (no dead controls).
- **Sort is functional.** The "Last pushed" dropdown re-sorts via `?sort=` (see below). GitHub's
  Comfortable/Compact density toggle is out of scope.
- **Only data-backed fields are shown.** The list API exposes a single `open_issues_count` (which
  conflates issues and pull requests), so the row shows an **issues** count but no separate PR count
  — inventing one would mean a per-repo API call.
- **The activity-graph sparkline is omitted.**

## Run it

From the repo root:

```bash
pnpm install
pnpm --filter jamstack dev      # http://localhost:3000
```

Open <http://localhost:3000>. Use **Next** / **Previous** (or edit `?page=N` in the URL) to page
through the list, and the **sort dropdown** (or edit `?sort=` — one of `pushed`, `updated`, `name`,
`created`) to reorder it.

Production build:

```bash
pnpm --filter jamstack build
pnpm --filter jamstack start --port 3100
```

## How it works

- **Server-rendered, URL-driven.** `app/page.tsx` is a Server Component. Both the current page and
  the sort order come from the query string (`?page=N&sort=key`); data is fetched on the server, and
  the only interactive piece is the sort dropdown — a small leaf Client Component
  (`app/components/SortControl.tsx`). **Previous/Next are real `next/link` anchors** to
  `?page=N±1` (preserving the active sort), so paging needs no client-side state and degrades
  gracefully.
- **Sorting.** `lib/sort.ts` holds the whitelist of sort options and maps each to the API's
  `sort`+`direction` params. The default is **Last pushed**; an unknown or missing `?sort=` falls back
  to it. Only sorts the org repos endpoint actually supports are offered (no "Stars" — that needs the
  Search API), so every option does something real. Changing the sort resets to page 1.
- **Data layer (`lib/github.ts`).** The only place that talks to the GitHub API. `fetchRepos` builds
  `https://api.github.com/orgs/github/repos?sort=…&direction=…&per_page=10&page=N`, parses the
  response into a narrow `Repo` type, and pre-computes pagination state (`hasNext` when a full page of
  10 came back, `hasPrev` when past page 1). `fetchOrgRepoCount` reads the org's `public_repos` for the
  "N repositories" header line — best-effort, resolving to `null` (the page just omits the count) if it
  fails, so it never breaks the listing. Non-OK list responses throw a typed `GitHubError`.
- **Pagination view-model (`lib/pagination.ts`).** A pure function turns the page + counts (+ active
  sort) into hrefs and the "Showing X to Y" range, keeping the component a thin renderer.
- **Formatting (`lib/format.ts`).** Pure helpers for the relative "Updated 7 minutes ago" line, the
  GitHub-style abbreviated counts ("9.4k"), and the "552 repositories" label.
- **Presentation (`app/components/`).** `Toolbar` (count + `SortControl`), `RepoList` (the rows),
  `Pagination`, and `ErrorState`. The row layout follows GitHub's own org Repositories page; the
  pagination footer is a **Tailwind Plus** UI Block — see
  [`docs/tailwind-plus-sources.md`](docs/tailwind-plus-sources.md) for provenance.
- **Icons (`app/components/icons.tsx`).** GitHub's own **Primer Octicons** (MIT), inlined as SVG paths
  (star, repo-forked, issue-opened, law, sort, chevron-down, dot-fill) rather than pulling in the
  `@primer/octicons-react` dependency for a handful of glyphs. The language dot colour comes from a
  small GitHub Linguist colour map (`lib/languages.ts`).
- **Styling.** Tailwind CSS v4 (`app/globals.css` = `@import "tailwindcss"`). **Light mode only** — no
  `dark:` variants anywhere.

## Accessibility

- Semantic structure: an `<h1>` page heading with one `<h2>` per repository (heading order is not
  skipped), a labelled `<section aria-label="Repositories">`, a `<ul role="list">` (the role restores
  list semantics that Tailwind's reset removes in Safari/VoiceOver), and `<nav aria-label="Pagination">`.
- The sort control is a native `<select>` labelled "Sort by", so it is keyboard-operable and announced
  by assistive tech; the decorative Octicons are `aria-hidden` and metadata counts carry an SR-only
  noun ("stars", "forks", "open issues").
- Pagination uses real links; the unavailable direction at a boundary is a disabled, non-focusable
  span rather than a dead link.
- Verified two ways, both reporting **zero violations**:
  - **In CI/e2e:** `@axe-core/playwright` runs inside the Playwright suite (`pnpm e2e`).
  - **Via CLI** (the tool the brief calls for), against the running app:

    ```bash
    pnpm --filter jamstack start --port 3100   # in one terminal
    pnpm a11y                                  # in another (root script)
    ```

    `pnpm a11y` runs `@axe-core/cli` over `/` and `/?page=2`. It passes an explicit chromedriver
    binary (the `chromedriver` devDependency) because the CLI's bundled driver may not match the
    Chrome installed locally. If the scan can't start a browser, install a chromedriver matching your
    Chrome's major version: `pnpm add -Dw chromedriver@<major>`.

## Error handling

If the GitHub API returns a non-OK status, the page renders an accessible `role="alert"` panel with a
plain-language message and a **Try again** link, instead of crashing. A `403` is reported as a rate
limit (see below). Because the fetch happens on the server, this path is covered deterministically by
unit tests (`lib/github.test.ts`, `app/components/ErrorState.test.tsx`) rather than by the live e2e
suite.

## GitHub API rate limit

The app calls GitHub's REST API **unauthenticated**, which is limited to **60 requests/hour per IP**.
Responses are cached on the server for 60s (`next: { revalidate: 60 }`) to stay well under it. If you
hit the limit while clicking around quickly, the error panel will show the rate-limit message — wait a
minute and retry.

## Tests

| What | Where | Run |
|---|---|---|
| URL building, sort mapping, pagination math, count fetch, error throwing | `lib/github.test.ts`, `lib/sort.test.ts`, `lib/pagination.test.ts` | `pnpm test` |
| Relative time + count/label formatting, language colours | `lib/format.test.ts`, `lib/languages.test.ts` | `pnpm test` |
| Component rendering (repo rows, icons, error panel) | `app/components/*.test.tsx` (via `react-dom/server`) | `pnpm test` |
| Live integration, navigation, keyboard, **functional sort**, axe a11y | `e2e/repos.spec.ts` | `pnpm e2e` |
| CLI accessibility scan | `@axe-core/cli` | `pnpm a11y` |
