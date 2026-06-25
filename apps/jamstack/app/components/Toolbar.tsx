import { repositoriesLabel } from "@/lib/format";
import { SortControl } from "./SortControl";

// `count` is null when the org lookup failed; the label degrades to a plain noun.
export function Toolbar({ count, currentSort }: { count: number | null; currentSort: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
      <p className="text-sm font-semibold text-gray-700">{repositoriesLabel(count)}</p>
      <SortControl current={currentSort} />
    </div>
  );
}
