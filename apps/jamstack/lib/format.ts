// Pure formatters for the repo row.

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

// Ordered largest-first so we pick the coarsest unit that fits.
const UNITS: ReadonlyArray<readonly [seconds: number, name: string]> = [
  [YEAR, "year"],
  [MONTH, "month"],
  [WEEK, "week"],
  [DAY, "day"],
  [HOUR, "hour"],
  [MINUTE, "minute"],
];

// "7 minutes ago"; under a minute is "just now". `now` is injected for testability.
export function relativeTime(iso: string, now: Date): string {
  const seconds = Math.floor((now.getTime() - new Date(iso).getTime()) / 1000);
  if (seconds < MINUTE) return "just now";

  for (const [unitSeconds, name] of UNITS) {
    if (seconds >= unitSeconds) {
      const value = Math.floor(seconds / unitSeconds);
      return `${value} ${name}${value === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}

// GitHub-style: 999 → "999", 1300 → "1.3k", 2000 → "2k".
export function abbreviateCount(n: number): string {
  if (n < 1000) return String(n);
  const thousands = n / 1000;
  const rounded = Math.round(thousands * 10) / 10;
  return `${rounded}k`;
}

// The toolbar count line, e.g. "552 repositories"; a null total degrades to "Repositories".
export function repositoriesLabel(count: number | null): string {
  if (count === null) return "Repositories";
  return `${count.toLocaleString("en-US")} ${count === 1 ? "repository" : "repositories"}`;
}
