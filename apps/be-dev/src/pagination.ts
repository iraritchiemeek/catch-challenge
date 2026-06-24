// Pagination input handling, kept separate from HTTP and SQL so the rules are
// unit-testable in isolation and live in exactly one place (the API and the
// page-meta both go through here).

/** Default rows per page when the client doesn't ask for a size. */
export const DEFAULT_PAGE_SIZE = 25;
/** Upper bound on rows per page, so a client can't request an unbounded scan. */
export const MAX_PAGE_SIZE = 100;

/** Thrown for malformed client input; the API maps this to a 400 response. */
export class ValidationError extends Error {
  override readonly name = "ValidationError";
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface PageMeta extends Pagination {
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  offset: number;
}

// A query param is "present" only if it's a non-empty string; absent/empty
// falls back to the default. Anything present must be a positive integer.
function parsePositiveInt(value: string | undefined, field: string): number | undefined {
  if (value === undefined || value === "") return undefined;
  // Pure digits only — rejects "1.5", "-1", "1e3", "10n", whitespace, etc.
  if (!/^\d+$/.test(value)) {
    throw new ValidationError(`Invalid ${field}: expected a positive integer, got "${value}".`);
  }
  const n = Number(value);
  if (n < 1) {
    throw new ValidationError(`Invalid ${field}: must be 1 or greater, got "${value}".`);
  }
  return n;
}

/**
 * Validate raw `?page=&pageSize=` query values into a `Pagination`.
 * Garbage values throw `ValidationError`; an over-large `pageSize` is clamped
 * to `MAX_PAGE_SIZE` rather than rejected (a generous request is not an error).
 */
export function parsePagination(query: { page?: string; pageSize?: string }): Pagination {
  const page = parsePositiveInt(query.page, "page") ?? 1;
  const requested = parsePositiveInt(query.pageSize, "pageSize") ?? DEFAULT_PAGE_SIZE;
  return { page, pageSize: Math.min(requested, MAX_PAGE_SIZE) };
}

/** Derive page metadata (offsets, navigation flags) from a known total. */
export function paginate(total: number, page: number, pageSize: number): PageMeta {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    offset: (page - 1) * pageSize,
  };
}
