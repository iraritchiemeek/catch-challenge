import { describe, expect, it } from "vitest";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  paginate,
  parsePagination,
  ValidationError,
} from "./pagination.js";

describe("parsePagination", () => {
  it("defaults to page 1 and the default page size when params are absent", () => {
    expect(parsePagination({})).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  });

  it("treats empty strings as absent and uses defaults", () => {
    expect(parsePagination({ page: "", pageSize: "" })).toEqual({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  });

  it("parses valid integer params", () => {
    expect(parsePagination({ page: "3", pageSize: "10" })).toEqual({ page: 3, pageSize: 10 });
  });

  it("clamps an over-large pageSize to the maximum instead of erroring", () => {
    expect(parsePagination({ pageSize: "10000" })).toEqual({
      page: 1,
      pageSize: MAX_PAGE_SIZE,
    });
  });

  it.each([
    "abc",
    "1.5",
    "-1",
    "0",
    " ",
    "1e3",
    "10n",
  ])("rejects garbage page value %j with a ValidationError", (page) => {
    expect(() => parsePagination({ page })).toThrow(ValidationError);
  });

  it.each([
    "abc",
    "2.5",
    "-5",
    "0",
  ])("rejects garbage pageSize value %j with a ValidationError", (pageSize) => {
    expect(() => parsePagination({ pageSize })).toThrow(ValidationError);
  });
});

describe("paginate", () => {
  it("computes meta for a middle page", () => {
    expect(paginate(100, 2, 10)).toEqual({
      page: 2,
      pageSize: 10,
      total: 100,
      totalPages: 10,
      hasPrev: true,
      hasNext: true,
      offset: 10,
    });
  });

  it("has no next on the last page and no prev on the first", () => {
    expect(paginate(25, 1, 10)).toMatchObject({ hasPrev: false, hasNext: true, totalPages: 3 });
    expect(paginate(25, 3, 10)).toMatchObject({ hasPrev: true, hasNext: false, offset: 20 });
  });

  it("reports zero pages and no navigation for an empty table", () => {
    expect(paginate(0, 1, 10)).toMatchObject({
      total: 0,
      totalPages: 0,
      hasPrev: false,
      hasNext: false,
    });
  });

  it("for a page past the end has a prev, no next, and an offset beyond the data", () => {
    expect(paginate(25, 9, 10)).toMatchObject({ hasPrev: true, hasNext: false, offset: 80 });
  });
});
