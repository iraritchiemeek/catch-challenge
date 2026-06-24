# jamstack — GitHub repository listing

A Next.js (App Router) app that fetches and displays repositories from the GitHub
organisation `github`, **ten at a time**, with Previous/Next pagination. Built for the
[catch-design/jamstack-test](https://github.com/catch-design/jamstack-test) challenge.

## Run it

From the repo root:

```bash
pnpm install
pnpm --filter jamstack dev      # http://localhost:3000
```

Open <http://localhost:3000>. Use **Next** / **Previous** (or edit `?page=N` in the URL) to page
through the list.

Production build:

```bash
pnpm --filter jamstack build
pnpm --filter jamstack start --port 3100
```

## How it works

- **Server-rendered, URL-driven pagination.** `app/page.tsx` is a Server Component. The current
  page comes from the `?page=N` query string, the data is fetched on the server, and **Previous/Next
  are real `next/link` anchors** to `?page=N±1`. There is no client-side fetching or pagination
  state — the controls are ordinary links, so they are keyboard-operable and degrade gracefully.
- **Data layer (`lib/github.ts`).** The only place that talks to the GitHub API. It builds the
  required endpoint — `https://api.github.com/orgs/github/repos?sort=name&per_page=10&page=N` — parses
  the response into a narrow `Repo` type, and pre-computes pagination state: `hasNext` is true when a
  full page of 10 came back, `hasPrev` when past page 1. Non-OK responses throw a typed `GitHubError`.
- **Pagination view-model (`lib/pagination.ts`).** A pure function turns the page + counts into
  hrefs and the "Showing X to Y" range, keeping the component a thin renderer (single source of the
  pagination logic).
- **Presentation (`app/components/`).** `RepoList`, `Pagination`, and `ErrorState`. All markup is
  sourced from **Tailwind Plus** UI Blocks — see [`docs/tailwind-plus-sources.md`](docs/tailwind-plus-sources.md)
  for the exact blocks and the original code. No bespoke layout was designed by hand.
- **Styling.** Tailwind CSS v4 (`app/globals.css` = `@import "tailwindcss"`). **Light mode only** — no
  `dark:` variants anywhere.

## Accessibility

- Semantic structure: a single `<h1>`, a labelled `<section aria-label="Repositories">`, a
  `<ul role="list">` (the role restores list semantics that Tailwind's reset removes in
  Safari/VoiceOver), and `<nav aria-label="Pagination">`.
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
| URL building, pagination math, error throwing | `lib/github.test.ts`, `lib/pagination.test.ts` | `pnpm test` |
| Component rendering (list rows, error panel) | `app/components/*.test.tsx` (via `react-dom/server`) | `pnpm test` |
| Live integration, navigation, keyboard, axe a11y | `e2e/repos.spec.ts` | `pnpm e2e` |
| CLI accessibility scan | `@axe-core/cli` | `pnpm a11y` |
