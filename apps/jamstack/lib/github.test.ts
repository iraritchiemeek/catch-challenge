import { afterEach, describe, expect, it, vi } from "vitest";
import { buildReposUrl, fetchRepos, GitHubError, PER_PAGE } from "./github";

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
  it("targets the github org repos endpoint with name sort and 10 per page", () => {
    const url = new URL(buildReposUrl(1));
    expect(url.origin + url.pathname).toBe("https://api.github.com/orgs/github/repos");
    expect(url.searchParams.get("sort")).toBe("name");
    expect(url.searchParams.get("per_page")).toBe(String(PER_PAGE));
    expect(url.searchParams.get("per_page")).toBe("10");
  });

  it("encodes the requested page number", () => {
    expect(new URL(buildReposUrl(3)).searchParams.get("page")).toBe("3");
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
    });
    expect(result.page).toBe(2);
  });

  it("reports a next page when a full page of results comes back", async () => {
    stubFetch(makeApiPage(PER_PAGE));
    const result = await fetchRepos(1);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrev).toBe(false);
  });

  it("reports no next page when a partial page comes back", async () => {
    stubFetch(makeApiPage(4));
    const result = await fetchRepos(2);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(true);
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
