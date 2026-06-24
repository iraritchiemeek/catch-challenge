import { defineConfig } from "vitest/config";

// Root Vitest config. Each app contributes a project via its own vitest.config.ts,
// discovered by the glob below — so adding a workspace needs no change here.
export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      // Root project: guarantees Vitest always has at least one project, and
      // hosts any future repo-level tests under tests/. None exist yet.
      {
        test: {
          name: "root",
          environment: "node",
          include: ["tests/**/*.test.ts"],
        },
      },
      // One project per app, discovered automatically — adding a workspace
      // needs no change here.
      "apps/*/vitest.config.ts",
    ],
  },
});
