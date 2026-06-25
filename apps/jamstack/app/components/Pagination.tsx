import Link from "next/link";
import { type PaginationModel, paginationModel } from "@/lib/pagination";

// Previous/Next links (Tailwind Plus "Simple card footer", see
// docs/tailwind-plus-sources.md). Real anchors so they work without client JS; at
// a boundary the unavailable direction renders as a disabled, non-focusable span.
export function Pagination({
  page,
  count,
  hasPrev,
  hasNext,
  sortKey,
}: {
  page: number;
  count: number;
  hasPrev: boolean;
  hasNext: boolean;
  sortKey?: string;
}) {
  const model: PaginationModel = paginationModel(page, count, hasPrev, hasNext, sortKey);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
    >
      <p className="hidden text-sm text-gray-700 sm:block">
        {count === 0 ? (
          "No results on this page"
        ) : (
          <>
            Showing <span className="font-medium">{model.rangeStart}</span> to{" "}
            <span className="font-medium">{model.rangeEnd}</span>
          </>
        )}
      </p>
      <div className="flex flex-1 justify-between gap-x-3 sm:justify-end">
        <PageLink href={model.prevHref} rel="prev">
          Previous
        </PageLink>
        <PageLink href={model.nextHref} rel="next">
          Next
        </PageLink>
      </div>
    </nav>
  );
}

const BASE =
  "relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold inset-ring";

function PageLink({
  href,
  rel,
  children,
}: {
  href: string | null;
  rel: "prev" | "next";
  children: string;
}) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        className={`${BASE} cursor-not-allowed text-gray-400 inset-ring-gray-200`}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      rel={rel}
      className={`${BASE} text-gray-700 inset-ring-gray-300 hover:bg-gray-50`}
    >
      {children}
    </Link>
  );
}
