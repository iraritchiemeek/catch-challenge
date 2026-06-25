// Sort options for the repository list.
//
// Kept as a pure module (no React, no fetch) so the mapping from a URL `?sort=`
// value to the GitHub API's `sort`+`direction` params is unit-tested once and
// reused by both the data layer (`buildReposUrl`) and the UI (`SortControl`).
//
// Only sorts the org repos endpoint actually supports are offered, so every
// control does something real:
//   https://docs.github.com/rest/repos/repos#list-organization-repositories
// (sort ∈ created|updated|pushed|full_name, direction ∈ asc|desc).

/** A user-facing sort choice and the API params it maps to. */
export interface SortOption {
  /** Stable key used in the URL (`?sort=<key>`). */
  readonly key: string;
  /** Label shown in the dropdown. */
  readonly label: string;
  readonly apiSort: "created" | "updated" | "pushed" | "full_name";
  readonly apiDirection: "asc" | "desc";
}

/**
 * Available sorts, in display order. "Last pushed" is first so it is the default
 * (matching the screenshot). "Stars" is intentionally absent: the org repos
 * endpoint cannot sort by stars (only the Search API can), and we don't invent
 * controls that can't be honoured.
 */
export const SORT_OPTIONS: readonly SortOption[] = [
  { key: "pushed", label: "Last pushed", apiSort: "pushed", apiDirection: "desc" },
  { key: "updated", label: "Recently updated", apiSort: "updated", apiDirection: "desc" },
  { key: "name", label: "Name", apiSort: "full_name", apiDirection: "asc" },
  { key: "created", label: "Newest", apiSort: "created", apiDirection: "desc" },
];

/** The default sort applied when `?sort=` is missing or invalid. */
export const DEFAULT_SORT: SortOption = SORT_OPTIONS[0] as SortOption;

/** Resolve a raw `?sort=` value to a known option, falling back to the default. */
export function parseSort(key: string | undefined): SortOption {
  return SORT_OPTIONS.find((option) => option.key === key) ?? DEFAULT_SORT;
}
