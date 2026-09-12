/**
 * Download partner brand logos from Wikimedia Commons.
 *
 *   node scripts/fetch-brand-logos.mjs
 *   node scripts/fetch-brand-logos.mjs --force
 *
 * Writes public/partners/<slug>.svg|png, records each file's licence in
 * public/partners/CREDITS.json, and flips `hasLogoFile` in src/data/partners.ts
 * so the site renders the image instead of the text wordmark.
 *
 * ONLY public-domain files are accepted. Most brand wordmarks on Commons are
 * tagged PD-textlogo — below the threshold of originality, so not protected by
 * copyright. That is a copyright judgement, not a trademark one.
 *
 * TRADEMARK, READ THIS: these logos are registered trademarks of their owners.
 * Showing them to say truthfully "we compare rates across these brands" is
 * nominative use, which is why the strip carries a non-affiliation notice. It
 * does NOT let you imply partnership, endorsement or authorisation. Before you
 * publish: make sure you genuinely shop every brand listed, keep the
 * disclaimer, and if you have a partner agreement follow that brand's usage
 * guidelines instead. Drop any brand you are unsure about.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/partners");
const creditsPath = path.join(outDir, "CREDITS.json");
const partnersPath = path.join(root, "src/data/partners.ts");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "Air1Tickets-logo-fetch/1.0 (https://github.com/Jorujoru321/Air1tickets)";

/** Public domain only. A CC licence on a logo still needs attribution we can't show inline. */
const PUBLIC_DOMAIN = [/^public domain/i, /^pd(-|$)/i, /^cc0/i];

const force = process.argv.includes("--force");

/** Read slug + display name out of the partner list without importing TS. */
function readPartners() {
  const src = fs.readFileSync(partnersPath, "utf8");
  const out = [];
  const re = /\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) out.push({ slug: m[1], name: m[2] });
  return out;
}

async function api(params) {
  const res = await fetch(`${API}?${new URLSearchParams({ format: "json", origin: "*", ...params })}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  return res.json();
}

function licenceOf(meta) {
  return (meta?.LicenseShortName?.value ?? "").replace(/<[^>]+>/g, "").trim();
}

async function findLogo(name) {
  for (const query of [`${name} logo`, `${name} wordmark`, `${name}`]) {
    const data = await api({
      action: "query",
      generator: "search",
      gsrsearch: `${query} logo`,
      gsrnamespace: "6",
      gsrlimit: "20",
      prop: "imageinfo",
      iiprop: "url|extmetadata|mime|size",
      iiurlwidth: "512",
    });
    for (const page of Object.values(data?.query?.pages ?? {})) {
      const info = page.imageinfo?.[0];
      if (!info) continue;
      const ext = info.mime === "image/svg+xml" ? "svg" : info.mime === "image/png" ? "png" : null;
      if (!ext) continue;
      const licence = licenceOf(info.extmetadata);
      if (!PUBLIC_DOMAIN.some((re) => re.test(licence))) continue;
      // Prefer the original SVG; PNGs come through the thumbnailer.
      const url = ext === "svg" ? info.url : (info.thumburl ?? info.url);
      return { url, ext, licence, source: info.descriptionurl ?? page.title, title: page.title };
    }
  }
  return null;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

const partners = readPartners();
fs.mkdirSync(outDir, { recursive: true });
const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, "utf8")) : {};
const got = [];

for (const p of partners) {
  const existing = ["svg", "png"].map((e) => path.join(outDir, `${p.slug}.${e}`)).find((f) => fs.existsSync(f));
  if (!force && existing) {
    got.push({ slug: p.slug, ext: path.extname(existing).slice(1) });
    console.log(`· ${p.slug} already has a logo`);
    continue;
  }
  try {
    const hit = await findLogo(p.name);
    if (!hit) {
      console.warn(`! ${p.slug}: no public-domain logo found — keeping the text wordmark`);
      continue;
    }
    await download(hit.url, path.join(outDir, `${p.slug}.${hit.ext}`));
    credits[p.slug] = { licence: hit.licence, source: hit.source, title: hit.title };
    got.push({ slug: p.slug, ext: hit.ext });
    console.log(`✓ ${p.slug}  ${hit.licence}`);
  } catch (e) {
    console.warn(`! ${p.slug}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 350));
}

fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2));

// Flip hasLogoFile / record the extension for the brands we now have files for.
let src = fs.readFileSync(partnersPath, "utf8");
for (const p of partners) {
  const hit = got.find((g) => g.slug === p.slug);
  const line = new RegExp(`\\{\\s*slug:\\s*"${p.slug}",[^}]*\\}`, "g");
  src = src.replace(line, (m) => {
    const base = m.replace(/,\s*hasLogoFile:\s*(true|false)/g, "").replace(/,\s*logoExt:\s*"[^"]*"/g, "");
    return hit ? base.replace(/\s*\}$/, `, hasLogoFile: true, logoExt: "${hit.ext}" }`) : base;
  });
}
fs.writeFileSync(partnersPath, src);
console.log(`\n${got.length} logo(s) in public/partners. Review them, then confirm you actually shop each brand.`);
