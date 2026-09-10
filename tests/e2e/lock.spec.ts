import { expect, test } from "@playwright/test";
import { searchUrl, waitForOffers } from "./helpers";

test.describe("price lock (lead model)", () => {
  test.skip(process.env.NEXT_PUBLIC_BOOKING_MODE === "checkout", "lead mode only");

  test("results offer Lock this price and WhatsApp with the fare prefilled", async ({ page }) => {
    await page.goto(searchUrl("JFK", "LAX"));
    const lock = await waitForOffers(page);
    await expect(lock.first()).toContainText(/lock this price/i);
    const wa = page.getByRole("link", { name: /ask on whatsapp/i }).first();
    await expect(wa).toHaveAttribute("href", /https:\/\/wa\.me\/\d+\?text=.*JFK/);
    await expect(wa).toHaveAttribute("target", "_blank");
  });

  test("locks a fare end to end and shows the reference", async ({ page }) => {
    await page.goto(searchUrl("ORD", "MIA", { days: 35 }));
    const lock = await waitForOffers(page);
    await lock.first().click();
    await expect(page).toHaveURL(/\/lock\//);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/^Lock \$/);

    // Validation first
    await page.getByRole("button", { name: /^Lock \$/ }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();

    await page.locator("#lock-name").fill("Jordan Lee");
    await page.locator("#lock-phone").fill("+1 (312) 555-0188");
    await page.locator("#lock-email").fill("jordan.lee@example.com");
    await page.locator("label", { hasText: "Phone call" }).click();
    await expect(page.getByRole("radio", { name: /phone call/i })).toBeChecked();
    await page.locator("#lock-notes").fill("Flexible by a day either side.");
    await page.getByRole("button", { name: /^Lock \$/ }).click();

    const status = page.getByRole("status").filter({ hasText: /your fare is locked/i });
    await expect(status).toBeVisible({ timeout: 20_000 });
    await expect(status).toContainText(/L-[A-HJ-NP-Z2-9]{6}/);
    await expect(status).toContainText(/phone call/i);
    const cont = status.getByRole("link", { name: /continue on whatsapp/i });
    await expect(cont).toHaveAttribute("href", /wa\.me\/\d+\?text=.*L-[A-HJ-NP-Z2-9]{6}/);
  });

  test("a stale offer id is handled gracefully", async ({ page }) => {
    await page.goto("/lock/mk_not-a-real-offer");
    await expect(page.getByRole("heading", { name: /no longer available/i })).toBeVisible();
  });

  test("checkout URLs redirect to the lock page in lead mode", async ({ page }) => {
    await page.goto(searchUrl("BOS", "SFO"));
    const lock = await waitForOffers(page);
    const href = await lock.first().getAttribute("href");
    const offerId = href!.replace("/lock/", "");
    await page.goto(`/book/${offerId}`);
    await expect(page).toHaveURL(/\/lock\//);
  });

  test("the leads dashboard requires an admin account", async ({ page, request }) => {
    const res = await request.get("/api/admin/leads/export", { maxRedirects: 0 });
    expect(res.status()).toBe(401);
    await page.goto("/admin/leads");
    await expect(page).toHaveURL(/\/account\/login/);
  });
});
