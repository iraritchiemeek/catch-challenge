import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// jamstack unit tests. Pure modules live in lib/ (node env). Presentational
// components are rendered to static markup via react-dom/server — no DOM and no
// extra test deps needed — so their render tests live next to them as *.test.tsx.
// Live integration + accessibility is covered separately by the Playwright e2e suite.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    name: "jamstack",
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.tsx"],
  },
});
