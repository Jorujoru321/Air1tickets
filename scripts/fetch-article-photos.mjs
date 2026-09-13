/**
 * Download openly-licensed photography for the travel guides.
 *
 *   node scripts/fetch-article-photos.mjs                      # every guide missing one
 *   node scripts/fetch-article-photos.mjs red-eye-flights-guide
 *   node scripts/fetch-article-photos.mjs --force              # re-download everything
 *
 * Run it where there is internet access; the deploy workflow runs it on every
 * build. It writes:
 *   public/images/articles/<slug>.jpg
 *   public/images/articles/CREDITS.json   (photographer + licence per file)
 *   src/data/photos.ts                    (the slug list the site reads)
 *
 * Each article carries a `photoQuery` naming a concrete subject, because a
 * title like "Basic Economy vs Main Cabin" returns nothing useful from a photo
 * library while "airliner cabin interior seats" returns exactly the right shot.
 *
 * Only licences permitting commercial reuse are accepted, and the required
 * attribution is recorded in CREDITS.json. CC BY and CC BY-SA both oblige you
 * to publish that credit — render it on the page or a credits page before you
 * go live. Look at each photo before shipping it: search results are not
 * curated.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/images/articles");
const creditsPath = path.join(outDir, "CREDITS.json");
const registryPath = path.join(root, "src/data/photos.ts");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "Air1Tickets-photo-fetch/1.0 (https://github.com/Jorujoru321/Air1tickets)";

/** Licences that permit commercial use. Anything else is skipped. */
const ALLOWED = [/^cc0/i, /^public domain/i, /^pd/i, /^cc[ -]by(-sa)?[ -]?[0-9.]*$/i];

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlySlugs = args.filter((a) => !a.startsWith("--"));

/** Pull slug + title + photoQuery out of the article data without importing TS. */
function readArticles() {
  const src = fs.readFileSync(path.join(root, "src/content/articles.ts"), "utf8");
  const out = [];
  const re = /slug:\s*"([^"]+)",\s*\n\s*title:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) {
    const after = src.slice(m.index, m.index + 2000);
    const q = /photoQuery:\s*"([^"]+)"/.exec(after);
    out.push({ slug: m[1], title: m[2], query: q?.[1] ?? m[2] });
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

/** Best openly-licensed landscape photo for a subject, or null. */
async function findPhoto(query) {
  for (const term of [query, `${query} airport`, query.split(" ").slice(0, 2).join(" ")]) {
    const data = await api({
      action: "query",
      generator: "search",
      gsrsearch: `${term} filetype:bitmap`,
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
      // Landscape only — these render in 16:9 and 16:10 frames.
      if (!info.width || info.width < info.height * 1.2) continue;
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

/** Rewrite only the ARTICLE_PHOTOS set, leaving the rest of the file alone. */
function writeRegistry(slugs) {
  const src = fs.readFileSync(registryPath, "utf8");
  const start = src.indexOf("export const ARTICLE_PHOTOS");
  if (start === -1) throw new Error("ARTICLE_PHOTOS not found in src/data/photos.ts");
  const open = src.indexOf("([", start);
  const close = src.indexOf("]);", open);
  const list = slugs.length ? slugs.sort().map((s) => `  "${s}",`).join("\n") : "  // none yet — run scripts/fetch-article-photos.mjs";
  fs.writeFileSync(registryPath, `${src.slice(0, open + 2)}\n${list}\n${src.slice(close)}`);
}

const articles = readArticles().filter((a) => (onlySlugs.length ? onlySlugs.includes(a.slug) : true));
if (!articles.length) {
  console.error("No matching articles.");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, "utf8")) : {};

for (const a of articles) {
  const dest = path.join(outDir, `${a.slug}.jpg`);
  if (!force && fs.existsSync(dest)) {
    console.log(`· ${a.slug} already has a photo`);
    continue;
  }
  try {
    const hit = await findPhoto(a.query);
    if (!hit) {
      console.warn(`! ${a.slug}: no openly-licensed photo for "${a.query}" — add one by hand`);
      continue;
    }
    await download(hit.url, dest);
    credits[a.slug] = { author: hit.author, licence: hit.licence, source: hit.source, title: hit.title, query: a.query };
    console.log(`✓ ${a.slug}  ${hit.licence} — ${hit.author}`);
  } catch (e) {
    console.warn(`! ${a.slug}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 350)); // be polite to the API
}

fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
const have = fs
  .readdirSync(outDir)
  .filter((f) => f.endsWith(".jpg"))
  .map((f) => f.replace(/\.jpg$/, ""));
writeRegistry(have);
console.log(`\n${have.length} article photo(s) in public/images/articles`);
