// Data layer for the GitHub org repository listing.
//
// This module is the single place that knows how to talk to the GitHub REST API
// and is deliberately free of React so it can be unit-tested in isolation. The
// page component consumes `fetchRepos` and renders the result.

/** Organisation whose repositories we list. Fixed by the challenge brief. */
const ORG = "github";

/** Page size required by the brief: "showing 10 results at a time". */
export const PER_PAGE = 10;

/** A repository, narrowed to the fields the UI actually renders. */
export interface Repo {
  readonly id: number;
  readonly name: string;
  readonly htmlUrl: string;
  readonly description: string | null;
  readonly language: string | null;
  readonly stars: number;
}

/** Result of fetching a single page, with the navigation state pre-computed. */
export interface ReposPage {
  readonly repos: Repo[];
  readonly page: number;
  readonly hasPrev: boolean;
  readonly hasNext: boolean;
}

/** Thrown when the GitHub API responds with a non-OK status (e.g. 403/404). */
export class GitHubError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GitHubError";
    this.status = status;
  }
}

/** The subset of the GitHub API repo shape we read. */
interface ApiRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
}

/** Coerce any incoming page value to a positive integer (defaults to 1). */
export function normalizePage(page: number): number {
  return Number.isFinite(page) && page > 1 ? Math.floor(page) : 1;
}

/** Build the GitHub API URL for a given page, per the brief's endpoint spec. */
export function buildReposUrl(page: number): string {
  const url = new URL(`https://api.github.com/orgs/${ORG}/repos`);
  url.searchParams.set("sort", "name");
  url.searchParams.set("per_page", String(PER_PAGE));
  url.searchParams.set("page", String(normalizePage(page)));
  return url.toString();
}

function toRepo(api: ApiRepo): Repo {
  return {
    id: api.id,
    name: api.name,
    htmlUrl: api.html_url,
    description: api.description,
    language: api.language,
    stars: api.stargazers_count,
  };
}

/**
 * Fetch one page of repositories. Returns the parsed repos plus pre-computed
 * pagination state: `hasNext` is true when a full page came back (so another may
 * exist), `hasPrev` when we are past page 1. Throws `GitHubError` on a non-OK
 * response so the caller can render an error state instead of crashing.
 */
export async function fetchRepos(page: number): Promise<ReposPage> {
  const current = normalizePage(page);
  const response = await fetch(buildReposUrl(current), {
    headers: { Accept: "application/vnd.github+json" },
    // Repositories change rarely; cache for a minute to stay well under GitHub's
    // unauthenticated rate limit while keeping the list reasonably fresh.
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new GitHubError(response.status, `GitHub API responded with ${response.status}`);
  }

  const data = (await response.json()) as ApiRepo[];
  const repos = data.map(toRepo);

  return {
    repos,
    page: current,
    hasPrev: current > 1,
    hasNext: repos.length === PER_PAGE,
  };
}
