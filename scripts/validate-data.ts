/**
 * Mechanical validation of the curated datasets in src/data and src/content.
 * Run: npx tsx scripts/validate-data.ts
 * Exits non-zero and prints every problem found. Missing datasets are skipped
 * with a notice so this can run while the project is still being built.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs";

type Problem = string;
const problems: Problem[] = [];
const notices: string[] = [];
const root = path.resolve(__dirname, "..");

async function load<T = unknown>(rel: string): Promise<Record<string, T> | null> {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    notices.push(`skipped ${rel} (not found)`);
    return null;
  }
  try {
    return (await import(pathToFileURL(abs).href)) as Record<string, T>;
  } catch (e) {
    problems.push(`${rel}: failed to import — ${(e as Error).message}`);
    return null;
  }
}

function isHex(s: unknown) {
  return typeof s === "string" && /^#[0-9a-fA-F]{6}$/.test(s);
}
function isValidTz(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
function isDate(s: unknown) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

// Rough bounding boxes to catch swapped/wrong coordinates.
const BOUNDS: Record<string, [number, number, number, number]> = {
  // [minLat, maxLat, minLon, maxLon]
  US: [17.5, 72, -180, -64],
  CA: [41, 84, -142, -52],
  MX: [14, 33, -118.5, -86],
  GB: [49, 61, -9, 2.5],
  FR: [41, 51.5, -5.5, 10],
  DE: [47, 55.5, 5.5, 15.5],
  ES: [27, 44, -19, 5],
  IT: [35.5, 47.5, 6, 19],
  JP: [24, 46, 122, 146],
  AU: [-44, -10, 112, 154],
};

async function main() {
  const airportsMod = await load("src/data/airports.ts");
  const airportsList = (airportsMod?.AIRPORTS ?? []) as any[];
  const iatas = new Set<string>();
  if (airportsMod) {
    if (!Array.isArray(airportsList) || airportsList.length < 100)
      problems.push(`airports: expected ≥100 airports, got ${airportsList.length}`);
    const metros = new Map<string, number>();
    for (const a of airportsList) {
      const id = `airport ${a?.iata}`;
      if (!/^[A-Z]{3}$/.test(a.iata ?? "")) problems.push(`${id}: bad IATA code`);
      if (iatas.has(a.iata)) problems.push(`${id}: duplicate IATA`);
      iatas.add(a.iata);
      if (a.icao && !/^[A-Z0-9]{4}$/.test(a.icao)) problems.push(`${id}: bad ICAO`);
      if (typeof a.name !== "string" || a.name.length < 4) problems.push(`${id}: missing name`);
      if (typeof a.city !== "string" || !a.city) problems.push(`${id}: missing city`);
      if (!/^[A-Z]{2}$/.test(a.countryCode ?? "")) problems.push(`${id}: bad countryCode`);
      if (typeof a.country !== "string" || !a.country) problems.push(`${id}: missing country`);
      if (a.countryCode === "US" && !/^[A-Z]{2}$/.test(a.state ?? ""))
        problems.push(`${id}: US airport needs 2-letter state`);
      if (typeof a.lat !== "number" || a.lat < -90 || a.lat > 90) problems.push(`${id}: bad lat`);
      if (typeof a.lon !== "number" || a.lon < -180 || a.lon > 180) problems.push(`${id}: bad lon`);
      const b = BOUNDS[a.countryCode];
      if (b && (a.lat < b[0] || a.lat > b[1] || a.lon < b[2] || a.lon > b[3]))
        problems.push(`${id}: coordinates (${a.lat}, ${a.lon}) outside ${a.countryCode} bounds`);
      if (typeof a.tz !== "string" || !isValidTz(a.tz)) problems.push(`${id}: invalid IANA tz "${a.tz}"`);
      if (![1, 2, 3, 4, 5].includes(a.size)) problems.push(`${id}: size must be 1–5`);
      if (a.metro) metros.set(a.metro, (metros.get(a.metro) ?? 0) + 1);
    }
    for (const [m, n] of metros) if (n < 2) problems.push(`airports: metro "${m}" used by only one airport`);
    for (const fn of ["getAirport", "searchAirports", "AIRPORT_BY_IATA"])
      if (!(fn in airportsMod)) problems.push(`airports: missing export ${fn}`);
  }

  const airlinesMod = await load("src/data/airlines.ts");
  const airlinesList = (airlinesMod?.AIRLINES ?? []) as any[];
  const airlineCodes = new Set<string>();
  if (airlinesMod) {
    if (!Array.isArray(airlinesList) || airlinesList.length < 35)
      problems.push(`airlines: expected ≥35 airlines, got ${airlinesList.length}`);
    const slugs = new Set<string>();
    for (const al of airlinesList) {
      const id = `airline ${al?.iata}`;
      if (!/^[A-Z0-9]{2}$/.test(al.iata ?? "")) problems.push(`${id}: bad IATA`);
      if (airlineCodes.has(al.iata)) problems.push(`${id}: duplicate IATA`);
      airlineCodes.add(al.iata);
      if (!/^[a-z0-9-]+$/.test(al.slug ?? "")) problems.push(`${id}: bad slug`);
      if (slugs.has(al.slug)) problems.push(`${id}: duplicate slug`);
      slugs.add(al.slug);
      if (!isHex(al.color)) problems.push(`${id}: color must be #rrggbb`);
      if (al.alliance && !["oneworld", "skyteam", "star"].includes(al.alliance))
        problems.push(`${id}: bad alliance`);
      if (!Array.isArray(al.hubs) || al.hubs.length === 0) problems.push(`${id}: needs hubs`);
      for (const h of al.hubs ?? [])
        if (iatas.size && !iatas.has(h)) problems.push(`${id}: hub ${h} not in airports dataset`);
      if (!/^[A-Z]{2}$/.test(al.countryCode ?? "")) problems.push(`${id}: bad countryCode`);
      if (!Array.isArray(al.fareBrands) || al.fareBrands.length < 2)
        problems.push(`${id}: needs ≥2 fareBrands`);
      for (const fb of al.fareBrands ?? []) {
        if (!["economy", "premium_economy", "business", "first"].includes(fb.cabin))
          problems.push(`${id}: fare "${fb.brand}" bad cabin`);
        if (typeof fb.priceMultiplier !== "number" || fb.priceMultiplier < 0.5 || fb.priceMultiplier > 12)
          problems.push(`${id}: fare "${fb.brand}" bad priceMultiplier`);
        if (!["free", "paid", "unavailable"].includes(fb.seatSelection))
          problems.push(`${id}: fare "${fb.brand}" bad seatSelection`);
      }
      const econ = (al.fareBrands ?? []).filter((f: any) => f.cabin === "economy");
      if (econ.length === 0) problems.push(`${id}: needs at least one economy fare brand`);
    }
    for (const fn of ["getAirline", "AIRLINE_BY_IATA", "getAirlineBySlug"])
      if (!(fn in airlinesMod)) problems.push(`airlines: missing export ${fn}`);
  }

  const destMod = await load("src/data/destinations.ts");
  const destinations = (destMod?.DESTINATIONS ?? []) as any[];
  const destSlugs = new Set<string>();
  if (destMod) {
    if (destinations.length < 36) problems.push(`destinations: expected ≥36, got ${destinations.length}`);
    for (const d of destinations) {
      const id = `destination ${d?.slug}`;
      if (!/^[a-z0-9-]+$/.test(d.slug ?? "")) problems.push(`${id}: bad slug`);
      if (destSlugs.has(d.slug)) problems.push(`${id}: duplicate slug`);
      destSlugs.add(d.slug);
      if (!Array.isArray(d.airports) || !d.airports.length) problems.push(`${id}: needs airports`);
      for (const a of d.airports ?? []) if (iatas.size && !iatas.has(a)) problems.push(`${id}: airport ${a} missing from dataset`);
      if (typeof d.tagline !== "string" || d.tagline.length > 70) problems.push(`${id}: tagline missing or >70 chars`);
      if (typeof d.summary !== "string" || d.summary.length < 120 || d.summary.length > 340)
        problems.push(`${id}: summary must be 120–340 chars`);
      if (!Array.isArray(d.overview) || d.overview.length < 3) problems.push(`${id}: overview needs ≥3 paragraphs`);
      if (!Array.isArray(d.gradient) || d.gradient.length !== 2 || !d.gradient.every(isHex))
        problems.push(`${id}: gradient must be two hex colours`);
      if (!Array.isArray(d.weather) || d.weather.length !== 4) problems.push(`${id}: weather needs exactly 4 seasons`);
      if (!Array.isArray(d.highlights) || d.highlights.length < 4) problems.push(`${id}: needs ≥4 highlights`);
      if (!Array.isArray(d.travelTips) || d.travelTips.length < 4) problems.push(`${id}: needs ≥4 travelTips`);
      if (!Array.isArray(d.faqs) || d.faqs.length < 3) problems.push(`${id}: needs ≥3 faqs`);
      if (!Array.isArray(d.typicalFares) || d.typicalFares.length < 3) problems.push(`${id}: needs ≥3 typicalFares`);
      for (const f of d.typicalFares ?? []) if (iatas.size && !iatas.has(f.origin)) problems.push(`${id}: typicalFares origin ${f.origin} missing`);
      for (const f of d.flightTimes ?? []) if (iatas.size && !iatas.has(f.origin)) problems.push(`${id}: flightTimes origin ${f.origin} missing`);
      if (!Array.isArray(d.keywords) || d.keywords.length < 3) problems.push(`${id}: needs ≥3 keywords`);
      if (d.countryCode === "US" && !d.state) problems.push(`${id}: US destination needs state`);
    }
    for (const fn of ["getDestination", "getDestinationByAirport"])
      if (!(fn in destMod)) problems.push(`destinations: missing export ${fn}`);
  }

  const routesMod = await load("src/data/routes.ts");
  const routes = (routesMod?.ROUTES ?? []) as any[];
  if (routesMod) {
    if (routes.length < 100) problems.push(`routes: expected ≥100, got ${routes.length}`);
    const seen = new Set<string>();
    for (const r of routes) {
      const key = `${r.origin}-${r.destination}`;
      if (seen.has(key)) problems.push(`routes: duplicate ${key}`);
      seen.add(key);
      if (r.origin === r.destination) problems.push(`routes: ${key} origin equals destination`);
      if (iatas.size && !iatas.has(r.origin)) problems.push(`routes: ${key} origin missing`);
      if (iatas.size && !iatas.has(r.destination)) problems.push(`routes: ${key} destination missing`);
      if (!["domestic", "international"].includes(r.category)) problems.push(`routes: ${key} bad category`);
    }
  }

  const faqMod = await load("src/data/faqs.ts");
  const groups = (faqMod?.FAQ_GROUPS ?? []) as any[];
  if (faqMod) {
    if (groups.length < 5) problems.push(`faqs: expected ≥5 groups, got ${groups.length}`);
    for (const g of groups) {
      if (!g.id || !g.title) problems.push(`faqs: group missing id/title`);
      if (!Array.isArray(g.items) || g.items.length < 4) problems.push(`faqs: group ${g.id} needs ≥4 items`);
      for (const it of g.items ?? [])
        if (!it.question?.endsWith("?") || (it.answer ?? "").length < 60)
          problems.push(`faqs: "${it.question}" needs a question mark and an answer ≥60 chars`);
    }
  }

  const artMod = await load("src/content/articles.ts");
  const articles = (artMod?.ARTICLES ?? []) as any[];
  if (artMod) {
    if (articles.length < 8) problems.push(`articles: expected ≥8, got ${articles.length}`);
    const slugs = new Set<string>();
    for (const a of articles) {
      const id = `article ${a?.slug}`;
      if (!/^[a-z0-9-]+$/.test(a.slug ?? "")) problems.push(`${id}: bad slug`);
      if (slugs.has(a.slug)) problems.push(`${id}: duplicate slug`);
      slugs.add(a.slug);
      if ((a.title ?? "").length > 70) problems.push(`${id}: title >70 chars`);
      if ((a.description ?? "").length < 80 || (a.description ?? "").length > 160)
        problems.push(`${id}: description must be 80–160 chars`);
      if (!isDate(a.publishedAt) || !isDate(a.updatedAt)) problems.push(`${id}: bad dates`);
      if (!Array.isArray(a.sections) || a.sections.length < 4) problems.push(`${id}: needs ≥4 sections`);
      const words = (a.sections ?? []).flatMap((s: any) => s.paragraphs ?? []).join(" ").split(/\s+/).length;
      if (words < 700) problems.push(`${id}: only ~${words} words; need ≥700`);
      if (!Array.isArray(a.gradient) || !a.gradient.every(isHex)) problems.push(`${id}: gradient must be hex pair`);
      for (const d of a.relatedDestinations ?? [])
        if (destSlugs.size && !destSlugs.has(d)) problems.push(`${id}: relatedDestinations "${d}" unknown`);
    }
  }

  for (const n of notices) console.log(`• ${n}`);
  if (problems.length) {
    console.error(`\n✗ ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`\n✓ datasets valid (${airportsList.length} airports, ${airlinesList.length} airlines, ${destinations.length} destinations, ${routes.length} routes, ${groups.length} FAQ groups, ${articles.length} articles)`);
}

main();
