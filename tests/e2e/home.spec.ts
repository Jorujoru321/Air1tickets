import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("renders hero, search form and key modules", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Air1 Tickets/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("form", { name: "Flight search" })).toBeVisible();
    await expect(page.getByLabel("From", { exact: true })).toBeVisible();
    await expect(page.getByLabel("To", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /popular destinations/i })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText(/Air1 Tickets/);
  });

  test("searching from the form navigates to results", async ({ page }) => {
    await page.goto("/");
    const from = page.getByLabel("From", { exact: true });
    await from.click();
    await from.fill("JFK");
    await page.getByRole("option", { name: /JFK/ }).first().click();
    const to = page.getByLabel("To", { exact: true });
    await to.click();
    await to.fill("LAX");
    await page.getByRole("option", { name: /LAX/ }).first().click();
    await page.getByRole("button", { name: /search flights/i }).click();
    await expect(page).toHaveURL(/\/flights\/search\?.*from=JFK.*to=LAX/);
  });

  test("destination tiles link to guides", async ({ page }) => {
    await page.goto("/");
    const tile = page.locator('a[href^="/destinations/"]').first();
    await expect(tile).toBeVisible();
    await tile.click();
    await expect(page).toHaveURL(/\/destinations\/[a-z-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/travel guide/i);
  });
});
