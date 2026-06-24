# Tailwind Plus component sources

All visual design in this app is sourced from **Tailwind Plus** (tailwindcss.com/plus) UI Blocks —
no bespoke layout is invented. The raw extracted markup is recorded here for provenance. The
components in `app/components/` are these blocks with data mapped in, `dark:` variants removed
(this app is light-mode only), and `gray-*` kept as the neutral palette.

## 1. Repo list — Application UI → Lists → Stacked lists → "With links"

Source: `https://tailwindcss.com/plus/ui-blocks/application-ui/lists/stacked-lists` (variant "With links").
Adapted into `app/components/RepoList.tsx`: avatar image dropped, `name` → repo name link,
`email` line → description, right-hand `role`/`lastSeen` → language + star count. The full-row
overlay link pattern (`<span className="absolute inset-x-0 ..." />`) is preserved for an accessible
click target.

```tsx
<ul role="list" className="divide-y divide-gray-100">
  {people.map((person) => (
    <li key={person.email} className="relative flex justify-between gap-x-6 py-5">
      <div className="flex min-w-0 gap-x-4">
        <div className="min-w-0 flex-auto">
          <p className="text-sm/6 font-semibold text-gray-900">
            <a href={person.href}>
              <span className="absolute inset-x-0 -top-px bottom-0" />
              {person.name}
            </a>
          </p>
          <p className="mt-1 flex text-xs/5 text-gray-500">{person.email}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-x-4">
        <div className="hidden sm:flex sm:flex-col sm:items-end">
          <p className="text-sm/6 text-gray-900">{person.role}</p>
        </div>
        <ChevronRightIcon aria-hidden="true" className="size-5 flex-none text-gray-400" />
      </div>
    </li>
  ))}
</ul>
```

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
