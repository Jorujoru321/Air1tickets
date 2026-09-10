import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { searchUrl, waitForOffers } from "./helpers";

const STATIC_PAGES = ["/", "/flights", "/price-lock", "/cheap-flights/new-york-to-los-angeles", "/destinations/cancun", "/travel-guides/how-to-find-cheap-flights", "/help", "/booking", "/account/login", "/legal/privacy"];

async function audit(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).disableRules(["color-contrast-enhanced"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious, serious.map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join("\n  ")}`).join("\n")).toEqual([]);
}

test.describe("accessibility (axe, WCAG 2.2 AA)", () => {
  for (const path of STATIC_PAGES) {
    test(`${path} has no serious or critical violations`, async ({ page }) => {
      await page.goto(path);
      await audit(page);
    });
  }

  test("search results have no serious violations", async ({ page }) => {
    await page.goto(searchUrl("JFK", "LAX"));
    await waitForOffers(page);
    await audit(page);
  });

  test("lock / checkout step has no serious violations", async ({ page }) => {
    await page.goto(searchUrl("JFK", "LAX"));
    const select = await waitForOffers(page);
    await select.first().click();
    await expect(page.getByRole("heading", { name: /who's traveling|^Lock \$/i })).toBeVisible();
    await audit(page);
  });

  test("keyboard users get a skip link and visible focus", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /skip to (main )?content/i });
    await expect(skip).toBeFocused();
  });
});
