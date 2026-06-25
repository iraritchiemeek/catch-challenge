// Primer Octicons (MIT) inlined as SVG paths rather than depending on
// @primer/octicons-react for a handful of glyphs. All are decorative (aria-hidden).

type IconProps = { className?: string | undefined };

// Shared 16×16 Octicon frame.
function Octicon({
  className,
  children,
}: {
  className?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="currentColor"
      aria-hidden="true"
      {...(className !== undefined ? { className } : {})}
    >
      {children}
    </svg>
  );
}

/** star (outline) — Octicon `star-16`. */
export function StarIcon({ className }: IconProps) {
  return (
    <Octicon className={className}>
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z" />
    </Octicon>
  );
}

/** forks — Octicon `repo-forked-16`. */
export function ForkIcon({ className }: IconProps) {
  return (
    <Octicon className={className}>
      <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
    </Octicon>
  );
}

/** open issues — Octicon `issue-opened-16`. */
export function IssueIcon({ className }: IconProps) {
  return (
    <Octicon className={className}>
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
    </Octicon>
  );
}

/** license — Octicon `law-16` (scales of justice). */
export function LawIcon({ className }: IconProps) {
  return (
    <Octicon className={className}>
      <path d="M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.176-.441.327-.686.45C14.556 10.78 13.88 11 13 11a3.998 3.998 0 0 1-1.873-.45 3.613 3.613 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L12.178 4.5h-.162c-.305 0-.604-.079-.868-.231l-1.29-.736a.245.245 0 0 0-.124-.033H8.75V13h2.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h2.5V3.5h-.984a.245.245 0 0 0-.124.033l-1.289.737c-.265.15-.564.23-.869.23h-.162l2.112 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.016.015-.045.04c-.21.176-.441.327-.686.45C4.556 10.78 3.88 11 3 11a3.998 3.998 0 0 1-1.873-.45 3.613 3.613 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L2.328 4.5H1.9a.75.75 0 0 1 0-1.5h2.234a.249.249 0 0 0 .125-.033l1.288-.737c.265-.15.564-.23.869-.23h.984V.75a.75.75 0 0 1 1.5 0Zm2.945 8.477c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327Zm-10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327Z" />
    </Octicon>
  );
}

/** sort direction — Octicon `sort-desc-16`, shown beside the sort dropdown. */
export function SortIcon({ className }: IconProps) {
  return (
    <Octicon className={className}>
      <path d="M0 4.25a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 4.25Zm0 4a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 8.25Zm0 4a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75ZM11.5 15a.75.75 0 0 1-.534-.224l-2.25-2.27a.75.75 0 1 1 1.068-1.052l.966.974V6.75a.75.75 0 0 1 1.5 0v5.927l.966-.974a.75.75 0 1 1 1.068 1.053l-2.25 2.27A.75.75 0 0 1 11.5 15Z" />
    </Octicon>
  );
}

/** chevron — Octicon `chevron-down-16`, the dropdown affordance. */
export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Octicon className={className}>
      <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z" />
    </Octicon>
  );
}

/**
 * Filled dot — Octicon `dot-fill-16` — used as the language colour indicator.
 * `color` paints the dot via `fill` (Linguist colours aren't Tailwind tokens).
 */
export function DotFillIcon({ className, color }: IconProps & { color?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      aria-hidden="true"
      {...(color !== undefined ? { style: { color } } : {})}
      {...(className !== undefined ? { className } : {})}
    >
      <path fill="currentColor" d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
    </svg>
  );
}
