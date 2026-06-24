// Pure pagination view-model. Keeping this out of the React component means the
// "which links exist and what range are we showing" logic is unit-tested once and
// the component stays a thin renderer (DRY).
import { PER_PAGE } from "./github";

export interface PaginationModel {
  readonly page: number;
  /** Href for the previous page, or null when there is no previous page. */
  readonly prevHref: string | null;
  /** Href for the next page, or null when there is no next page. */
  readonly nextHref: string | null;
  /** 1-based index of the first repo shown (0 when the page is empty). */
  readonly rangeStart: number;
  /** 1-based index of the last repo shown (0 when the page is empty). */
  readonly rangeEnd: number;
}

/** Build the query string that selects a given page. */
export function pageHref(page: number): string {
  return `?page=${page}`;
}

/**
 * Derive the pagination view-model from the current page, the number of repos on
 * it, and whether previous/next pages exist.
 */
export function paginationModel(
  page: number,
  count: number,
  hasPrev: boolean,
  hasNext: boolean,
): PaginationModel {
  const offset = (page - 1) * PER_PAGE;
  return {
    page,
    prevHref: hasPrev ? pageHref(page - 1) : null,
    nextHref: hasNext ? pageHref(page + 1) : null,
    rangeStart: count === 0 ? 0 : offset + 1,
    rangeEnd: count === 0 ? 0 : offset + count,
  };
}
