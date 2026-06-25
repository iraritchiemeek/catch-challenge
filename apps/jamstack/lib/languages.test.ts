import { describe, expect, it } from "vitest";
import { LANGUAGE_FALLBACK_COLOR, languageColor } from "./languages";

describe("languageColor", () => {
  it("returns GitHub's Linguist colour for a known language", () => {
    expect(languageColor("TypeScript")).toBe("#3178c6");
    expect(languageColor("Go")).toBe("#00ADD8");
    expect(languageColor("Python")).toBe("#3572A5");
  });

  it("falls back to a neutral colour for an unknown language", () => {
    expect(languageColor("Whitespace")).toBe(LANGUAGE_FALLBACK_COLOR);
  });

  it("falls back when the language is null", () => {
    expect(languageColor(null)).toBe(LANGUAGE_FALLBACK_COLOR);
  });
});
