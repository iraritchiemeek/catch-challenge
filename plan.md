# Plan: GitHub-style repository layout + functional sort

## Task brief

Update the `apps/jamstack` layout to match the GitHub org **"All repositories"** screenshot
(`/Users/iraritchiemeek/Desktop/Screenshot 2026-06-25 at 10.39.07 AM.png`), **omitting the activity
graph / sparkline**. Use <https://github.com/orgs/github/repositories> as the style + icon reference.
Search/filter/sort were originally requested via Next.js App Router features (searchParams).

### Decisions captured before planning (from the user)

1. **No search bar at all.** Do **not** implement search **and do not render the search bar** — omit
   it entirely from the layout. (Updated per approval feedback: previously "render inert"; now removed.)
2. **Data-backed meta fields only.** Render only fields the list payload actually provides; do **not**
   invent a separate Pull-requests count (the list API exposes only `open_issues_count`, which
   conflates issues + PRs). So: language (+ colour dot), license, forks, stars, issues, "Updated X ago".
3. **Functional sort; drop the density toggle.** The "Last pushed" dropdown re-sorts via `?sort=`
   (URL-driven, server-rendered). The Comfortable/Compact view toggle is out of scope.
4. **Keep the existing endpoint.** Stay on `GET /orgs/github/repos` (the original brief's endpoint),
   which natively supports `sort`/`direction`/`per_page`/`page` — so functional sort needs no API
   change. Keep ten-per-page Previous/Next pagination.

## Acceptance criteria

Layout / visual (match screenshot, graph omitted):
- [ ] **No "All" heading** and **no search bar** (both removed per feedback). Keep one accessible
      `<h1>` for the page ("GitHub repositories"); it may be visually subdued but must exist for a11y/SEO.
- [ ] A **toolbar row**: a left-aligned **"N repositories"** count; a right-aligned **sort control**
      ("Last pushed" + sort icon + chevron). No density toggle.
- [ ] Each **repo row** shows, in screenshot order: name (link) + **"Public"** badge; description (or a
      muted "No description" line); **topic tags** (blue pills) when present; a **meta row** with
      language + coloured dot, license (scale icon), forks (fork icon), stars (star icon), issues
      (issue icon), and **"Updated X ago"**. **No sparkline.**
- [ ] Icons are GitHub's own (Primer **Octicons**), recorded with provenance.
- [ ] Light mode only; no `dark:` variants (consistent with the existing app).

Functional:
- [ ] The sort dropdown changes the result order via a `?sort=` URL param, server-rendered, and the
      selected option persists on reload and across pagination.
- [ ] Invalid/absent `?sort=` falls back to the default ("Last pushed").
- [ ] Pagination (Previous/Next, ten per page) keeps working and **preserves** the active `?sort=`.
- [ ] Error path unchanged: a non-OK API response still renders the accessible error panel.

Quality:
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` all green from a clean clone; e2e + axe a11y pass.
- [ ] README + `docs/tailwind-plus-sources.md` updated to describe the new layout, icon provenance,
      the sort feature, and the deferred-search note.

## Approach

Stay server-rendered and URL-driven — the pattern the existing app already uses and the canonical
Next.js App Router approach (confirmed against current Next.js docs via context7): the page is a Server
Component reading `searchParams`; the only interactive piece (the sort dropdown) is a small leaf Client
Component that pushes `?sort=` via `useRouter`/`usePathname`/`useSearchParams`. No client-side data
fetching.

The work is mostly **presentation + data-shape**: widen the `Repo` type to the fields the row needs,
map them in `lib/github.ts`, and rebuild the row to the screenshot. Two new pure helpers keep logic out
of components and unit-testable: a **relative-time** formatter ("Updated 7 minutes ago", via
`Intl.RelativeTimeFormat`) and a **sort-option** module (whitelist of `?sort=` values → API
`sort`+`direction`, with the default). A small static **language→colour** map (sourced from GitHub
Linguist) drives the language dot; unknown languages fall back to a neutral dot.

For the header count we fetch the org's `public_repos` via `GET /orgs/github` **in parallel** with the
repos page; if that call fails the count line is simply omitted (the page still renders) — no new hard
failure mode.

Trade-offs accepted:
- **No search** (per instruction) — the search bar is omitted entirely, so there are no dead controls.
- **Issues vs PRs not split** — `open_issues_count` shown as "issues"; PR count omitted (data-backed
  rule). Documented.
- **Pagination stays Previous/Next**, not GitHub's numbered style — out of scope, and numbered paging
  needs a reliable total the list endpoint doesn't give per-page.
- **Star/forks counts** — render GitHub's abbreviated "9.4k" style via a tiny formatter (the screenshot
  shows abbreviated counts); the formatter is pure and unit-tested.

## Decomposition (each step = one RED → GREEN → REFACTOR cycle)

1. **Widen the data layer.** Extend `Repo` (+ `ApiRepo`) with `isPrivate`/visibility, `topics`,
   `license` (spdx/name|null), `forks`, `openIssues`, `pushedAt`/`updatedAt`. Map in `toRepo`.
   — verified by `lib/github.test.ts` (new-field mapping, null license, missing topics → `[]`).
2. **Sort module (`lib/sort.ts`).** `SORT_OPTIONS` (label + `sort`+`direction`), `parseSort(param)`
   → option (default "Last pushed"), and wire `buildReposUrl(page, sort)` to emit `sort`/`direction`.
   — verified by `lib/sort.test.ts` + extended `buildReposUrl` test.
3. **Relative-time helper (`lib/format.ts`).** `relativeTime(iso, now)` → "Updated X ago", plus
   `abbreviateCount(n)` → "9.4k". — verified by `lib/format.test.ts` (time buckets + count buckets).
4. **Octicons (`app/components/icons.tsx`).** Exact Primer Octicon paths (star, repo-forked,
   issue-opened, law, search, sort, dot-fill), `aria-hidden`. Provenance in tailwind-plus-sources.md.
   — verified by render smoke test (renders `<svg>` with given size).
5. **Language colour map (`lib/languages.ts`).** Common language→hex (Linguist), neutral fallback.
   — verified by `lib/languages.test.ts` (known hit, unknown → fallback).
6. **`RepoRow` rebuild (`app/components/RepoList.tsx`).** Render the full screenshot row from `Repo`,
   graph omitted. — verified by `RepoList.test.tsx` (badge, topics, each meta field, empty
   description, no-language case).
7. **Toolbar.** `app/components/Toolbar.tsx` (count + `SortControl`); `SortControl.tsx` is the client
   leaf that updates `?sort=`. No "All" heading. — `SortControl` covered by e2e.
8. **Page wiring (`app/page.tsx`).** Read `searchParams.{page,sort}`, fetch repos + org count in
   parallel, render `<h1>` → toolbar → list → pagination; pagination preserves `sort`.
   — verified by extended `e2e/repos.spec.ts`.
9. **Docs.** README (layout, icon provenance, functional sort, deferred-search + issues/PRs notes) and
   `docs/tailwind-plus-sources.md` (new row provenance + Octicons source).

## Test strategy

| Acceptance criterion | Test(s) | Level |
|---|---|---|
| New fields parsed (license null, topics default, forks/issues/visibility) | `lib/github.test.ts` | unit |
| `?sort=` → API `sort`/`direction`; default + invalid fallback | `lib/sort.test.ts`, `lib/github.test.ts` | unit |
| "Updated X ago" + "9.4k" formatting | `lib/format.test.ts` | unit |
| Language dot colour (known + fallback) | `lib/languages.test.ts` | unit |
| Row renders badge, topics, every meta field, empty states, no graph | `app/components/RepoList.test.tsx` | unit (react-dom/server) |
| Icons render as `<svg>` | `app/components/icons.test.tsx` | unit |
| Count + sort control present (no search bar, no "All" heading); row metadata visible | `e2e/repos.spec.ts` | e2e |
| Sort dropdown updates URL + reorders; sort persists across pagination | `e2e/repos.spec.ts` | e2e |
| Error panel still shown on non-OK | existing `github.test.ts` + `ErrorState.test.tsx` | unit |
| Zero axe a11y violations | `e2e/repos.spec.ts` (`@axe-core/playwright`) | e2e |

## Open questions

_All resolved at approval (see below)._

## Approval

- [x] Approved by iraritchiemeek on 2026-06-25
- Feedback:
  1. **Remove the search bar** — omit it entirely (not rendered inert). ✔ reflected above.
  2. **Header count OK** — add the cached `GET /orgs/github` call for the real count, degrade on failure. ✔
  3. **No "All" heading** — keep a plain accessible `<h1>` ("GitHub repositories"), not "All". ✔
