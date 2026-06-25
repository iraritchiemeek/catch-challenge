"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/sort";
import { ChevronDownIcon, SortIcon } from "./icons";

// The sort dropdown — a leaf Client Component, so the page stays a Server
// Component. A native <select> for accessibility; changing it drives ?sort= via
// the router, which re-runs the server fetch.
export function SortControl({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", event.target.value);
    params.delete("page"); // a new sort order starts again from page 1
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="relative inline-flex items-center gap-x-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
      <SortIcon className="size-4 text-gray-500" />
      <span className="sr-only">Sort by</span>
      <select
        value={current}
        onChange={onChange}
        className="cursor-pointer appearance-none bg-transparent pr-5 focus:outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2 size-4 text-gray-500" />
    </label>
  );
}
