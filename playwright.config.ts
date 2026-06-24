import { defineConfig, devices } from "@playwright/test";

// Root Playwright config for e2e + accessibility tests.
// Specs live next to the app under test (e.g. apps/jamstack/e2e/*.spec.ts).
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./apps",
  testMatch: "**/e2e/**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Boots the jamstack app so e2e runs against a real server, just like a user.
  webServer: {
    command: `pnpm --filter jamstack dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
