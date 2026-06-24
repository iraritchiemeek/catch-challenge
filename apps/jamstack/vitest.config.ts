import { defineConfig } from "vitest/config";

// jamstack unit tests for pure modules (e.g. lib/). Component/page rendering is
// covered by the Playwright e2e suite, so a DOM environment isn't needed here.
export default defineConfig({
  test: {
    name: "jamstack",
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
