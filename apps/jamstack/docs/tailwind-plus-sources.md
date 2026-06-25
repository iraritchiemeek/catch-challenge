# Visual design provenance

This file records where the app's visual design comes from, so nothing reads as invented. Two
sources are used, both adapted to light-mode only (`dark:` variants removed) with `gray-*` as the
neutral palette:

1. The **repository row + toolbar** are modelled on **GitHub's own** org Repositories page
   (`https://github.com/orgs/github/repositories`), using GitHub's **Primer Octicons** for the icons.
2. The **pagination footer** is a **Tailwind Plus** UI Block.

## 1. Repo row + toolbar — modelled on GitHub's org Repositories page

Reference: `https://github.com/orgs/github/repositories`. Implemented in
`app/components/RepoList.tsx` and `app/components/Toolbar.tsx`. Each row reproduces GitHub's layout —
name link + visibility badge, description, topic pills, and a metadata line (language + colour dot,
license, forks, stars, issues, and a relative "Updated …" time) — with the activity-graph sparkline
**omitted** (out of scope) and no separate pull-request count (the list API only exposes a combined
`open_issues_count`). The full-row overlay link pattern (`<span className="absolute inset-x-0 …" />`)
is kept so the whole row is one accessible click target.

### Icons — Primer Octicons (MIT)

Source: `https://github.com/primer/octicons` (`@primer/octicons`, MIT licensed). The 16px path data
for the glyphs used (star, repo-forked, issue-opened, law, sort-desc, chevron-down, dot-fill) is
inlined in `app/components/icons.tsx` rather than adding the `@primer/octicons-react` dependency for a
handful of icons. The language dot colours are the canonical values from **GitHub Linguist**
(`github/linguist`, MIT), captured as a small map in `lib/languages.ts`.

## 2. Pagination — Application UI → Navigation → Pagination → "Simple card footer"

Source: `https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/pagination` (variant
"Simple card footer"). Adapted into `app/components/Pagination.tsx`: the `<a>` Previous/Next become
Next.js `<Link>`s (or disabled `<span>`s at the ends), and the "Showing X to Y of Z" line becomes
the current page indicator.

```tsx
<nav aria-label="Pagination" className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
  <div className="hidden sm:block">
    <p className="text-sm text-gray-700">
      Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
      <span className="font-medium">20</span> results
    </p>
  </div>
  <div className="flex flex-1 justify-between sm:justify-end">
    <a href="#" className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 inset-ring inset-ring-gray-300 hover:bg-gray-50">Previous</a>
    <a href="#" className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 inset-ring inset-ring-gray-300 hover:bg-gray-50">Next</a>
  </div>
</nav>
```
