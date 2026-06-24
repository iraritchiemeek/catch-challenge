import type { Repo } from "@/lib/github";

/**
 * Repository list, styled after Tailwind Plus → Application UI → Lists →
 * Stacked lists ("With links"). See docs/tailwind-plus-sources.md for the source
 * markup. The full-row overlay link (`absolute inset-x-0 …`) makes each row a
 * single, large click/tap target while keeping one accessible link per row.
 */
export function RepoList({ repos }: { repos: Repo[] }) {
  return (
    // biome-ignore lint/a11y/noRedundantRoles: Tailwind's reset (`list-style: none`) drops list semantics in Safari/VoiceOver; the explicit role restores them.
    <ul role="list" className="divide-y divide-gray-100">
      {repos.map((repo) => (
        <li
          key={repo.id}
          className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6"
        >
          <div className="min-w-0 flex-auto">
            <p className="text-sm/6 font-semibold text-gray-900">
              <a href={repo.htmlUrl}>
                <span className="absolute inset-x-0 -top-px bottom-0" />
                {repo.name}
              </a>
            </p>
            {repo.description ? (
              <p className="mt-1 line-clamp-2 text-sm/5 text-gray-600">{repo.description}</p>
            ) : (
              <p className="mt-1 text-sm/5 text-gray-400 italic">No description provided.</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {repo.language ? <p className="text-sm/6 text-gray-700">{repo.language}</p> : null}
            <p className="text-xs/5 text-gray-500">
              {repo.stars} {repo.stars === 1 ? "star" : "stars"}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
