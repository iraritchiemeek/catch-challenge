import { defineConfig } from "vitest/config";

// be-dev unit/integration tests run in Node (the app's real runtime).
export default defineConfig({
  test: {
    name: "be-dev",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
