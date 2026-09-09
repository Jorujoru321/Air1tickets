import { expect, test, type Page } from "@playwright/test";
import { searchUrl, waitForOffers } from "./helpers";

async function startCheckout(page: Page) {
  await page.goto(searchUrl("ORD", "MIA", { days: 35 }));
  const select = await waitForOffers(page);
  await select.first().click();
  await expect(page).toHaveURL(/\/book\//);
  await expect(page.getByRole("heading", { name: /who's traveling/i })).toBeVisible();
}

async function fillPassengerAndContact(page: Page, email: string) {
  await page.locator("#p0-first").fill("Taylor");
  await page.locator("#p0-last").fill("Morgan");
  await page.locator("#p0-dob-m").selectOption({ label: "May" });
  await page.locator("#p0-dob-d").selectOption({ label: "12" });
  await page.locator("#p0-dob-y").selectOption({ label: "1988" });
  await page.locator("#contact-email").fill(email);
  await page.locator("#contact-confirm-email").fill(email);
  await page.locator("#contact-phone").fill("+1 (415) 555-0134");
  await page.getByRole("button", { name: /continue to extras/i }).click();
  await expect(page.getByRole("heading", { name: /add extras/i })).toBeVisible();
  await page.getByRole("button", { name: /continue to payment/i }).click();
  await expect(page.getByRole("heading", { name: /pay securely/i })).toBeVisible();
}

async function payWithCard(page: Page, number: string) {
  await page.locator("#cc-name").fill("Taylor Morgan");
  await page.locator("#cc-number").fill(number);
  await page.locator("#cc-exp").fill("12/30");
  await page.locator("#cc-csc").fill("123");
  await page.locator("#cc-zip").fill("60601");
  await page.locator("#terms").check();
  await page.getByRole("button", { name: /book now/i }).click();
}

test.describe("booking flow (demo payments)", () => {
  test("validation blocks an empty passenger form", async ({ page }) => {
    await startCheckout(page);
    await page.getByRole("button", { name: /continue to extras/i }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /who's traveling/i })).toBeVisible();
  });

  test("books a round trip end to end and shows the confirmation", async ({ page }) => {
    await startCheckout(page);
    await fillPassengerAndContact(page, "taylor.morgan@example.com");
    await payWithCard(page, "4242 4242 4242 4242");
    await expect(page).toHaveURL(/\/confirmation/, { timeout: 45_000 });
    await expect(page.getByRole("heading", { name: /you're booked/i })).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText(/booking reference/i).first()).toBeVisible();
    // The confirmation page exposes the reference; the lookup form finds it again.
    const reference = await page.locator("text=/\\b[A-Z0-9]{8}\\b/").first().textContent();
    expect(reference).toBeTruthy();
  });

  test("a declined card shows an error and stays on the payment step", async ({ page }) => {
    await startCheckout(page);
    await fillPassengerAndContact(page, "declined@example.com");
    await payWithCard(page, "4000 0000 0000 0002");
    await expect(page.getByRole("alert").filter({ hasText: /declined/i }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page).not.toHaveURL(/\/confirmation/);
  });
});
