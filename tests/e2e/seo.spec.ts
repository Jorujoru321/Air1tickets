import { expect, test } from "@playwright/test";
import { jsonLd } from "./helpers";

const PAGES = ["/", "/flights", "/hotels", "/activities", "/price-lock", "/cheap-flights/new-york-to-los-angeles", "/flights-to/los-angeles", "/airlines/delta-air-lines", "/airports/jfk", "/destinations/cancun", "/travel-guides/how-to-find-cheap-flights", "/help"];

test.describe("SEO", () => {
  for (const path of PAGES) {
    test(`${path} has canonical, description, OG tags, one H1 and JSON-LD`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute("href", new RegExp(`${path === "/" ? "/?$" : path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"}`));
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description?.length ?? 0).toBeGreaterThan(50);
      expect(description?.length ?? 0).toBeLessThanOrEqual(160);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      expect(await page.locator("h1").count()).toBe(1);
      const ld = await jsonLd(page);
      expect(ld.length).toBeGreaterThan(0);
      const types = ld.map((o) => o["@type"]);
      expect(types.some((t) => typeof t === "string")).toBeTruthy();
      const title = await page.title();
      expect(title.length).toBeLessThanOrEqual(80);
    });
  }

  test("route page carries Flight + FAQ + Breadcrumb structured data", async ({ page }) => {
    await page.goto("/cheap-flights/new-york-to-los-angeles");
    const types = (await jsonLd(page)).map((o) => o["@type"]);
    expect(types).toContain("Flight");
    expect(types).toContain("FAQPage");
    expect(types).toContain("BreadcrumbList");
  });

  test("uppercase airport and route slugs redirect permanently to lowercase", async ({ request }) => {
    const r1 = await request.get("/airports/JFK", { maxRedirects: 0 });
    expect(r1.status()).toBe(308);
    expect(r1.headers().location).toMatch(/\/airports\/jfk$/);
    const r2 = await request.get("/destinations/Cancun", { maxRedirects: 0 });
    expect(r2.status()).toBe(308);
  });

  test("sitemap, robots and manifest are served", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain("<urlset");
    expect(xml).toContain("/cheap-flights/new-york-to-los-angeles");
    expect(xml).toContain("/destinations/cancun");
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toMatch(/Sitemap:/);
    const manifest = await request.get("/manifest.webmanifest");
    expect(manifest.status()).toBe(200);
  });

  test("search results and booking pages are noindex; unknown pages 404", async ({ page, request }) => {
    await page.goto("/flights/search?from=JFK&to=LAX&depart=2099-01-10&return=2099-01-17");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const missing = await request.get("/destinations/atlantis");
    expect(missing.status()).toBe(404);
    const missing2 = await request.get("/cheap-flights/nowhere-to-nowhere");
    expect(missing2.status()).toBe(404);
  });

  test("dynamic Open Graph image renders", async ({ request }) => {
    const res = await request.get("/opengraph-image?title=Cheap%20flights");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/image\/png/);
  });
});
