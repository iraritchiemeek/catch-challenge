import { repositoriesLabel } from "@/lib/format";
import { SortControl } from "./SortControl";

/**
 * The list toolbar: the "N repositories" count on the left and the sort dropdown
 * on the right, matching GitHub's org repositories header. The density toggle in
 * GitHub's UI is intentionally out of scope.
 *
 * `count` is the org-wide repository total (from `GET /orgs/github`); it is null
 * when that lookup failed, in which case the label degrades to a plain noun.
 * `currentSort` is the active sort key, so the dropdown reflects the URL.
 */
export function Toolbar({ count, currentSort }: { count: number | null; currentSort: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
      <p className="text-sm font-semibold text-gray-700">{repositoriesLabel(count)}</p>
      <SortControl current={currentSort} />
    </div>
  );
}
