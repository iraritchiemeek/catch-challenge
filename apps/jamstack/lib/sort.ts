// Sort options for the repository list. Only sorts the org repos endpoint
// supports are offered (sort ∈ created|updated|pushed|full_name) — no "Stars",
// which needs the Search API.

// A user-facing sort choice and the API params it maps to.
export interface SortOption {
  readonly key: string; // used in the URL as ?sort=<key>
  readonly label: string;
  readonly apiSort: "created" | "updated" | "pushed" | "full_name";
  readonly apiDirection: "asc" | "desc";
}

// "Last pushed" is first, so it is the default.
export const SORT_OPTIONS: readonly SortOption[] = [
  { key: "pushed", label: "Last pushed", apiSort: "pushed", apiDirection: "desc" },
  { key: "updated", label: "Recently updated", apiSort: "updated", apiDirection: "desc" },
  { key: "name", label: "Name", apiSort: "full_name", apiDirection: "asc" },
  { key: "created", label: "Newest", apiSort: "created", apiDirection: "desc" },
];

export const DEFAULT_SORT: SortOption = SORT_OPTIONS[0] as SortOption;

// Resolve a raw ?sort= value to a known option, falling back to the default.
export function parseSort(key: string | undefined): SortOption {
  return SORT_OPTIONS.find((option) => option.key === key) ?? DEFAULT_SORT;
}
