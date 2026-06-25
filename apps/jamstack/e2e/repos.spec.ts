import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// These specs run against the real, server-rendered app, which fetches live data
// from the GitHub API (per the brief). Because the fetch happens on the server,
// the browser can't intercept it — so the *error* path is covered deterministically
// by the unit tests (lib/github.test.ts + app/components/ErrorState.test.tsx) rather
// than by injecting a failure here.
//
// Repo rows are counted by their <h2> heading (one per repo), not by listitem,
// because each row also contains a nested topic list.

test.describe("GitHub repositories listing", () => {
  test("shows ten repositories with the toolbar and sort control", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("GitHub repositories");
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(10);
    // The toolbar count line and the sort dropdown are present.
    await expect(page.getByText(/repositor(y|ies)/i).first()).toBeVisible();
    await expect(page.getByLabel("Sort by")).toBeVisible();
  });

  test("each row shows star count and a relative updated time", async ({ page }) => {
    await page.goto("/");
    const firstRow = page.getByRole("listitem").first();
    await expect(firstRow.getByText("stars")).toBeVisible();
    await expect(firstRow.getByText(/Updated/)).toBeVisible();
  });

  test("does not render a search bar (search is out of scope)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByPlaceholder(/search/i)).toHaveCount(0);
  });

  test("disables Previous and offers Next on the first page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Previous" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Next" })).toHaveAttribute("href", /page=2/);
  });

  test("Next navigates to page two, where Previous becomes available", async ({ page }) => {
    await page.goto("/");
    const firstRepoOnPageOne = await page.getByRole("heading", { level: 2 }).first().innerText();

    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/page=2/);

    await expect(page.getByRole("link", { name: "Previous" })).toHaveAttribute("href", /page=1/);
    const firstRepoOnPageTwo = await page.getByRole("heading", { level: 2 }).first().innerText();
    expect(firstRepoOnPageTwo).not.toBe(firstRepoOnPageOne);
  });

  test("pagination Next is operable by keyboard", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Next" }).press("Enter");
    await expect(page).toHaveURL(/page=2/);
  });

  test("the sort dropdown re-sorts via the URL and persists across pagination", async ({
    page,
  }) => {
    await page.goto("/");
    // Selecting a non-default sort updates ?sort= and resets to page 1.
    await page.getByLabel("Sort by").selectOption("name");
    await expect(page).toHaveURL(/sort=name/);
    await expect(page).not.toHaveURL(/page=2/);
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(10);

    // Paging forward keeps the chosen sort in the URL.
    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/sort=name/);
    await expect(page).toHaveURL(/page=2/);
  });

  test("has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
