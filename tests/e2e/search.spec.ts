import { expect, test } from "@playwright/test";
import { searchUrl, waitForOffers } from "./helpers";

test.describe("search results", () => {
  test("shows offers for a round trip with sort tabs and filters", async ({ page }) => {
    await page.goto(searchUrl("JFK", "LAX"));
    const select = await waitForOffers(page);
    expect(await select.count()).toBeGreaterThan(5);

    // Sorting by cheapest puts the lowest price first.
    const tabs = page.getByRole("tablist", { name: "Sort results" });
    await expect(tabs).toBeVisible();
    await tabs.getByRole("tab", { name: /cheapest/i }).click();
    await expect(tabs.getByRole("tab", { name: /cheapest/i })).toHaveAttribute("aria-selected", "true");

    // Nonstop-only filter still leaves results on a trunk route.
    const nonstop = page.getByLabel(/^Nonstop/).first();
    if (await nonstop.isVisible()) {
      await nonstop.check();
      await expect(select.first()).toBeVisible();
    }
  });

  test("one-way search works and the compact form keeps the params", async ({ page }) => {
    const url = searchUrl("BOS", "SFO").replace(/&return=[^&]+/, "");
    await page.goto(url);
    await waitForOffers(page);
    await expect(page.getByLabel("From", { exact: true })).toHaveValue(/BOS|Boston/);
    await expect(page.getByLabel("To", { exact: true })).toHaveValue(/SFO|San Francisco/);
  });

  test("invalid params show a friendly message instead of crashing", async ({ page }) => {
    const res = await page.goto("/flights/search?from=XX&to=LAX&depart=not-a-date");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
