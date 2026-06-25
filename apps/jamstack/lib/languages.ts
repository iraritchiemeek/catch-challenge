// Language → dot colour, so the row can render GitHub's coloured language
// indicator. The list repos endpoint returns the language *name* but not its
// colour, so we map names to the canonical hex values from GitHub Linguist
// (github/linguist `lib/linguist/languages.yml`, MIT licensed). Only the
// languages likely to appear in the `github` org are included; anything else
// (or a null language) gets a neutral fallback dot.

/** Neutral grey used when a language has no known colour. */
export const LANGUAGE_FALLBACK_COLOR = "#8b949e";

const LANGUAGE_COLORS: Readonly<Record<string, string>> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Go: "#00ADD8",
  Python: "#3572A5",
  Ruby: "#701516",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Shell: "#89e051",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Dockerfile: "#384d54",
  Vue: "#41b883",
  Scala: "#c22d40",
  Lua: "#000080",
};

/** Resolve a language name to its dot colour, or the neutral fallback. */
export function languageColor(language: string | null): string {
  if (language === null) return LANGUAGE_FALLBACK_COLOR;
  return LANGUAGE_COLORS[language] ?? LANGUAGE_FALLBACK_COLOR;
}
