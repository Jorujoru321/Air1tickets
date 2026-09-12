/**
 * Download openly-licensed destination photography from Wikimedia Commons.
 *
 *   node scripts/fetch-photos.mjs              # every destination missing a photo
 *   node scripts/fetch-photos.mjs cancun rome  # just these slugs
 *   node scripts/fetch-photos.mjs --force      # re-download everything
 *
 * Run it on a machine with internet access. It writes:
 *   public/images/destinations/<slug>.jpg
 *   public/images/destinations/CREDITS.json   (photographer + licence per file)
 *   src/data/photos.ts                        (the slug list the site reads)
 *
 * Only files under licences that allow commercial reuse are accepted, and the
 * required attribution is recorded in CREDITS.json. Most of these licences
 * (anything CC BY or CC BY-SA) require you to publish that credit — render it
 * on the page or on a credits page before you go live. Check each photo before
 * you ship it: search results are not curated and can be unflattering.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/images/destinations");
const creditsPath = path.join(outDir, "CREDITS.json");
const registryPath = path.join(root, "src/data/photos.ts");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "Air1Tickets-photo-fetch/1.0 (https://github.com/Jorujoru321/Air1tickets)";

/** Licences that permit commercial use. Anything else is skipped. */
const ALLOWED = [/^cc0/i, /^public domain/i, /^pd/i, /^cc[ -]by(-sa)?[ -]?[0-9.]*$/i];

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlySlugs = args.filter((a) => !a.startsWith("--"));

/** Pull slug + city + country out of the destination data without importing TS. */
function readDestinations() {
  const files = ["src/data/destinations/us.ts", "src/data/destinations/international.ts"].map((f) => fs.readFileSync(path.join(root, f), "utf8"));
  const out = [];
  for (const src of files) {
    const re = /slug:\s*"([^"]+)"[\s\S]*?city:\s*"([^"]+)"[\s\S]*?country:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(src))) out.push({ slug: m[1], city: m[2], country: m[3] });
  }
  return out;
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", origin: "*", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  return res.json();
}

function licenceOf(meta) {
  const name = meta?.LicenseShortName?.value ?? meta?.License?.value ?? "";
  return name.replace(/<[^>]+>/g, "").trim();
}

function authorOf(meta) {
  return (meta?.Artist?.value ?? "Unknown")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

/** Best openly-licensed landscape photo for a city, or null. */
async function findPhoto(city, country) {
  for (const query of [`${city} ${country} skyline`, `${city} ${country} cityscape`, `${city} ${country}`]) {
    const data = await api({
      action: "query",
      generator: "search",
      gsrsearch: `${query} filetype:bitmap`,
      gsrnamespace: "6",
      gsrlimit: "20",
      prop: "imageinfo",
      iiprop: "url|extmetadata|size|mime",
      iiurlwidth: "1600",
    });
    const pages = Object.values(data?.query?.pages ?? {});
    for (const page of pages) {
      const info = page.imageinfo?.[0];
      if (!info || info.mime !== "image/jpeg") continue;
      if (!info.width || info.width < info.height * 1.2) continue; // landscape only
      const licence = licenceOf(info.extmetadata);
      if (!ALLOWED.some((re) => re.test(licence))) continue;
      return { url: info.thumburl ?? info.url, licence, author: authorOf(info.extmetadata), source: info.descriptionurl ?? page.title, title: page.title };
    }
  }
  return null;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

function writeRegistry(slugs) {
  const header = fs.readFileSync(registryPath, "utf8").split("export const DESTINATION_PHOTOS")[0];
  const list = slugs.length ? slugs.sort().map((s) => `  "${s}",`).join("\n") : "  // none yet — run scripts/fetch-photos.mjs";
  const rest = fs.readFileSync(registryPath, "utf8").split("]);").slice(1).join("]);");
  fs.writeFileSync(registryPath, `${header}export const DESTINATION_PHOTOS: ReadonlySet<string> = new Set<string>([\n${list}\n]);${rest}`);
}

const destinations = readDestinations().filter((d) => (onlySlugs.length ? onlySlugs.includes(d.slug) : true));
if (!destinations.length) {
  console.error("No matching destinations.");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, "utf8")) : {};

for (const d of destinations) {
  const dest = path.join(outDir, `${d.slug}.jpg`);
  if (!force && fs.existsSync(dest)) {
    console.log(`· ${d.slug} already has a photo`);
    continue;
  }
  try {
    const hit = await findPhoto(d.city, d.country);
    if (!hit) {
      console.warn(`! ${d.slug}: no openly-licensed photo found — add one by hand`);
      continue;
    }
    await download(hit.url, dest);
    credits[d.slug] = { author: hit.author, licence: hit.licence, source: hit.source, title: hit.title };
    console.log(`✓ ${d.slug}  ${hit.licence} — ${hit.author}`);
  } catch (e) {
    console.warn(`! ${d.slug}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 350)); // be polite to the API
}

fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
const have = fs
  .readdirSync(outDir)
  .filter((f) => f.endsWith(".jpg"))
  .map((f) => f.replace(/\.jpg$/, ""));
writeRegistry(have);
console.log(`\n${have.length} photo(s) in public/images/destinations. Credits written to CREDITS.json.`);
console.log("Review each image, then commit. Attribution is required for CC BY / CC BY-SA files.");
