import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Repo } from "@/lib/github";
import { RepoList } from "./RepoList";

// A fixed "now" keeps the relative "Updated …" line deterministic in assertions.
const NOW = new Date("2026-06-25T12:00:00Z");

function repo(over: Partial<Repo> & { id: number }): Repo {
  // Spread `over` last so an explicit `null` (e.g. a missing description) is
  // preserved rather than falling back to a default.
  return {
    name: `repo-${over.id}`,
    htmlUrl: `https://github.com/github/repo-${over.id}`,
    description: "A description",
    language: "TypeScript",
    stars: 0,
    isPrivate: false,
    topics: [],
    license: "MIT License",
    forks: 0,
    openIssues: 0,
    pushedAt: "2026-06-25T11:00:00Z",
    updatedAt: "2026-06-25T11:00:00Z",
    ...over,
  };
}

function render(repos: Repo[]): string {
  return renderToStaticMarkup(<RepoList repos={repos} now={NOW} />);
}

describe("RepoList", () => {
  it("renders one list item per repo inside a list", () => {
    const html = render([repo({ id: 1 }), repo({ id: 2 }), repo({ id: 3 })]);
    expect(html).toContain('role="list"');
    expect(html.match(/<li/g) ?? []).toHaveLength(3);
  });

  it("links each repo name to its GitHub URL", () => {
    const html = render([repo({ id: 7, name: "octo", htmlUrl: "https://github.com/github/octo" })]);
    expect(html).toContain('href="https://github.com/github/octo"');
    expect(html).toContain("octo");
  });

  it("shows a Public visibility badge for public repos", () => {
    const html = render([repo({ id: 1, isPrivate: false })]);
    expect(html).toContain("Public");
  });

  it("shows a Private badge for private repos", () => {
    const html = render([repo({ id: 1, isPrivate: true })]);
    expect(html).toContain("Private");
  });

  it("renders each topic as a pill", () => {
    const html = render([repo({ id: 1, topics: ["ci", "actions", "copilot"] })]);
    expect(html).toContain("ci");
    expect(html).toContain("actions");
    expect(html).toContain("copilot");
  });

  it("shows the language, license, abbreviated forks/stars/issues and an updated time", () => {
    const html = render([
      repo({
        id: 1,
        language: "Go",
        license: "MIT License",
        forks: 431,
        stars: 4700,
        openIssues: 254,
        pushedAt: "2026-06-25T11:53:00Z", // 7 minutes before NOW
      }),
    ]);
    expect(html).toContain("Go");
    expect(html).toContain("MIT License");
    expect(html).toContain("431"); // forks
    expect(html).toContain("4.7k"); // stars, abbreviated
    expect(html).toContain("254"); // issues
    expect(html).toContain("Updated 7 minutes ago");
  });

  it("omits the language, license and updated dot when those fields are absent", () => {
    const html = render([repo({ id: 1, description: null, language: null, license: null })]);
    expect(html).toContain("No description");
    expect(html).not.toContain("null");
    // No language name leaks through as an empty element.
    expect(html).not.toContain("MIT License");
  });
});
