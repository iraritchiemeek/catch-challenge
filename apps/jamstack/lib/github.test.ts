import { afterEach, describe, expect, it, vi } from "vitest";
import { buildReposUrl, fetchOrgRepoCount, fetchRepos, GitHubError, PER_PAGE } from "./github";
import { DEFAULT_SORT, parseSort } from "./sort";

// A minimal repo payload shaped like the GitHub REST API response, with only the
// fields we render. `makeApiRepo` lets each test build a page of N repos cheaply.
function makeApiRepo(id: number) {
  return {
    id,
    name: `repo-${id}`,
    html_url: `https://github.com/github/repo-${id}`,
    description: `Description for repo ${id}`,
    language: "TypeScript",
    stargazers_count: id,
    private: false,
    topics: ["ci", "actions"],
    license: { spdx_id: "MIT", name: "MIT License" },
    forks_count: id * 2,
    open_issues_count: id * 3,
    pushed_at: "2026-06-25T10:00:00Z",
    updated_at: "2026-06-25T09:00:00Z",
  };
}

function makeApiPage(count: number) {
  return Array.from({ length: count }, (_, i) => makeApiRepo(i + 1));
}

// Stub global fetch with a single Response-like object.
function stubFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = init;
  const response = {
    ok,
    status,
    json: async () => body,
  } as Response;
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(response);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildReposUrl", () => {
  it("targets the github org repos endpoint with the default sort and 10 per page", () => {
    const url = new URL(buildReposUrl(1, DEFAULT_SORT));
    expect(url.origin + url.pathname).toBe("https://api.github.com/orgs/github/repos");
    // Default sort is "Last pushed" → sort=pushed&direction=desc.
    expect(url.searchParams.get("sort")).toBe("pushed");
    expect(url.searchParams.get("direction")).toBe("desc");
    expect(url.searchParams.get("per_page")).toBe(String(PER_PAGE));
    expect(url.searchParams.get("per_page")).toBe("10");
  });

  it("encodes the requested page number", () => {
    expect(new URL(buildReposUrl(3, DEFAULT_SORT)).searchParams.get("page")).toBe("3");
  });

  it("maps the chosen sort option onto the API sort+direction params", () => {
    const url = new URL(buildReposUrl(1, parseSort("name")));
    expect(url.searchParams.get("sort")).toBe("full_name");
    expect(url.searchParams.get("direction")).toBe("asc");
  });
});

describe("fetchRepos", () => {
  it("requests the page and returns the parsed repos", async () => {
    const spy = stubFetch(makeApiPage(10));
    const result = await fetchRepos(2);

    expect(spy).toHaveBeenCalledWith(buildReposUrl(2), expect.anything());
    expect(result.repos).toHaveLength(10);
    expect(result.repos[0]).toMatchObject({
      name: "repo-1",
      htmlUrl: "https://github.com/github/repo-1",
      description: "Description for repo 1",
      language: "TypeScript",
      stars: 1,
      isPrivate: false,
      topics: ["ci", "actions"],
      license: "MIT License",
      forks: 2,
      openIssues: 3,
      pushedAt: "2026-06-25T10:00:00Z",
      updatedAt: "2026-06-25T09:00:00Z",
    });
    expect(result.page).toBe(2);
  });

  it("maps a missing license to null and missing topics to an empty array", async () => {
    stubFetch([
      {
        id: 1,
        name: "repo-1",
        html_url: "https://github.com/github/repo-1",
        description: null,
        language: null,
        stargazers_count: 0,
        private: false,
        license: null,
        forks_count: 0,
        open_issues_count: 0,
        pushed_at: "2026-06-25T10:00:00Z",
        updated_at: "2026-06-25T09:00:00Z",
        // `topics` deliberately omitted
      },
    ]);
    const result = await fetchRepos(1);
    const first = result.repos[0];
    expect(first?.license).toBeNull();
    expect(first?.topics).toEqual([]);
  });

  it("passes the chosen sort through to the request URL", async () => {
    const spy = stubFetch(makeApiPage(10));
    await fetchRepos(1, parseSort("name"));
    expect(spy).toHaveBeenCalledWith(buildReposUrl(1, parseSort("name")), expect.anything());
  });

  it("sets hasPrev only when past the first page", async () => {
    stubFetch(makeApiPage(PER_PAGE));
    expect((await fetchRepos(1)).hasPrev).toBe(false);
    stubFetch(makeApiPage(PER_PAGE));
    expect((await fetchRepos(2)).hasPrev).toBe(true);
  });

  it("clamps page numbers below 1 up to page 1 (no previous link)", async () => {
    const spy = stubFetch(makeApiPage(10));
    const result = await fetchRepos(0);
    expect(spy).toHaveBeenCalledWith(buildReposUrl(1), expect.anything());
    expect(result.page).toBe(1);
    expect(result.hasPrev).toBe(false);
  });

  it("throws a GitHubError on a non-OK response", async () => {
    stubFetch({ message: "rate limit exceeded" }, { ok: false, status: 403 });
    await expect(fetchRepos(1)).rejects.toBeInstanceOf(GitHubError);
    await expect(fetchRepos(1)).rejects.toMatchObject({ status: 403 });
  });
});

describe("fetchOrgRepoCount", () => {
  it("returns the org's public_repos total", async () => {
    stubFetch({ public_repos: 552 });
    expect(await fetchOrgRepoCount()).toBe(552);
  });

  it("degrades to null on a non-OK response instead of throwing", async () => {
    stubFetch({ message: "not found" }, { ok: false, status: 404 });
    expect(await fetchOrgRepoCount()).toBeNull();
  });

  it("degrades to null when the request throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    expect(await fetchOrgRepoCount()).toBeNull();
  });
});
