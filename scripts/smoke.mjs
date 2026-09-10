/* Smoke test + screenshots against a running server. Usage: node scripts/smoke.mjs http://127.0.0.1:3100 [outDir] */
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:3100";
const outDir = process.argv[3] ?? ".smoke";
fs.mkdirSync(outDir, { recursive: true });

const today = new Date();
const d = (n) => new Date(today.getTime() + n * 86400000).toISOString().slice(0, 10);
const pages = [
  ["home", "/"],
  ["flights", "/flights"],
  ["results", `/flights/search?from=JFK&to=LAX&depart=${d(28)}&return=${d(35)}&adults=2`],
  ["results-intl", `/flights/search?from=SFO&to=LHR&depart=${d(40)}&adults=1`],
  ["route", "/cheap-flights/new-york-to-los-angeles"],
  ["route-intl", "/cheap-flights/los-angeles-to-tokyo"],
  ["flights-to", "/flights-to/los-angeles"],
  ["flights-from", "/flights-from/new-york"],
  ["airline", "/airlines/delta-air-lines"],
  ["airport", "/airports/jfk"],
  ["destinations", "/destinations"],
  ["destination", "/destinations/cancun"],
  ["deals", "/deals"],
  ["price-lock", "/price-lock"],
  ["guides", "/travel-guides"],
  ["guide", "/travel-guides/how-to-find-cheap-flights"],
  ["help", "/help"],
  ["about", "/about"],
  ["contact", "/contact"],
  ["terms", "/legal/terms"],
  ["booking-lookup", "/booking"],
  ["login", "/account/login"],
  ["price-alerts", "/price-alerts"],
  ["404", "/this-does-not-exist"],
];

// Set PLAYWRIGHT_CHROMIUM_EXECUTABLE to reuse a system Chromium instead of the downloaded one.
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
const results = [];
for (const [name, path] of pages) {
  for (const [vp, w, h] of [["desktop", 1366, 900], ["mobile", 390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 160)}`); });
    const t0 = Date.now();
    let status = 0;
    try {
      const res = await page.goto(base + path, { waitUntil: "networkidle", timeout: 60000 });
      status = res?.status() ?? 0;
    } catch (e) {
      errors.push(`nav: ${e.message.slice(0, 120)}`);
    }
    const ms = Date.now() - t0;
    const info = await page.evaluate(() => ({
      h1: Array.from(document.querySelectorAll("h1")).map((h) => h.textContent.trim().slice(0, 80)),
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
      desc: document.querySelector('meta[name="description"]')?.content?.length ?? 0,
      jsonld: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => { try { const j = JSON.parse(s.textContent); return Array.isArray(j) ? j.map((x) => x["@type"]).join("+") : String(j["@type"]); } catch { return "INVALID"; } }),
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      bad: /undefined|NaN|\[object Object\]|\$0\b/.test(document.body.innerText),
    })).catch(() => ({}));
    if (vp === "desktop" || name === "home" || name === "results" || name === "route" || name === "destination") {
      await page.screenshot({ path: `${outDir}/${name}-${vp}.png`, fullPage: name !== "results" });
    }
    results.push({ name, vp, path, status, ms, ...info, errors: errors.slice(0, 3) });
    await ctx.close();
  }
}
await browser.close();
for (const r of results) {
  const flags = [r.status !== 200 && r.name !== "404" ? `STATUS ${r.status}` : "", r.h1?.length !== 1 ? `H1x${r.h1?.length}` : "", r.overflow ? "OVERFLOW" : "", r.bad ? "BADTEXT" : "", r.jsonld?.includes("INVALID") ? "BADJSONLD" : "", r.errors?.length ? `ERR:${r.errors.join(" | ")}` : ""].filter(Boolean).join(" ");
  console.log(`${r.name.padEnd(16)} ${r.vp.padEnd(8)} ${String(r.status).padEnd(4)} ${String(r.ms).padStart(5)}ms title=${JSON.stringify(r.title?.slice(0, 60))} h1=${JSON.stringify(r.h1?.[0])} ld=[${r.jsonld?.join(",")}] ${flags}`);
}
fs.writeFileSync(`${outDir}/results.json`, JSON.stringify(results, null, 2));
