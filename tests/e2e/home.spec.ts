import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("renders hero, search tabs and key modules", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Air1 Tickets/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Flights" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("form", { name: "Flight search" })).toBeVisible();
    await expect(page.getByLabel("From", { exact: true })).toBeVisible();
    await expect(page.getByLabel("To", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /popular destinations/i })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText(/Air1 Tickets/);
  });

  test("searching a flight hands off to WhatsApp with the trip written out", async ({ page }) => {
    await page.route("https://wa.me/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<h1>WhatsApp</h1>" }));
    await page.goto("/");
    const from = page.getByLabel("From", { exact: true });
    await from.click();
    await from.fill("JFK");
    await page.getByRole("option", { name: /JFK/ }).first().click();
    const to = page.getByLabel("To", { exact: true });
    await to.click();
    await to.fill("LAX");
    await page.getByRole("option", { name: /LAX/ }).first().click();
    await page.getByRole("button", { name: /get my price/i }).click();
    await page.waitForURL(/wa\.me/);
    const sent = decodeURIComponent(page.url());
    expect(sent).toContain("New York (JFK)");
    expect(sent).toContain("Los Angeles (LAX)");
    expect(sent).toMatch(/Travelers: 1 adult/);
    expect(sent).toMatch(/Cabin: Economy/);
    expect(sent).toContain("What's your best price?");
  });

  test("hotel and activity searches hand off to WhatsApp too", async ({ page }) => {
    await page.route("https://wa.me/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<h1>WhatsApp</h1>" }));
    await page.goto("/hotels");
    await page.getByLabel("Where to").fill("Cancún, Mexico");
    await page.getByRole("button", { name: /get my hotel price/i }).click();
    await page.waitForURL(/wa\.me/);
    let sent = decodeURIComponent(page.url());
    expect(sent).toContain("Where: Cancún, Mexico");
    expect(sent).toMatch(/Check in:/);
    expect(sent).toMatch(/Rooms: 1/);

    await page.goto("/activities");
    await page.getByLabel("Where to").fill("Rome, Italy");
    await page.getByRole("button", { name: /get my options/i }).click();
    await page.waitForURL(/wa\.me/);
    sent = decodeURIComponent(page.url());
    expect(sent).toContain("Where: Rome, Italy");
    expect(sent).toMatch(/Travelers: 2/);
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
