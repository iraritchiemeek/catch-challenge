// Data layer for the GitHub org repository listing.
//
// This module is the single place that knows how to talk to the GitHub REST API
// and is deliberately free of React so it can be unit-tested in isolation. The
// page component consumes `fetchRepos` and renders the result.

import { DEFAULT_SORT, type SortOption } from "./sort";

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
  /** `true` for private repos; drives the "Public"/"Private" visibility badge. */
  readonly isPrivate: boolean;
  /** Repository topics shown as pills; always an array (never undefined). */
  readonly topics: readonly string[];
  /** Human-readable license name (e.g. "MIT License"), or null when unlicensed. */
  readonly license: string | null;
  readonly forks: number;
  /** Open issues count (GitHub's `open_issues_count`, which includes PRs). */
  readonly openIssues: number;
  /** ISO timestamps used for the relative "Updated X ago" line. */
  readonly pushedAt: string;
  readonly updatedAt: string;
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
  private: boolean;
  topics?: string[];
  license: { spdx_id: string | null; name: string } | null;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  updated_at: string;
}

/** Coerce any incoming page value to a positive integer (defaults to 1). */
export function normalizePage(page: number): number {
  return Number.isFinite(page) && page > 1 ? Math.floor(page) : 1;
}

/** Build the GitHub API URL for a given page and sort, per the brief's endpoint spec. */
export function buildReposUrl(page: number, sort: SortOption = DEFAULT_SORT): string {
  const url = new URL(`https://api.github.com/orgs/${ORG}/repos`);
  url.searchParams.set("sort", sort.apiSort);
  url.searchParams.set("direction", sort.apiDirection);
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
    isPrivate: api.private,
    topics: api.topics ?? [],
    license: api.license?.name ?? null,
    forks: api.forks_count,
    openIssues: api.open_issues_count,
    pushedAt: api.pushed_at,
    updatedAt: api.updated_at,
  };
}

/**
 * Fetch one page of repositories. Returns the parsed repos plus pre-computed
 * pagination state: `hasNext` is true when a full page came back (so another may
 * exist), `hasPrev` when we are past page 1. Throws `GitHubError` on a non-OK
 * response so the caller can render an error state instead of crashing.
 */
export async function fetchRepos(
  page: number,
  sort: SortOption = DEFAULT_SORT,
): Promise<ReposPage> {
  const current = normalizePage(page);
  const response = await fetch(buildReposUrl(current, sort), {
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

/**
 * The org's total public repository count (GitHub's `public_repos`), used for the
 * "N repositories" toolbar line. This is a best-effort enrichment: any failure
 * (non-OK status or network error) resolves to `null` so the page still renders
 * the list without a count, rather than failing the whole request.
 */
export async function fetchOrgRepoCount(): Promise<number | null> {
  try {
    const response = await fetch(`https://api.github.com/orgs/${ORG}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { public_repos?: number };
    return typeof data.public_repos === "number" ? data.public_repos : null;
  } catch {
    return null;
  }
}
