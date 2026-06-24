import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// These specs run against the real, server-rendered app, which fetches live data
// from the GitHub API (per the brief). Because the fetch happens on the server,
// the browser can't intercept it — so the *error* path is covered deterministically
// by the unit tests (lib/github.test.ts + app/components/ErrorState.test.tsx) rather
// than by injecting a failure here.

test.describe("GitHub repositories listing", () => {
  test("shows ten repositories on the first page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("GitHub repositories");
    await expect(page.getByRole("listitem")).toHaveCount(10);
  });

  test("disables Previous and offers Next on the first page", async ({ page }) => {
    await page.goto("/");
    // Previous is rendered as a disabled, non-link span at the start of the list.
    await expect(page.getByRole("link", { name: "Previous" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Next" })).toHaveAttribute("href", /page=2/);
  });

  test("Next navigates to page two, where Previous becomes available", async ({ page }) => {
    await page.goto("/");
    const firstRepoOnPageOne = await page.getByRole("listitem").first().innerText();

    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/page=2/);

    await expect(page.getByRole("link", { name: "Previous" })).toHaveAttribute("href", /page=1/);
    const firstRepoOnPageTwo = await page.getByRole("listitem").first().innerText();
    expect(firstRepoOnPageTwo).not.toBe(firstRepoOnPageOne);
  });

  test("pagination Next is operable by keyboard", async ({ page }) => {
    await page.goto("/");
    // Focus the control and activate it with the keyboard — proving it is a real,
    // keyboard-operable link, not a click-only widget.
    await page.getByRole("link", { name: "Next" }).press("Enter");
    await expect(page).toHaveURL(/page=2/);
  });

  test("has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
