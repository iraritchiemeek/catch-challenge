import { describe, expect, it } from "vitest";
import { pageHref, paginationModel } from "./pagination";

describe("pageHref", () => {
  it("encodes the page as a query string", () => {
    expect(pageHref(2)).toBe("?page=2");
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
