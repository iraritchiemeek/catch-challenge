// Pure pagination view-model, so the component stays a thin renderer.
import { PER_PAGE } from "./github";
import { DEFAULT_SORT } from "./sort";

export interface PaginationModel {
  readonly page: number;
  readonly prevHref: string | null;
  readonly nextHref: string | null;
  // 1-based range of repos shown; both 0 when the page is empty.
  readonly rangeStart: number;
  readonly rangeEnd: number;
}

// Whether a page after `page` exists. Uses the org total when known so the last
// page is detected exactly (even when the total is a multiple of PER_PAGE);
// otherwise falls back to "a full page came back, so there may be more".
export function hasNextPage(page: number, received: number, total: number | null): boolean {
  if (total !== null) return page * PER_PAGE < total;
  return received === PER_PAGE;
}

// Build the query string for a page, preserving the active sort. The default sort
// is omitted to keep URLs clean (a bare ?page=N).
export function pageHref(page: number, sortKey?: string): string {
  const params = new URLSearchParams({ page: String(page) });
  if (sortKey !== undefined && sortKey !== DEFAULT_SORT.key) {
    params.set("sort", sortKey);
  }
  return `?${params.toString()}`;
}

export function paginationModel(
  page: number,
  count: number,
  hasPrev: boolean,
  hasNext: boolean,
  sortKey?: string,
): PaginationModel {
  const offset = (page - 1) * PER_PAGE;
  return {
    page,
    prevHref: hasPrev ? pageHref(page - 1, sortKey) : null,
    nextHref: hasNext ? pageHref(page + 1, sortKey) : null,
    rangeStart: count === 0 ? 0 : offset + 1,
    rangeEnd: count === 0 ? 0 : offset + count,
  };
}
