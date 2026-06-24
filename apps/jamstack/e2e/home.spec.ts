import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page renders its heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hello, Catch!");
});

test("home page has no detectable accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
