import { abbreviateCount, relativeTime } from "@/lib/format";
import type { Repo } from "@/lib/github";
import { languageColor } from "@/lib/languages";
import { DotFillIcon, ForkIcon, IssueIcon, LawIcon, StarIcon } from "./icons";

/**
 * Repository list styled after GitHub's own org "Repositories" page
 * (https://github.com/orgs/github/repositories). Each row shows the name + a
 * visibility badge, the description, topic pills, and a metadata line
 * (language, license, forks, stars, issues, and a relative "Updated …" time).
 *
 * The activity-graph sparkline on the right of GitHub's rows is intentionally
 * omitted (out of scope). Only data-backed fields are rendered — there is no
 * separate pull-request count because the list API exposes only a combined
 * `open_issues_count`.
 *
 * The full-row overlay link (`absolute inset-x-0 …`) keeps the whole row a single
 * large click target with exactly one accessible link per row; topics and the
 * metadata are non-interactive text so nothing is hidden beneath the overlay.
 *
 * `now` is injected so the relative time is deterministic in tests.
 */
export function RepoList({ repos, now = new Date() }: { repos: Repo[]; now?: Date }) {
  return (
    // biome-ignore lint/a11y/noRedundantRoles: Tailwind's reset (`list-style: none`) drops list semantics in Safari/VoiceOver; the explicit role restores them.
    <ul role="list" className="divide-y divide-gray-200">
      {repos.map((repo) => (
        <RepoRow key={repo.id} repo={repo} now={now} />
      ))}
    </ul>
  );
}

function RepoRow({ repo, now }: { repo: Repo; now: Date }) {
  return (
    <li className="relative flex flex-col gap-2 px-4 py-4 hover:bg-gray-50 sm:px-6">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-[#0969da]">
          <a href={repo.htmlUrl} className="hover:underline">
            <span className="absolute inset-x-0 -top-px bottom-0" />
            {repo.name}
          </a>
        </h2>
        <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-600">
          {repo.isPrivate ? "Private" : "Public"}
        </span>
      </div>

      {repo.description ? (
        <p className="max-w-2xl text-sm text-gray-600">{repo.description}</p>
      ) : (
        <p className="text-sm text-gray-400 italic">No description provided.</p>
      )}

      {repo.topics.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {repo.topics.map((topic) => (
            <li
              key={topic}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
            >
              {topic}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
        {repo.language ? (
          <span className="inline-flex items-center gap-x-1.5">
            <DotFillIcon className="size-[0.9rem]" color={languageColor(repo.language)} />
            {repo.language}
          </span>
        ) : null}
        {repo.license ? (
          <MetaItem icon={<LawIcon className="size-4 text-gray-500" />} label={repo.license} />
        ) : null}
        {repo.forks > 0 ? (
          <MetaItem
            icon={<ForkIcon className="size-4 text-gray-500" />}
            label={abbreviateCount(repo.forks)}
            srLabel="forks"
          />
        ) : null}
        <MetaItem
          icon={<StarIcon className="size-4 text-gray-500" />}
          label={abbreviateCount(repo.stars)}
          srLabel="stars"
        />
        {repo.openIssues > 0 ? (
          <MetaItem
            icon={<IssueIcon className="size-4 text-gray-500" />}
            label={abbreviateCount(repo.openIssues)}
            srLabel="open issues"
          />
        ) : null}
        <span>Updated {relativeTime(repo.pushedAt, now)}</span>
      </div>
    </li>
  );
}

/** A single icon + value in the metadata line, with an SR-only noun for context. */
function MetaItem({
  icon,
  label,
  srLabel,
}: {
  icon: React.ReactNode;
  label: string;
  srLabel?: string;
}) {
  return (
    <span className="inline-flex items-center gap-x-1">
      {icon}
      <span>{label}</span>
      {srLabel ? <span className="sr-only">{srLabel}</span> : null}
    </span>
  );
}
