import { ErrorState } from "@/app/components/ErrorState";
import { Pagination } from "@/app/components/Pagination";
import { RepoList } from "@/app/components/RepoList";
import { Toolbar } from "@/app/components/Toolbar";
import { fetchOrgRepoCount, fetchRepos, GitHubError, normalizePage } from "@/lib/github";
import { hasNextPage, pageHref } from "@/lib/pagination";
import { parseSort } from "@/lib/sort";

// Server Component: page number and sort come from the URL (?page=N&sort=key).
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const page = normalizePage(Number(params.page ?? "1"));
  const sort = parseSort(params.sort);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">GitHub repositories</h1>
      <Repositories page={page} sort={sort} />
    </main>
  );
}

async function Repositories({ page, sort }: { page: number; sort: ReturnType<typeof parseSort> }) {
  try {
    // Fetch the page and the org-wide count in parallel; the count is best-effort
    // (null on failure) and also lets us detect the last page exactly.
    const [{ repos, hasPrev }, count] = await Promise.all([
      fetchRepos(page, sort),
      fetchOrgRepoCount(),
    ]);
    const hasNext = hasNextPage(page, repos.length, count);

    return (
      <section
        aria-label="Repositories"
        className="overflow-hidden rounded-lg ring-1 ring-gray-200"
      >
        <Toolbar count={count} currentSort={sort.key} />
        {repos.length === 0 ? (
          <p className="bg-white px-4 py-12 text-center text-sm text-gray-500 sm:px-6">
            No repositories to show on this page.
          </p>
        ) : (
          <div className="bg-white">
            <RepoList repos={repos} />
          </div>
        )}
        <Pagination
          page={page}
          count={repos.length}
          hasPrev={hasPrev}
          hasNext={hasNext}
          sortKey={sort.key}
        />
      </section>
    );
  } catch (error) {
    const status = error instanceof GitHubError ? error.status : undefined;
    return (
      <ErrorState
        retryHref={pageHref(page, sort.key)}
        {...(status !== undefined ? { status } : {})}
      />
    );
  }
}
