import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The be-dev page loads its data client-side from /api/customers, so these specs
// run against the real server (booted by the root Playwright config on :3101) and
// can intercept the API to drive the error path deterministically.
const BASE = "http://localhost:3101";

test.describe("customers list view", () => {
  test("asynchronously loads the first page of customers into the table", async ({ page }) => {
    await page.goto(BASE);
    // The tbody starts as a single "Loading…" row, then fills with 25 records.
    await expect(page.locator("#rows tr")).toHaveCount(25);
    await expect(page.locator("#status")).toContainText("of 1000");
    await expect(page.locator("#rows")).toHaveAttribute("aria-busy", "false");
  });

  test("pages forward and back, reflecting the page in the URL", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("#status")).toContainText("page 1 of 40");
    await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();

    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.locator("#status")).toContainText("page 2 of 40");
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByRole("button", { name: "Previous" })).toBeEnabled();

    await page.getByRole("button", { name: "Previous" }).click();
    await expect(page.locator("#status")).toContainText("page 1 of 40");
  });

  test("shows an accessible error when the API fails", async ({ page }) => {
    await page.route("**/api/customers**", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "boom" }),
      }),
    );
    await page.goto(BASE);
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Could not load customers");
  });

  test("has no detectable accessibility violations once loaded", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("#rows tr")).toHaveCount(25);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
