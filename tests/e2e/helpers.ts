import { expect, type Page } from "@playwright/test";

/** "YYYY-MM-DD" for today + days (UTC-safe enough for tests). */
export function dateFromToday(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function searchUrl(from: string, to: string, opts: { days?: number; nights?: number; adults?: number } = {}): string {
  const depart = dateFromToday(opts.days ?? 28);
  const ret = dateFromToday((opts.days ?? 28) + (opts.nights ?? 7));
  return `/flights/search?from=${from}&to=${to}&depart=${depart}&return=${ret}&adults=${opts.adults ?? 1}`;
}

/** Wait for results to render and return the first "Select" button. */
export async function waitForOffers(page: Page) {
  const select = page.getByRole("link", { name: /^(Select|Lock) .* flight/ });
  await expect(select.first()).toBeVisible({ timeout: 30_000 });
  return select;
}

/** Every JSON-LD block on the page, parsed. */
export async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  return raw.flatMap((t) => {
    const parsed = JSON.parse(t) as unknown;
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [parsed as Record<string, unknown>];
  });
}
