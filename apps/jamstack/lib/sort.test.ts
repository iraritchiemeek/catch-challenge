import { describe, expect, it } from "vitest";
import { DEFAULT_SORT, parseSort, SORT_OPTIONS } from "./sort";

describe("SORT_OPTIONS", () => {
  it("defaults to 'Last pushed'", () => {
    expect(DEFAULT_SORT.key).toBe("pushed");
    expect(DEFAULT_SORT.label).toBe("Last pushed");
    expect(DEFAULT_SORT.apiSort).toBe("pushed");
    expect(DEFAULT_SORT.apiDirection).toBe("desc");
    expect(SORT_OPTIONS[0]).toBe(DEFAULT_SORT);
  });
});

describe("parseSort", () => {
  it("returns the matching option for a known key", () => {
    expect(parseSort("name").key).toBe("name");
    expect(parseSort("name").apiSort).toBe("full_name");
  });

  it("falls back to the default for an unknown key", () => {
    expect(parseSort("bogus")).toBe(DEFAULT_SORT);
  });

  it("falls back to the default when the key is absent", () => {
    expect(parseSort(undefined)).toBe(DEFAULT_SORT);
  });
});
