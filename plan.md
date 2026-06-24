# Plan: Paginated GitHub org repo listing (catch-design/jamstack-test challenge)

## Task brief
- Challenge: https://github.com/catch-design/jamstack-test
- Build in `apps/jamstack` (Next.js App Router, the repo's Jamstack app).
- User constraints layered on top of the brief:
  - Components must come from **Tailwind Plus** — never invent design decisions; take layout/markup
    from a real Tailwind Plus UI block and only map data into it.
  - Everything **accessible**, verified with **@axe-core/cli** (in addition to the existing
    `@axe-core/playwright` e2e check).
  - **No dark mode.**
  - Code must be **DRY**.
  - Follow repo tech rules: pnpm, strict TS, Biome, Vitest (`*.test.ts`), Playwright (`*.spec.ts`).

## Acceptance criteria (verbatim from brief + user)
- [ ] "Utilize the GitHub API to fetch and display at least 30 repositories, showing 10 results at a time."
- [ ] Uses the endpoint `https://api.github.com/orgs/github/repos?sort=name&per_page=10&page=1`.
- [ ] "Implement navigation controls—either 'Next'/'Previous' buttons or infinite scroll—to manage
  data display across multiple pages."
- [ ] "Style the list to resemble the appearance of GitHub's pinned items or the repository list on
  their org overview page." Simplified aesthetics acceptable; exclude complex graphs and precise iconography.
- [ ] Accessibility: "Employ semantic HTML, ARIA roles, and keyboard navigation support."
- [ ] Error Handling: "Gracefully manage and communicate API failures or data issues."
- [ ] Styling: responsive layout (custom CSS or compatible library).
- [ ] "Provide clear setup and execution instructions."
- [ ] (User) All visual components sourced from Tailwind Plus; no self-authored design.
- [ ] (User) Passes `@axe-core/cli` with zero violations.
- [ ] (User) No dark mode. DRY code.

## Approach
**Fetch on the server, paginate with real links.** The page is a Server Component that reads
`?page=N` from `searchParams`, fetches that page from the GitHub API, and renders the list. "Next" and
"Previous" are ordinary `<a>` links to `?page=N±1`. This is the most accessible and DRY option: the
controls are real, keyboard-operable, focusable links that work without client JS — no `useState`, no
client fetch waterfall, no ARIA gymnastics to re-create link semantics. It also fits Next.js App Router
and the "Jamstack" framing. Trade-off accepted: a full navigation per page instead of in-place updates;
acceptable here and simpler than client state + infinite scroll, and the brief explicitly permits
Next/Previous.

**Keep the data layer pure and isolated** in `apps/jamstack/lib/github.ts`: a `buildReposUrl(page)`
URL builder, a `Repo` type (narrowed to the fields we render), and `fetchRepos(page)` returning a typed
`{ repos, page, hasPrev, hasNext }` result or throwing a typed `GitHubError`. `hasNext` is derived from
"received a full page of `per_page` items"; `hasPrev` from `page > 1`. This isolates all logic that is
worth unit-testing from React, keeps the component thin, and is the single source of the per-page count
(DRY).

**Design from Tailwind Plus only.** Two blocks:
1. A **stacked list** (Application UI → Lists → Stacked lists) for the repo rows — name, description,
   language, star count mapped into the block's slots.
2. A **pagination** block (Application UI → Navigation → Pagination, the simple Previous/Next card
   footer variant) for the controls.
Both are extracted verbatim via the `tailwind-plus` skill; I map repo data into them and strip any
`dark:` variants (no dark mode). No bespoke layout is invented.

**Styling = Tailwind CSS v4.** Add Tailwind v4 to `apps/jamstack` (`tailwindcss` +
`@tailwindcss/postcss`, `@import "tailwindcss"` in a global stylesheet, no dark mode config). Exact
v4 wiring confirmed via context7 at implementation time. Light-mode only.

**Error handling.** `fetchRepos` throws `GitHubError` on non-OK responses (covering rate-limit 403 and
404). The page catches it and renders an accessible error region (`role="alert"`) with a plain-language
message and a retry link, instead of crashing.

## Decomposition
Each step is one RED → GREEN → REFACTOR cycle and one commit, on branch `feat/github-repos-listing`.

1. **Tailwind v4 wiring** — add deps, `app/globals.css` with `@import "tailwindcss"`, PostCSS config,
   import the stylesheet in `layout.tsx`. *Verified by:* `pnpm build` succeeds; existing e2e a11y still
   green; a Vitest assertion that the globals stylesheet imports tailwind. (Config step — proven by its
   command, per repo convention.)
2. **Data layer `lib/github.ts`** — `buildReposUrl`, `Repo`, `GitHubError`, `fetchRepos`.
   *Verified by (RED→GREEN):* `lib/github.test.ts` — URL has `sort=name&per_page=10&page=N`; success
   parses repos and computes `hasPrev`/`hasNext`; a full page implies `hasNext`, a short page does not;
   non-OK response throws `GitHubError`. Fetch is stubbed (`vi.fn`), no live network.
3. **Repo list + pagination UI** — Tailwind Plus stacked-list + pagination components as
   `RepoList.tsx` / `Pagination.tsx`, wired into `app/page.tsx` reading `searchParams.page`.
   *Verified by:* component unit test(s) rendering a known repo set asserts 10 rows, repo name/desc
   present, Prev disabled/absent on page 1, Next present; plus the e2e below.
4. **Error UI** — page renders `role="alert"` region when `fetchRepos` throws.
   *Verified by:* unit test of the error branch; e2e error-path test with the GitHub route mocked to 403.
5. **e2e + accessibility** — Playwright `e2e/repos.spec.ts`: mock `api.github.com` so tests are
   deterministic (no live rate-limited calls); assert 10 rows render, Next link navigates to page 2,
   Previous appears, keyboard can reach pagination, and **axe finds zero violations** on the list page
   and the error page. *Verified by:* `pnpm e2e` green.
6. **@axe-core/cli pass** — add an `a11y` script that runs `@axe-core/cli` against the running app;
   record a clean run. *Verified by:* `pnpm --filter jamstack a11y` (or root script) reports 0 violations.
7. **README + docs** — document setup/run, the architecture (server fetch + link pagination), the
   Tailwind Plus sourcing, GitHub API rate-limit note, and the a11y verification command.
   *Verified by:* README review; `verify` stage runs it from a clean clone.

## Test strategy
| Acceptance criterion | Test(s) | Level |
|---|---|---|
| Correct endpoint + params (`sort=name&per_page=10&page=N`) | `github.test.ts` URL builder | unit |
| Fetch ≥30 repos, 10 at a time | `github.test.ts` parses 10/page; e2e shows 10 rows; Next→page 2 | unit + e2e |
| Next/Previous controls | unit (Prev absent on p1, Next present); e2e Next navigates, Prev appears | unit + e2e |
| Looks like GitHub org list | Tailwind Plus stacked list; e2e snapshot of name/desc/lang/stars present | e2e (visual-ish) |
| Accessibility (semantic/ARIA/keyboard) | `@axe-core/playwright` (list + error pages) + `@axe-core/cli`; e2e keyboard reaches Next | e2e + cli |
| Error handling | `github.test.ts` throws on non-OK; page renders `role="alert"`; e2e 403 mock | unit + e2e |
| Responsive layout | Tailwind responsive classes from the block; e2e at mobile + desktop viewport | e2e |
| Setup instructions | README; clean-clone run in `verify` | process |
| Tailwind Plus only / no dark mode / DRY | review-gate (no `dark:` classes; single per_page constant) | review |

## Open questions (RESOLVED at approval)
1. **Pagination** — Server-rendered page + Prev/Next using **Next.js `<Link>`** (client-side App Router
   navigation, page still server-renders the data per `?page=N`). _Confirmed by user._
2. **Tailwind** — **v4**. _Confirmed by user._
3. **e2e data** — Hit the **live** GitHub API in e2e (real end-to-end). Mitigate the 60 req/hr
   unauthenticated rate limit by keeping e2e GitHub calls to a minimum and documenting the risk.
   _Confirmed by user._
4. **Branch** — `feat/github-repos-listing`.
5. **Docs-first** — Pull current docs from **context7** (Next.js App Router, Tailwind v4, @axe-core,
   Playwright) into context **before writing any code**. _User requirement._

## Approval
- [x] Approved by iraritchiemeek on 2026-06-24
- Feedback: Prev/Next via Next.js `<Link>`; hit live GitHub in e2e; Tailwind v4; load context7 docs
  (Next.js, axe, etc.) before writing any code.
