import { describe, expect, it } from "vitest";
import { hasNextPage, pageHref, paginationModel } from "./pagination";

describe("hasNextPage", () => {
  it("uses the org total to detect the last page exactly", () => {
    // 25 repos, 10 per page → pages 1 and 2 have a next, page 3 (last) does not.
    expect(hasNextPage(1, 10, 25)).toBe(true);
    expect(hasNextPage(2, 10, 25)).toBe(true);
    expect(hasNextPage(3, 5, 25)).toBe(false);
  });

  it("reports no next page when the total is an exact multiple of the page size", () => {
    // The off-by-one the heuristic got wrong: a full last page must still stop.
    expect(hasNextPage(5, 10, 50)).toBe(false);
    expect(hasNextPage(4, 10, 50)).toBe(true);
  });

  it("falls back to 'a full page came back' when the total is unknown", () => {
    expect(hasNextPage(1, 10, null)).toBe(true);
    expect(hasNextPage(2, 4, null)).toBe(false);
  });
});

describe("pageHref", () => {
  it("encodes the page as a query string", () => {
    expect(pageHref(2)).toBe("?page=2");
  });

  it("preserves a non-default sort so paging keeps the chosen order", () => {
    expect(pageHref(2, "name")).toBe("?page=2&sort=name");
  });

  it("omits the sort param when it is the default (keeps URLs clean)", () => {
    expect(pageHref(2, "pushed")).toBe("?page=2");
  });
});

describe("paginationModel", () => {
  it("has no previous link and a next link on the first full page", () => {
    const model = paginationModel(1, 10, false, true);
    expect(model.prevHref).toBeNull();
    expect(model.nextHref).toBe("?page=2");
    expect(model.rangeStart).toBe(1);
    expect(model.rangeEnd).toBe(10);
  });

  it("links both directions on a middle page", () => {
    const model = paginationModel(2, 10, true, true);
    expect(model.prevHref).toBe("?page=1");
    expect(model.nextHref).toBe("?page=3");
    expect(model.rangeStart).toBe(11);
    expect(model.rangeEnd).toBe(20);
  });

  it("threads the active sort into the prev/next hrefs", () => {
    const model = paginationModel(2, 10, true, true, "name");
    expect(model.prevHref).toBe("?page=1&sort=name");
    expect(model.nextHref).toBe("?page=3&sort=name");
  });

  it("has no next link on the last, partial page", () => {
    const model = paginationModel(4, 3, true, false);
    expect(model.prevHref).toBe("?page=3");
    expect(model.nextHref).toBeNull();
    expect(model.rangeStart).toBe(31);
    expect(model.rangeEnd).toBe(33);
  });

  it("reports an empty range when a page has no repos", () => {
    const model = paginationModel(1, 0, false, false);
    expect(model.rangeStart).toBe(0);
    expect(model.rangeEnd).toBe(0);
  });
});
