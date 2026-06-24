# Tailwind Plus component sources

All visual design in this app is sourced from **Tailwind Plus** (tailwindcss.com/plus) UI Blocks —
no bespoke layout is invented. The blocks were extracted as their **HTML** variants and adapted by
mapping customer data in, removing the `dark:` variants (this app is light-mode only), and keeping
`gray-*` as the neutral palette. `public/index.html` holds the static shell (header, `<thead>`,
pagination footer); `public/render.js` builds the `<tbody>` rows with the same per-cell classes.

## 1. Table — Application UI → Lists → Tables → "With hidden columns on mobile"

Source: `https://tailwindcss.com/plus/ui-blocks/application-ui/lists/tables` (variant "With hidden
columns on mobile"). Chosen because customer records are tabular and wide: the block progressively
reveals columns at the `sm`/`lg` breakpoints (`hidden … sm:table-cell` / `lg:table-cell`), so the
table stays readable on a phone. Adapted: the demo's Name/Title/Email/Role columns become
Name / Email / Company / Title / City / Gender / IP address / Website; the per-row "Edit" action link
is dropped (this is a read-only list); the website cell links to the host only (a full query string
would blow out the row).

## 2. Pagination — Application UI → Navigation → Pagination → "Simple card footer"

Source: `https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/pagination` (variant
"Simple card footer"). Adapted: the `<a>` Previous/Next become `<button>`s (navigation is a
client-side `fetch`, not a page load) with the block's classes plus `disabled:` styling for the ends;
the "Showing X to Y of Z results" line becomes a live status of the current range and page.
