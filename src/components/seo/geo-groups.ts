/**
 * Region / state groupings for the SEO index pages (/flights-to, /flights-from,
 * /airports, /airlines). Pure data helpers — safe in server and client code.
 */
import type { Airport } from "@/lib/flights/types";
import { REGION_LABELS, type Region } from "@/data/types";

export const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia", PR: "Puerto Rico", VI: "US Virgin Islands", GU: "Guam",
};

export function stateName(code: string | undefined): string {
  return (code && US_STATE_NAMES[code]) || code || "";
}

const STATE_REGION: Record<string, Region> = {
  CT: "us-northeast", ME: "us-northeast", MA: "us-northeast", NH: "us-northeast", RI: "us-northeast", VT: "us-northeast", NJ: "us-northeast", NY: "us-northeast", PA: "us-northeast", DE: "us-northeast", MD: "us-northeast", DC: "us-northeast",
  VA: "us-southeast", WV: "us-southeast", NC: "us-southeast", SC: "us-southeast", GA: "us-southeast", FL: "us-southeast", KY: "us-southeast", TN: "us-southeast", AL: "us-southeast", MS: "us-southeast", AR: "us-southeast", LA: "us-southeast",
  OH: "us-midwest", MI: "us-midwest", IN: "us-midwest", IL: "us-midwest", WI: "us-midwest", MN: "us-midwest", IA: "us-midwest", MO: "us-midwest", ND: "us-midwest", SD: "us-midwest", NE: "us-midwest", KS: "us-midwest",
  TX: "us-southwest", OK: "us-southwest", NM: "us-southwest", AZ: "us-southwest",
  CO: "us-west", WY: "us-west", MT: "us-west", ID: "us-west", UT: "us-west", NV: "us-west", CA: "us-west", OR: "us-west", WA: "us-west",
  HI: "us-hawaii-alaska", AK: "us-hawaii-alaska",
};

const COUNTRY_REGION: Record<string, Region> = {
  CA: "canada",
  MX: "mexico-caribbean", BS: "mexico-caribbean", JM: "mexico-caribbean", DO: "mexico-caribbean", AW: "mexico-caribbean", CW: "mexico-caribbean", SX: "mexico-caribbean", KY: "mexico-caribbean", TC: "mexico-caribbean", BB: "mexico-caribbean", TT: "mexico-caribbean", CU: "mexico-caribbean", BM: "mexico-caribbean", PR: "mexico-caribbean", VI: "mexico-caribbean",
  PA: "central-south-america", CR: "central-south-america", GT: "central-south-america", SV: "central-south-america", BZ: "central-south-america", HN: "central-south-america", CO: "central-south-america", PE: "central-south-america", EC: "central-south-america", BR: "central-south-america", CL: "central-south-america", AR: "central-south-america", UY: "central-south-america", VE: "central-south-america", BO: "central-south-america", PY: "central-south-america",
  GB: "europe", IE: "europe", FR: "europe", NL: "europe", BE: "europe", DE: "europe", CH: "europe", AT: "europe", ES: "europe", PT: "europe", IT: "europe", GR: "europe", TR: "europe", DK: "europe", SE: "europe", NO: "europe", FI: "europe", IS: "europe", CZ: "europe", PL: "europe", HU: "europe", HR: "europe",
  AE: "middle-east-africa", QA: "middle-east-africa", IL: "middle-east-africa", JO: "middle-east-africa", EG: "middle-east-africa", MA: "middle-east-africa", ZA: "middle-east-africa", KE: "middle-east-africa", ET: "middle-east-africa", NG: "middle-east-africa", GH: "middle-east-africa", SA: "middle-east-africa",
  JP: "asia", KR: "asia", CN: "asia", HK: "asia", TW: "asia", SG: "asia", TH: "asia", MY: "asia", PH: "asia", ID: "asia", IN: "asia", VN: "asia",
  AU: "oceania", NZ: "oceania", FJ: "oceania", PF: "oceania", GU: "oceania",
};

export function regionForCountry(countryCode: string): Region {
  return COUNTRY_REGION[countryCode] ?? "europe";
}

export function regionForAirport(a: Pick<Airport, "countryCode" | "state">): Region {
  if (a.countryCode === "US") return STATE_REGION[a.state ?? ""] ?? "us-west";
  return regionForCountry(a.countryCode);
}

/** Display order for region groups on index pages. */
export const REGION_ORDER: Region[] = [
  "us-northeast",
  "us-southeast",
  "us-midwest",
  "us-southwest",
  "us-west",
  "us-hawaii-alaska",
  "canada",
  "mexico-caribbean",
  "central-south-america",
  "europe",
  "middle-east-africa",
  "asia",
  "oceania",
];

export const US_REGIONS: Region[] = REGION_ORDER.filter((r) => r.startsWith("us-"));
export const INTERNATIONAL_REGIONS: Region[] = REGION_ORDER.filter((r) => !r.startsWith("us-"));

export function regionLabel(region: Region): string {
  return REGION_LABELS[region];
}

/** US states, territories included, for "domestic" grouping. */
const US_LIKE = new Set(["US", "PR", "VI", "GU", "AS", "MP"]);
export function isUSLike(a: Pick<Airport, "countryCode">): boolean {
  return US_LIKE.has(a.countryCode);
}

/** Group any list by a key, preserving first-seen order of keys. */
export function groupBy<T, K extends string>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const it of items) {
    const k = key(it);
    const list = m.get(k) ?? [];
    list.push(it);
    m.set(k, list);
  }
  return m;
}

export const SIZE_TIER_LABELS: Record<Airport["size"], string> = {
  5: "Major international hub",
  4: "Large hub",
  3: "Medium hub",
  2: "Small hub",
  1: "Regional airport",
};
