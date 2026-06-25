import { describe, expect, it } from "vitest";
import { abbreviateCount, relativeTime, repositoriesLabel } from "./format";

// A fixed "now" so the relative-time assertions are deterministic.
const NOW = new Date("2026-06-25T12:00:00Z");

function ago(ms: number): string {
  return new Date(NOW.getTime() - ms).toISOString();
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("relativeTime", () => {
  it("says 'just now' for very recent timestamps", () => {
    expect(relativeTime(ago(5 * SECOND), NOW)).toBe("just now");
  });

  it("formats minutes", () => {
    expect(relativeTime(ago(7 * MINUTE), NOW)).toBe("7 minutes ago");
    expect(relativeTime(ago(1 * MINUTE), NOW)).toBe("1 minute ago");
  });

  it("formats hours", () => {
    expect(relativeTime(ago(3 * HOUR), NOW)).toBe("3 hours ago");
  });

  it("formats days", () => {
    expect(relativeTime(ago(2 * DAY), NOW)).toBe("2 days ago");
    expect(relativeTime(ago(1 * DAY), NOW)).toBe("1 day ago");
  });

  it("formats weeks for longer spans", () => {
    expect(relativeTime(ago(21 * DAY), NOW)).toBe("3 weeks ago");
  });
});

describe("abbreviateCount", () => {
  it("leaves counts under 1000 as-is", () => {
    expect(abbreviateCount(0)).toBe("0");
    expect(abbreviateCount(28)).toBe("28");
    expect(abbreviateCount(999)).toBe("999");
  });

  it("abbreviates thousands with one decimal, GitHub-style", () => {
    expect(abbreviateCount(1300)).toBe("1.3k");
    expect(abbreviateCount(9400)).toBe("9.4k");
  });

  it("drops a trailing .0", () => {
    expect(abbreviateCount(2000)).toBe("2k");
    expect(abbreviateCount(36000)).toBe("36k");
  });
});

describe("repositoriesLabel", () => {
  it("formats a count with a thousands separator and the noun", () => {
    expect(repositoriesLabel(552)).toBe("552 repositories");
    expect(repositoriesLabel(1234)).toBe("1,234 repositories");
  });

  it("uses the singular for exactly one", () => {
    expect(repositoriesLabel(1)).toBe("1 repository");
  });

  it("falls back to a plain noun when the count is unknown", () => {
    expect(repositoriesLabel(null)).toBe("Repositories");
  });
});
