import { ErrorState } from "@/app/components/ErrorState";
import { Pagination } from "@/app/components/Pagination";
import { RepoList } from "@/app/components/RepoList";
import { fetchRepos, GitHubError, normalizePage } from "@/lib/github";
import { pageHref } from "@/lib/pagination";

// Server Component: the page number comes from the URL (`?page=N`), data is
// fetched on the server, and Previous/Next are real links to other pages — so
// pagination needs no client-side state.
export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = normalizePage(Number(params.page ?? "1"));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">GitHub repositories</h1>
        <p className="mt-1 text-sm text-gray-600">
          Repositories in the <code className="rounded bg-gray-100 px-1 py-0.5">github</code>{" "}
          organisation, ten per page.
        </p>
      </header>
      <Repositories page={page} />
    </main>
  );
}

async function Repositories({ page }: { page: number }) {
  try {
    const { repos, hasPrev, hasNext } = await fetchRepos(page);
    return (
      <section
        aria-label="Repositories"
        className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200"
      >
        {repos.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-gray-500 sm:px-6">
            No repositories to show on this page.
          </p>
        ) : (
          <RepoList repos={repos} />
        )}
        <Pagination page={page} count={repos.length} hasPrev={hasPrev} hasNext={hasNext} />
      </section>
    );
  } catch (error) {
    const status = error instanceof GitHubError ? error.status : undefined;
    return <ErrorState retryHref={pageHref(page)} {...(status !== undefined ? { status } : {})} />;
  }
}
