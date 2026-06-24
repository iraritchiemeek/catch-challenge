import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Repo } from "@/lib/github";
import { RepoList } from "./RepoList";

function repo(over: Partial<Repo> & { id: number }): Repo {
  // Spread `over` last so an explicit `null` (e.g. a missing description) is
  // preserved rather than falling back to a default.
  return {
    name: `repo-${over.id}`,
    htmlUrl: `https://github.com/github/repo-${over.id}`,
    description: "A description",
    language: "TypeScript",
    stars: 0,
    ...over,
  };
}

describe("RepoList", () => {
  it("renders one list item per repo inside a list", () => {
    const html = renderToStaticMarkup(
      <RepoList repos={[repo({ id: 1 }), repo({ id: 2 }), repo({ id: 3 })]} />,
    );
    expect(html).toContain('role="list"');
    expect(html.match(/<li/g) ?? []).toHaveLength(3);
  });

  it("links each repo name to its GitHub URL", () => {
    const html = renderToStaticMarkup(
      <RepoList
        repos={[repo({ id: 7, name: "octo", htmlUrl: "https://github.com/github/octo" })]}
      />,
    );
    expect(html).toContain('href="https://github.com/github/octo"');
    expect(html).toContain("octo");
  });

  it("shows description, language and a pluralised star count", () => {
    const html = renderToStaticMarkup(
      <RepoList repos={[repo({ id: 1, description: "Hello world", language: "Go", stars: 5 })]} />,
    );
    expect(html).toContain("Hello world");
    expect(html).toContain("Go");
    expect(html).toContain("5 stars");
  });

  it("uses the singular 'star' for exactly one star", () => {
    const html = renderToStaticMarkup(<RepoList repos={[repo({ id: 1, stars: 1 })]} />);
    expect(html).toContain("1 star");
    expect(html).not.toContain("1 stars");
  });

  it("degrades gracefully when description and language are missing", () => {
    const html = renderToStaticMarkup(
      <RepoList repos={[repo({ id: 1, description: null, language: null })]} />,
    );
    expect(html).toContain("No description");
    // No empty language paragraph rendered.
    expect(html).not.toContain("null");
  });
});
