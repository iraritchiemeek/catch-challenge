import { defineConfig, devices } from "@playwright/test";

// Root Playwright config for e2e + accessibility tests.
// Specs live next to the app under test (e.g. apps/jamstack/e2e/*.spec.ts).
// jamstack is the default baseURL; the be-dev spec targets BE_DEV_URL directly.
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;
export const BE_DEV_PORT = 3101;

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
  // Boot both apps so e2e runs against real servers, just like a user.
  webServer: [
    {
      command: `pnpm --filter jamstack dev --port ${PORT}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter be-dev dev",
      env: { PORT: String(BE_DEV_PORT) },
      url: `http://localhost:${BE_DEV_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
