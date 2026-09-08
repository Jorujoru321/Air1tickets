/**
 * Airline dataset for Air1 Tickets.
 *
 * Fare families reflect each carrier's branded fares as marketed in 2026
 * (e.g. Southwest's Basic/Choice ladder introduced in 2025, Spirit's
 * Go/Go Savvy/Go Comfy/Go Big). Multipliers are relative to the cheapest fare
 * of the same cabin and only drive the mock inventory engine.
 */
import type { Airline, Alliance, CabinClass, FareBrandDef } from "@/lib/flights/types";

export interface AirlineProfile extends Airline {
  fareBrands: FareBrandDef[];
  description: string;
  founded?: number;
  headquarters?: string;
  loyaltyProgram?: string;
  /** Typical first-checked-bag fee in USD on domestic/short-haul routes (2026). */
  checkedBagFee: number;
}

type FB = Partial<FareBrandDef> & { brand: string; cabin: CabinClass; priceMultiplier: number };

function fb(def: FB): FareBrandDef {
  return {
    carryOnIncluded: true,
    checkedBagsIncluded: 0,
    refundable: false,
    changeable: true,
    changeFee: 0,
    seatSelection: "paid",
    ...def,
  };
}

/** Standard US legacy ladder: Basic → Main → Refundable + premium cabins. */
function legacyLadder(names: { basic: string; main: string; flex: string; premium?: string; business: string; first?: string }, bagFee: number, opts: { intlPremium?: boolean } = {}): FareBrandDef[] {
  const list: FareBrandDef[] = [
    fb({ brand: names.basic, cabin: "economy", priceMultiplier: 1, changeable: false, checkedBagFee: bagFee, seatSelection: "paid" }),
    fb({ brand: names.main, cabin: "economy", priceMultiplier: 1.24, checkedBagFee: bagFee, seatSelection: "free" }),
    fb({ brand: names.flex, cabin: "economy", priceMultiplier: 1.85, refundable: true, checkedBagFee: bagFee, seatSelection: "free" }),
  ];
  if (names.premium) list.push(fb({ brand: names.premium, cabin: "premium_economy", priceMultiplier: 1, checkedBagsIncluded: opts.intlPremium ? 2 : 1, seatSelection: "free" }));
  list.push(fb({ brand: names.business, cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, refundable: false, seatSelection: "free" }));
  list.push(fb({ brand: `${names.business} Flexible`, cabin: "business", priceMultiplier: 1.35, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }));
  if (names.first) list.push(fb({ brand: names.first, cabin: "first", priceMultiplier: 1, checkedBagsIncluded: 3, refundable: true, seatSelection: "free" }));
  return list;
}

/** International full-service ladder (Light / Standard / Flex + premium cabins). */
function intlLadder(names: { light?: string; standard?: string; flex?: string; premium?: string; business?: string; first?: string } = {}, bagFee = 75): FareBrandDef[] {
  const list: FareBrandDef[] = [
    fb({ brand: names.light ?? "Economy Light", cabin: "economy", priceMultiplier: 1, changeable: false, checkedBagFee: bagFee }),
    fb({ brand: names.standard ?? "Economy Standard", cabin: "economy", priceMultiplier: 1.18, checkedBagsIncluded: 1, changeFee: 150 }),
    fb({ brand: names.flex ?? "Economy Flex", cabin: "economy", priceMultiplier: 1.7, checkedBagsIncluded: 1, refundable: true, seatSelection: "free" }),
    fb({ brand: names.premium ?? "Premium Economy", cabin: "premium_economy", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free", changeFee: 150 }),
    fb({ brand: names.business ?? "Business", cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
    fb({ brand: `${names.business ?? "Business"} Flex`, cabin: "business", priceMultiplier: 1.3, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
  ];
  if (names.first) list.push(fb({ brand: names.first, cabin: "first", priceMultiplier: 1, checkedBagsIncluded: 3, refundable: true, seatSelection: "free" }));
  return list;
}

export const AIRLINES: AirlineProfile[] = [
  /* ───────────────────────────── United States ───────────────────────────── */
  {
    iata: "AA", icao: "AAL", name: "American Airlines", slug: "american-airlines", country: "United States", countryCode: "US", alliance: "oneworld",
    hubs: ["DFW", "CLT", "ORD", "MIA", "PHX", "PHL", "LAX", "DCA", "JFK"], color: "#0078d2", website: "https://www.aa.com",
    fleet: ["Boeing 737-800", "Boeing 737 MAX 8", "Airbus A321neo", "Airbus A321", "Boeing 787-9", "Boeing 777-300ER", "Embraer E175"],
    founded: 1926, headquarters: "Fort Worth, Texas", loyaltyProgram: "AAdvantage", checkedBagFee: 40,
    description: "American Airlines is the largest airline in the world by fleet size and passengers carried, with major hubs in Dallas/Fort Worth, Charlotte, Chicago, Miami, Phoenix and Philadelphia. It is a founding member of the oneworld alliance.",
    fareBrands: legacyLadder({ basic: "Basic Economy", main: "Main Cabin", flex: "Main Cabin Flexible", premium: "Premium Economy", business: "Flagship Business", first: "Flagship First" }, 40),
  },
  {
    iata: "DL", icao: "DAL", name: "Delta Air Lines", slug: "delta-air-lines", country: "United States", countryCode: "US", alliance: "skyteam",
    hubs: ["ATL", "MSP", "DTW", "SLC", "SEA", "LAX", "JFK", "BOS", "LGA"], color: "#e31837", website: "https://www.delta.com",
    fleet: ["Boeing 737-900ER", "Airbus A321neo", "Airbus A320", "Boeing 757-200", "Airbus A350-900", "Airbus A330-900neo", "Boeing 767-300ER", "Embraer E175"],
    founded: 1925, headquarters: "Atlanta, Georgia", loyaltyProgram: "SkyMiles", checkedBagFee: 35,
    description: "Delta Air Lines is one of the three US legacy carriers, headquartered in Atlanta with its largest hub at Hartsfield–Jackson. Delta is a founding member of SkyTeam and consistently ranks near the top of US airlines for on-time performance.",
    fareBrands: [
      fb({ brand: "Basic Economy", cabin: "economy", priceMultiplier: 1, changeable: false, checkedBagFee: 35, seatSelection: "paid" }),
      fb({ brand: "Main Cabin", cabin: "economy", priceMultiplier: 1.22, checkedBagFee: 35, seatSelection: "free" }),
      fb({ brand: "Comfort+", cabin: "economy", priceMultiplier: 1.48, checkedBagFee: 35, seatSelection: "free" }),
      fb({ brand: "Main Cabin Refundable", cabin: "economy", priceMultiplier: 1.9, refundable: true, checkedBagFee: 35, seatSelection: "free" }),
      fb({ brand: "Premium Select", cabin: "premium_economy", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
      fb({ brand: "Delta One", cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
      fb({ brand: "Delta One Refundable", cabin: "business", priceMultiplier: 1.35, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
      fb({ brand: "First Class", cabin: "first", priceMultiplier: 1, checkedBagsIncluded: 2, refundable: false, seatSelection: "free" }),
    ],
  },
  {
    iata: "UA", icao: "UAL", name: "United Airlines", slug: "united-airlines", country: "United States", countryCode: "US", alliance: "star",
    hubs: ["ORD", "DEN", "IAH", "EWR", "SFO", "IAD", "LAX"], color: "#002244", website: "https://www.united.com",
    fleet: ["Boeing 737 MAX 9", "Boeing 737-900", "Airbus A321neo", "Boeing 757-200", "Boeing 787-9", "Boeing 777-300ER", "Boeing 767-300ER", "Embraer E175"],
    founded: 1926, headquarters: "Chicago, Illinois", loyaltyProgram: "MileagePlus", checkedBagFee: 40,
    description: "United Airlines operates the most extensive international route network of any US carrier, with hubs in Chicago, Denver, Houston, Newark, San Francisco, Washington Dulles and Los Angeles. United is a founding member of Star Alliance.",
    fareBrands: legacyLadder({ basic: "Basic Economy", main: "Economy", flex: "Economy Refundable", premium: "Premium Plus", business: "Polaris Business", first: "United First" }, 40),
  },
  {
    iata: "WN", icao: "SWA", name: "Southwest Airlines", slug: "southwest-airlines", country: "United States", countryCode: "US", lowCost: true,
    hubs: ["DAL", "HOU", "MDW", "BWI", "DEN", "LAS", "PHX", "OAK", "MCO", "ATL", "BNA", "LAX", "SAN", "STL", "AUS"], color: "#304cb2", website: "https://www.southwest.com",
    fleet: ["Boeing 737-800", "Boeing 737 MAX 8", "Boeing 737-700"], cabins: ["economy"],
    founded: 1967, headquarters: "Dallas, Texas", loyaltyProgram: "Rapid Rewards", checkedBagFee: 35,
    description: "Southwest Airlines is the largest US low-fare carrier, flying an all-Boeing 737 fleet across the US, Mexico, Central America and the Caribbean. In 2025 Southwest replaced its Wanna Get Away fares with a Basic/Choice ladder, began charging for checked bags, and introduced assigned seating.",
    fareBrands: [
      fb({ brand: "Basic", cabin: "economy", priceMultiplier: 1, changeable: false, checkedBagFee: 35, seatSelection: "unavailable" }),
      fb({ brand: "Choice", cabin: "economy", priceMultiplier: 1.2, checkedBagFee: 35, seatSelection: "paid" }),
      fb({ brand: "Choice Preferred", cabin: "economy", priceMultiplier: 1.45, checkedBagsIncluded: 1, seatSelection: "free" }),
      fb({ brand: "Choice Extra", cabin: "economy", priceMultiplier: 1.95, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
    ],
  },
  {
    iata: "B6", icao: "JBU", name: "JetBlue", slug: "jetblue", country: "United States", countryCode: "US",
    hubs: ["JFK", "BOS", "FLL", "MCO", "LAX", "SJU"], color: "#003876", website: "https://www.jetblue.com",
    fleet: ["Airbus A320", "Airbus A321", "Airbus A321neo", "Airbus A220-300", "Embraer E190"], cabins: ["economy", "business"],
    founded: 1998, headquarters: "Long Island City, New York", loyaltyProgram: "TrueBlue", checkedBagFee: 40,
    description: "JetBlue is a New York–based carrier known for roomy economy seats, free seatback entertainment and Wi-Fi, and its Mint premium cabin on transcontinental and transatlantic routes. Focus cities include JFK, Boston, Fort Lauderdale and Orlando.",
    fareBrands: [
      fb({ brand: "Blue Basic", cabin: "economy", priceMultiplier: 1, changeable: false, checkedBagFee: 40, seatSelection: "paid" }),
      fb({ brand: "Blue", cabin: "economy", priceMultiplier: 1.2, checkedBagFee: 40, seatSelection: "free" }),
      fb({ brand: "Blue Plus", cabin: "economy", priceMultiplier: 1.42, checkedBagsIncluded: 1, seatSelection: "free" }),
      fb({ brand: "Blue Extra", cabin: "economy", priceMultiplier: 1.75, refundable: true, checkedBagFee: 40, seatSelection: "free" }),
      fb({ brand: "Mint", cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
      fb({ brand: "Mint Refundable", cabin: "business", priceMultiplier: 1.3, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
    ],
  },
  {
    iata: "AS", icao: "ASA", name: "Alaska Airlines", slug: "alaska-airlines", country: "United States", countryCode: "US", alliance: "oneworld",
    hubs: ["SEA", "PDX", "ANC", "SFO", "LAX", "SAN"], color: "#01426a", website: "https://www.alaskaair.com",
    fleet: ["Boeing 737-900ER", "Boeing 737 MAX 9", "Boeing 737-800", "Embraer E175"], cabins: ["economy", "first"],
    founded: 1932, headquarters: "Seattle, Washington", loyaltyProgram: "Mileage Plan", checkedBagFee: 35,
    description: "Alaska Airlines is the fifth-largest US airline, headquartered in Seattle with strong West Coast, Alaska and Hawaii networks. It joined oneworld in 2021 and completed its acquisition of Hawaiian Airlines in 2024.",
    fareBrands: [
      fb({ brand: "Saver", cabin: "economy", priceMultiplier: 1, changeable: false, checkedBagFee: 35, seatSelection: "paid" }),
      fb({ brand: "Main", cabin: "economy", priceMultiplier: 1.24, checkedBagFee: 35, seatSelection: "free" }),
      fb({ brand: "Main Refundable", cabin: "economy", priceMultiplier: 1.8, refundable: true, checkedBagFee: 35, seatSelection: "free" }),
      fb({ brand: "First Class", cabin: "first", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
    ],
  },
  {
    iata: "NK", icao: "NKS", name: "Spirit Airlines", slug: "spirit-airlines", country: "United States", countryCode: "US", lowCost: true,
    hubs: ["FLL", "LAS", "DTW", "MCO", "DFW", "ATL", "IAH"], color: "#ffec00", website: "https://www.spirit.com",
    fleet: ["Airbus A320neo", "Airbus A321neo", "Airbus A320", "Airbus A321"], cabins: ["economy"],
    founded: 1983, headquarters: "Dania Beach, Florida", loyaltyProgram: "Free Spirit", checkedBagFee: 55,
    description: "Spirit Airlines is an ultra-low-cost carrier that unbundles nearly everything: the base fare covers a seat and a personal item, with carry-ons, checked bags and seat assignments sold separately. Its Go/Go Savvy/Go Comfy/Go Big bundles were introduced in 2024.",
    fareBrands: [
      fb({ brand: "Go", cabin: "economy", priceMultiplier: 1, carryOnIncluded: false, changeable: false, checkedBagFee: 55, seatSelection: "paid" }),
      fb({ brand: "Go Savvy", cabin: "economy", priceMultiplier: 1.3, carryOnIncluded: true, checkedBagFee: 55, seatSelection: "paid" }),
      fb({ brand: "Go Comfy", cabin: "economy", priceMultiplier: 1.65, carryOnIncluded: true, checkedBagsIncluded: 1, seatSelection: "free" }),
      fb({ brand: "Go Big", cabin: "economy", priceMultiplier: 2.1, carryOnIncluded: true, checkedBagsIncluded: 1, refundable: true, seatSelection: "free" }),
    ],
  },
  {
    iata: "F9", icao: "FFT", name: "Frontier Airlines", slug: "frontier-airlines", country: "United States", countryCode: "US", lowCost: true,
    hubs: ["DEN", "LAS", "MCO", "PHL", "ATL", "PHX", "CLE"], color: "#248168", website: "https://www.flyfrontier.com",
    fleet: ["Airbus A320neo", "Airbus A321neo", "Airbus A320"], cabins: ["economy"],
    founded: 1994, headquarters: "Denver, Colorado", loyaltyProgram: "Frontier Miles", checkedBagFee: 55,
    description: "Frontier Airlines is a Denver-based ultra-low-cost carrier with an all-Airbus neo fleet, known for its animal tail art and unbundled fares. Its 2024 fare overhaul introduced Basic, Economy, Premium and Business bundles.",
    fareBrands: [
      fb({ brand: "Basic", cabin: "economy", priceMultiplier: 1, carryOnIncluded: false, changeable: false, checkedBagFee: 55, seatSelection: "paid" }),
      fb({ brand: "Economy", cabin: "economy", priceMultiplier: 1.32, carryOnIncluded: true, checkedBagFee: 55, seatSelection: "paid" }),
      fb({ brand: "Premium", cabin: "economy", priceMultiplier: 1.7, carryOnIncluded: true, checkedBagsIncluded: 1, seatSelection: "free" }),
      fb({ brand: "Business", cabin: "economy", priceMultiplier: 2.2, carryOnIncluded: true, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
    ],
  },
  {
    iata: "HA", icao: "HAL", name: "Hawaiian Airlines", slug: "hawaiian-airlines", country: "United States", countryCode: "US", alliance: "oneworld",
    hubs: ["HNL", "OGG"], color: "#5b2a86", website: "https://www.hawaiianairlines.com",
    fleet: ["Airbus A330-200", "Airbus A321neo", "Boeing 787-9", "Boeing 717"], cabins: ["economy", "premium_economy", "first"],
    founded: 1929, headquarters: "Honolulu, Hawaii", loyaltyProgram: "HawaiianMiles", checkedBagFee: 35,
    description: "Hawaiian Airlines is Hawaii's hometown carrier, connecting Honolulu and Maui with the US mainland, Japan, Korea, Australia and New Zealand, plus frequent inter-island flights. It has operated under Alaska Air Group since 2024.",
    fareBrands: [
      fb({ brand: "Main Cabin Basic", cabin: "economy", priceMultiplier: 1, changeable: false, checkedBagFee: 35, seatSelection: "paid" }),
      fb({ brand: "Main Cabin", cabin: "economy", priceMultiplier: 1.22, checkedBagFee: 35, seatSelection: "free" }),
      fb({ brand: "Main Cabin Flexible", cabin: "economy", priceMultiplier: 1.8, refundable: true, checkedBagFee: 35, seatSelection: "free" }),
      fb({ brand: "Extra Comfort", cabin: "premium_economy", priceMultiplier: 1, checkedBagsIncluded: 1, seatSelection: "free" }),
      fb({ brand: "First Class", cabin: "first", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
    ],
  },
  {
    iata: "G4", icao: "AAY", name: "Allegiant Air", slug: "allegiant-air", country: "United States", countryCode: "US", lowCost: true,
    hubs: ["LAS", "SFB", "PIE"], color: "#f37021", website: "https://www.allegiantair.com",
    fleet: ["Airbus A320", "Airbus A319", "Boeing 737 MAX 8"], cabins: ["economy"],
    founded: 1997, headquarters: "Las Vegas, Nevada", loyaltyProgram: "Allways Rewards", checkedBagFee: 50,
    description: "Allegiant Air links small and mid-size US cities with leisure destinations in Florida, Arizona, Nevada and California, typically flying a route only a few days a week. Fares are unbundled and sold mainly through its own website.",
    fareBrands: [
      fb({ brand: "Standard", cabin: "economy", priceMultiplier: 1, carryOnIncluded: false, changeable: false, checkedBagFee: 50, seatSelection: "paid" }),
      fb({ brand: "Allegiant Extra", cabin: "economy", priceMultiplier: 1.55, carryOnIncluded: true, checkedBagFee: 50, seatSelection: "free" }),
    ],
  },
  {
    iata: "SY", icao: "SCX", name: "Sun Country Airlines", slug: "sun-country-airlines", country: "United States", countryCode: "US", lowCost: true,
    hubs: ["MSP"], color: "#f7941d", website: "https://www.suncountry.com",
    fleet: ["Boeing 737-800", "Boeing 737-900ER"], cabins: ["economy"],
    founded: 1982, headquarters: "Minneapolis, Minnesota", loyaltyProgram: "Sun Country Rewards", checkedBagFee: 45,
    description: "Sun Country Airlines is a Minneapolis–based low-cost carrier serving warm-weather leisure destinations across the US, Mexico, Central America and the Caribbean, with seasonal schedules built around Upper Midwest travel patterns.",
    fareBrands: [
      fb({ brand: "Standard", cabin: "economy", priceMultiplier: 1, carryOnIncluded: false, changeable: false, checkedBagFee: 45, seatSelection: "paid" }),
      fb({ brand: "Best", cabin: "economy", priceMultiplier: 1.45, carryOnIncluded: true, checkedBagsIncluded: 1, seatSelection: "free" }),
    ],
  },
  {
    iata: "MX", icao: "MXY", name: "Breeze Airways", slug: "breeze-airways", country: "United States", countryCode: "US", lowCost: true,
    hubs: ["PVD", "CHS", "TPA", "RDU", "BDL", "ORF"], color: "#0092d1", website: "https://www.flybreeze.com",
    fleet: ["Airbus A220-300", "Embraer E195"], cabins: ["economy"],
    founded: 2021, headquarters: "Cottonwood Heights, Utah", loyaltyProgram: "BreezePoints", checkedBagFee: 45,
    description: "Breeze Airways is a newer US carrier founded by JetBlue's David Neeleman, flying Airbus A220s on nonstop routes between underserved mid-size cities and leisure destinations. Fares come in Nice, Nicer and Nicest bundles.",
    fareBrands: [
      fb({ brand: "Nice", cabin: "economy", priceMultiplier: 1, carryOnIncluded: false, changeable: true, checkedBagFee: 45, seatSelection: "paid" }),
      fb({ brand: "Nicer", cabin: "economy", priceMultiplier: 1.4, carryOnIncluded: true, checkedBagsIncluded: 1, seatSelection: "free" }),
      fb({ brand: "Nicest", cabin: "economy", priceMultiplier: 1.95, carryOnIncluded: true, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
    ],
  },

  /* ─────────────────────── Canada · Mexico · Latin America ─────────────────────── */
  {
    iata: "AC", icao: "ACA", name: "Air Canada", slug: "air-canada", country: "Canada", countryCode: "CA", alliance: "star",
    hubs: ["YYZ", "YVR", "YUL", "YYC"], color: "#f01428", website: "https://www.aircanada.com",
    fleet: ["Boeing 787-9", "Airbus A220-300", "Boeing 737 MAX 8", "Airbus A321", "Boeing 777-300ER", "Airbus A330-300"],
    founded: 1937, headquarters: "Montreal, Quebec", loyaltyProgram: "Aeroplan", checkedBagFee: 35,
    description: "Air Canada is Canada's flag carrier and largest airline, with hubs in Toronto, Vancouver, Montreal and Calgary and extensive transborder service to the United States. It is a founding member of Star Alliance.",
    fareBrands: [
      fb({ brand: "Basic", cabin: "economy", priceMultiplier: 1, changeable: false, checkedBagFee: 35, seatSelection: "paid" }),
      fb({ brand: "Standard", cabin: "economy", priceMultiplier: 1.2, checkedBagFee: 35, changeFee: 75, seatSelection: "paid" }),
      fb({ brand: "Flex", cabin: "economy", priceMultiplier: 1.45, checkedBagFee: 35, seatSelection: "free" }),
      fb({ brand: "Comfort", cabin: "economy", priceMultiplier: 1.7, checkedBagsIncluded: 1, seatSelection: "free" }),
      fb({ brand: "Latitude", cabin: "economy", priceMultiplier: 2.1, checkedBagsIncluded: 1, refundable: true, seatSelection: "free" }),
      fb({ brand: "Premium Economy", cabin: "premium_economy", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
      fb({ brand: "Business Class", cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
      fb({ brand: "Business Flexible", cabin: "business", priceMultiplier: 1.3, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
    ],
  },
  {
    iata: "WS", icao: "WJA", name: "WestJet", slug: "westjet", country: "Canada", countryCode: "CA",
    hubs: ["YYC", "YVR", "YYZ"], color: "#00a8e1", website: "https://www.westjet.com",
    fleet: ["Boeing 737-800", "Boeing 737 MAX 8", "Boeing 787-9"], cabins: ["economy", "premium_economy", "business"],
    founded: 1996, headquarters: "Calgary, Alberta", loyaltyProgram: "WestJet Rewards", checkedBagFee: 35,
    description: "WestJet is Canada's second-largest airline, headquartered in Calgary, serving Canada, the US, Mexico, the Caribbean and Europe with a mostly Boeing 737 fleet plus 787 Dreamliners on long-haul routes.",
    fareBrands: [
      fb({ brand: "UltraBasic", cabin: "economy", priceMultiplier: 1, carryOnIncluded: false, changeable: false, checkedBagFee: 35, seatSelection: "paid" }),
      fb({ brand: "Basic", cabin: "economy", priceMultiplier: 1.15, changeable: false, checkedBagFee: 35, seatSelection: "paid" }),
      fb({ brand: "Econo", cabin: "economy", priceMultiplier: 1.35, checkedBagFee: 35, changeFee: 50, seatSelection: "paid" }),
      fb({ brand: "EconoFlex", cabin: "economy", priceMultiplier: 1.7, checkedBagsIncluded: 1, refundable: true, seatSelection: "free" }),
      fb({ brand: "Premium", cabin: "premium_economy", priceMultiplier: 1, checkedBagsIncluded: 1, seatSelection: "free" }),
      fb({ brand: "Business", cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
    ],
  },
  {
    iata: "AM", icao: "AMX", name: "Aeroméxico", slug: "aeromexico", country: "Mexico", countryCode: "MX", alliance: "skyteam",
    hubs: ["MEX", "MTY", "GDL"], color: "#0b2343", website: "https://aeromexico.com",
    fleet: ["Boeing 737-800", "Boeing 737 MAX 8", "Boeing 787-8", "Boeing 787-9", "Embraer E190"],
    founded: 1934, headquarters: "Mexico City", loyaltyProgram: "Aeroméxico Rewards", checkedBagFee: 40,
    description: "Aeroméxico is Mexico's flag carrier and a SkyTeam member, operating from Mexico City to more than 20 US cities as well as Europe, Asia and South America, often in partnership with Delta.",
    fareBrands: [
      fb({ brand: "Basic", cabin: "economy", priceMultiplier: 1, changeable: false, checkedBagFee: 40, seatSelection: "paid" }),
      fb({ brand: "Classic", cabin: "economy", priceMultiplier: 1.22, checkedBagsIncluded: 1, changeFee: 100, seatSelection: "paid" }),
      fb({ brand: "Flexible", cabin: "economy", priceMultiplier: 1.7, checkedBagsIncluded: 1, refundable: true, seatSelection: "free" }),
      fb({ brand: "AM Plus", cabin: "premium_economy", priceMultiplier: 1, checkedBagsIncluded: 1, seatSelection: "free" }),
      fb({ brand: "Clase Premier", cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
    ],
  },
  {
    iata: "VB", icao: "VIV", name: "Viva", slug: "viva-aerobus", country: "Mexico", countryCode: "MX", lowCost: true,
    hubs: ["MTY", "MEX", "GDL", "CUN"], color: "#00a651", website: "https://www.vivaaerobus.com",
    fleet: ["Airbus A320neo", "Airbus A321neo", "Airbus A320"], cabins: ["economy"],
    founded: 2006, headquarters: "Monterrey, Nuevo León", loyaltyProgram: "Doters", checkedBagFee: 45,
    description: "Viva (formerly Viva Aerobus) is a Mexican ultra-low-cost carrier based in Monterrey, flying a young Airbus A320-family fleet across Mexico and to a growing list of US cities.",
    fareBrands: [
      fb({ brand: "Zero", cabin: "economy", priceMultiplier: 1, carryOnIncluded: false, changeable: false, checkedBagFee: 45, seatSelection: "paid" }),
      fb({ brand: "Light", cabin: "economy", priceMultiplier: 1.3, carryOnIncluded: true, checkedBagFee: 45, seatSelection: "paid" }),
      fb({ brand: "Extra", cabin: "economy", priceMultiplier: 1.7, carryOnIncluded: true, checkedBagsIncluded: 1, seatSelection: "free" }),
      fb({ brand: "Smart", cabin: "economy", priceMultiplier: 2.1, carryOnIncluded: true, checkedBagsIncluded: 1, refundable: true, seatSelection: "free" }),
    ],
  },
  {
    iata: "Y4", icao: "VOI", name: "Volaris", slug: "volaris", country: "Mexico", countryCode: "MX", lowCost: true,
    hubs: ["GDL", "MEX", "TIJ", "CUN"], color: "#a6218e", website: "https://www.volaris.com",
    fleet: ["Airbus A320neo", "Airbus A321neo", "Airbus A320"], cabins: ["economy"],
    founded: 2005, headquarters: "Mexico City", loyaltyProgram: "v.club", checkedBagFee: 45,
    description: "Volaris is Mexico's largest airline by passengers, an ultra-low-cost carrier connecting Mexican cities with the US and Central America, with a strong presence at Guadalajara, Mexico City and Tijuana.",
    fareBrands: [
      fb({ brand: "Basic", cabin: "economy", priceMultiplier: 1, carryOnIncluded: false, changeable: false, checkedBagFee: 45, seatSelection: "paid" }),
      fb({ brand: "Classic", cabin: "economy", priceMultiplier: 1.3, carryOnIncluded: true, checkedBagFee: 45, seatSelection: "paid" }),
      fb({ brand: "Plus", cabin: "economy", priceMultiplier: 1.75, carryOnIncluded: true, checkedBagsIncluded: 1, seatSelection: "free" }),
    ],
  },
  {
    iata: "CM", icao: "CMP", name: "Copa Airlines", slug: "copa-airlines", country: "Panama", countryCode: "PA", alliance: "star",
    hubs: ["PTY"], color: "#0033a0", website: "https://www.copaair.com",
    fleet: ["Boeing 737-800", "Boeing 737 MAX 9", "Boeing 737 MAX 8"], cabins: ["economy", "business"],
    founded: 1947, headquarters: "Panama City", loyaltyProgram: "ConnectMiles", checkedBagFee: 40,
    description: "Copa Airlines runs the \"Hub of the Americas\" at Panama City's Tocumen airport, connecting North America with Central and South America and the Caribbean through a single, efficient Boeing 737 hub. Copa is a Star Alliance member.",
    fareBrands: [
      fb({ brand: "Basic", cabin: "economy", priceMultiplier: 1, changeable: false, checkedBagFee: 40, seatSelection: "paid" }),
      fb({ brand: "Classic", cabin: "economy", priceMultiplier: 1.2, checkedBagsIncluded: 1, changeFee: 100, seatSelection: "paid" }),
      fb({ brand: "Full", cabin: "economy", priceMultiplier: 1.6, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
      fb({ brand: "Business", cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
    ],
  },
  {
    iata: "AV", icao: "AVA", name: "Avianca", slug: "avianca", country: "Colombia", countryCode: "CO", alliance: "star",
    hubs: ["BOG", "MDE", "SAL"], color: "#d71920", website: "https://www.avianca.com",
    fleet: ["Airbus A320", "Airbus A320neo", "Boeing 787-8", "Airbus A321"], cabins: ["economy", "business"],
    founded: 1919, headquarters: "Bogotá", loyaltyProgram: "LifeMiles", checkedBagFee: 45,
    description: "Avianca is Colombia's flag carrier and the second-oldest airline in the world still operating. From Bogotá, Medellín and San Salvador it serves the US, Latin America and Europe as a Star Alliance member.",
    fareBrands: [
      fb({ brand: "Basic", cabin: "economy", priceMultiplier: 1, carryOnIncluded: false, changeable: false, checkedBagFee: 45, seatSelection: "paid" }),
      fb({ brand: "Classic", cabin: "economy", priceMultiplier: 1.28, carryOnIncluded: true, checkedBagsIncluded: 1, changeFee: 100, seatSelection: "paid" }),
      fb({ brand: "Flex", cabin: "economy", priceMultiplier: 1.7, carryOnIncluded: true, checkedBagsIncluded: 1, refundable: true, seatSelection: "free" }),
      fb({ brand: "Business Class", cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
    ],
  },
  {
    iata: "LA", icao: "LAN", name: "LATAM Airlines", slug: "latam-airlines", country: "Chile", countryCode: "CL",
    hubs: ["SCL", "GRU", "LIM", "BOG"], color: "#1b0088", website: "https://www.latamairlines.com",
    fleet: ["Airbus A320", "Airbus A321", "Boeing 787-9", "Boeing 777-300ER", "Airbus A350-900"], cabins: ["economy", "premium_economy", "business"],
    founded: 1929, headquarters: "Santiago, Chile", loyaltyProgram: "LATAM Pass", checkedBagFee: 45,
    description: "LATAM Airlines Group is South America's largest airline, formed from LAN and TAM, with hubs in Santiago, São Paulo, Lima and Bogotá. It left oneworld in 2020 and partners closely with Delta on US routes.",
    fareBrands: [
      fb({ brand: "Basic", cabin: "economy", priceMultiplier: 1, changeable: false, checkedBagFee: 45, seatSelection: "paid" }),
      fb({ brand: "Standard", cabin: "economy", priceMultiplier: 1.2, checkedBagsIncluded: 1, changeFee: 100, seatSelection: "paid" }),
      fb({ brand: "Plus", cabin: "economy", priceMultiplier: 1.5, checkedBagsIncluded: 2, seatSelection: "free" }),
      fb({ brand: "Top", cabin: "economy", priceMultiplier: 1.9, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
      fb({ brand: "Premium Economy", cabin: "premium_economy", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
      fb({ brand: "Premium Business", cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
    ],
  },

  /* ─────────────────────────────── Europe ─────────────────────────────── */
  {
    iata: "BA", icao: "BAW", name: "British Airways", slug: "british-airways", country: "United Kingdom", countryCode: "GB", alliance: "oneworld",
    hubs: ["LHR", "LGW"], color: "#075aaa", website: "https://www.britishairways.com",
    fleet: ["Airbus A320neo", "Airbus A350-1000", "Boeing 787-9", "Boeing 777-300ER", "Airbus A380"],
    founded: 1974, headquarters: "London", loyaltyProgram: "The British Airways Club", checkedBagFee: 75,
    description: "British Airways is the UK's flag carrier, based at London Heathrow with a second base at Gatwick. It flies to more US cities than any other European airline and is a founding member of oneworld; its loyalty scheme was renamed The British Airways Club in 2025.",
    fareBrands: intlLadder({ light: "Economy Basic", standard: "Economy Standard", flex: "Economy Plus", premium: "World Traveller Plus", business: "Club World", first: "First" }, 75),
  },
  {
    iata: "VS", icao: "VIR", name: "Virgin Atlantic", slug: "virgin-atlantic", country: "United Kingdom", countryCode: "GB", alliance: "skyteam",
    hubs: ["LHR", "MAN"], color: "#e10a0a", website: "https://www.virginatlantic.com",
    fleet: ["Airbus A350-1000", "Boeing 787-9", "Airbus A330-900neo"],
    founded: 1984, headquarters: "Crawley, England", loyaltyProgram: "Flying Club", checkedBagFee: 75,
    description: "Virgin Atlantic flies long-haul from London Heathrow and Manchester to the US, Caribbean, India and beyond, with a reputation for cabin design and service. Delta owns 49% and the two coordinate transatlantic schedules within SkyTeam.",
    fareBrands: intlLadder({ light: "Economy Light", standard: "Economy Classic", flex: "Economy Delight", premium: "Premium", business: "Upper Class" }, 75),
  },
  {
    iata: "EI", icao: "EIN", name: "Aer Lingus", slug: "aer-lingus", country: "Ireland", countryCode: "IE",
    hubs: ["DUB", "SNN"], color: "#00a65a", website: "https://www.aerlingus.com",
    fleet: ["Airbus A330-300", "Airbus A321neo XLR", "Airbus A320"], cabins: ["economy", "business"],
    founded: 1936, headquarters: "Dublin", loyaltyProgram: "AerClub", checkedBagFee: 70,
    description: "Aer Lingus is Ireland's flag carrier, flying from Dublin and Shannon to more than a dozen US cities. Passengers clear US immigration and customs before departure at Dublin and Shannon under US Preclearance.",
    fareBrands: [
      fb({ brand: "Saver", cabin: "economy", priceMultiplier: 1, changeable: false, checkedBagFee: 70, seatSelection: "paid" }),
      fb({ brand: "Smart", cabin: "economy", priceMultiplier: 1.2, checkedBagsIncluded: 1, changeFee: 150, seatSelection: "paid" }),
      fb({ brand: "Flex", cabin: "economy", priceMultiplier: 1.65, checkedBagsIncluded: 1, refundable: true, seatSelection: "free" }),
      fb({ brand: "Business Class", cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
    ],
  },
  {
    iata: "AF", icao: "AFR", name: "Air France", slug: "air-france", country: "France", countryCode: "FR", alliance: "skyteam",
    hubs: ["CDG", "ORY"], color: "#002157", website: "https://www.airfrance.us",
    fleet: ["Airbus A350-900", "Boeing 777-300ER", "Boeing 787-9", "Airbus A220-300", "Airbus A320"],
    founded: 1933, headquarters: "Paris", loyaltyProgram: "Flying Blue", checkedBagFee: 75,
    description: "Air France is France's flag carrier and part of the Air France–KLM group, flying from Paris Charles de Gaulle to many US gateways. It is a founding member of SkyTeam and offers La Première first class on select routes.",
    fareBrands: intlLadder({ light: "Light", standard: "Standard", flex: "Flex", premium: "Premium", business: "Business", first: "La Première" }, 75),
  },
  {
    iata: "KL", icao: "KLM", name: "KLM Royal Dutch Airlines", slug: "klm", country: "Netherlands", countryCode: "NL", alliance: "skyteam",
    hubs: ["AMS"], color: "#00a1de", website: "https://www.klm.us",
    fleet: ["Boeing 787-10", "Boeing 777-300ER", "Airbus A330-300", "Boeing 737-800", "Embraer E195-E2"], cabins: ["economy", "premium_economy", "business"],
    founded: 1919, headquarters: "Amstelveen, Netherlands", loyaltyProgram: "Flying Blue", checkedBagFee: 75,
    description: "KLM is the world's oldest airline still operating under its original name, flying from its single hub at Amsterdam Schiphol to North America, Asia and Africa. It is part of Air France–KLM and SkyTeam.",
    fareBrands: intlLadder({ light: "Light", standard: "Standard", flex: "Flex", premium: "Premium Comfort", business: "Business" }, 75),
  },
  {
    iata: "LH", icao: "DLH", name: "Lufthansa", slug: "lufthansa", country: "Germany", countryCode: "DE", alliance: "star",
    hubs: ["FRA", "MUC"], color: "#05164d", website: "https://www.lufthansa.com",
    fleet: ["Airbus A350-900", "Boeing 747-8", "Airbus A380", "Boeing 787-9", "Airbus A320neo"],
    founded: 1953, headquarters: "Cologne, Germany", loyaltyProgram: "Miles & More", checkedBagFee: 75,
    description: "Lufthansa is Germany's flag carrier and Europe's largest airline group by revenue, with hubs in Frankfurt and Munich. A founding member of Star Alliance, it partners with United and Air Canada across the Atlantic.",
    fareBrands: intlLadder({ light: "Economy Light", standard: "Economy Classic", flex: "Economy Flex", premium: "Premium Economy", business: "Business", first: "First" }, 75),
  },
  {
    iata: "LX", icao: "SWR", name: "SWISS", slug: "swiss", country: "Switzerland", countryCode: "CH", alliance: "star",
    hubs: ["ZRH", "GVA"], color: "#e30613", website: "https://www.swiss.com",
    fleet: ["Airbus A330-300", "Boeing 777-300ER", "Airbus A340-300", "Airbus A220-300", "Airbus A320neo"],
    founded: 2002, headquarters: "Basel, Switzerland", loyaltyProgram: "Miles & More", checkedBagFee: 75,
    description: "SWISS is Switzerland's national airline and a Lufthansa Group member, flying from Zurich and Geneva to the US East and West Coasts with a strong reputation for punctuality and service.",
    fareBrands: intlLadder({ light: "Economy Light", standard: "Economy Classic", flex: "Economy Flex", premium: "Premium Economy", business: "Business", first: "First" }, 75),
  },
  {
    iata: "OS", icao: "AUA", name: "Austrian Airlines", slug: "austrian-airlines", country: "Austria", countryCode: "AT", alliance: "star",
    hubs: ["VIE"], color: "#c8102e", website: "https://www.austrian.com",
    fleet: ["Boeing 787-9", "Boeing 777-200ER", "Airbus A320", "Embraer E195"], cabins: ["economy", "premium_economy", "business"],
    founded: 1957, headquarters: "Vienna", loyaltyProgram: "Miles & More", checkedBagFee: 75,
    description: "Austrian Airlines is Austria's flag carrier and a Lufthansa Group member, connecting Vienna with New York, Chicago, Washington and other US cities as well as an extensive Central and Eastern Europe network.",
    fareBrands: intlLadder({ light: "Economy Light", standard: "Economy Classic", flex: "Economy Flex", premium: "Premium Economy", business: "Business" }, 75),
  },
  {
    iata: "IB", icao: "IBE", name: "Iberia", slug: "iberia", country: "Spain", countryCode: "ES", alliance: "oneworld",
    hubs: ["MAD"], color: "#d7192d", website: "https://www.iberia.com",
    fleet: ["Airbus A350-900", "Airbus A330-300", "Airbus A321neo XLR", "Airbus A320neo"],
    founded: 1927, headquarters: "Madrid", loyaltyProgram: "Iberia Plus", checkedBagFee: 70,
    description: "Iberia is Spain's flag carrier and a oneworld member, using its Madrid hub to connect the US with Spain and onward to Latin America, where it has one of the largest networks of any European airline.",
    fareBrands: intlLadder({ light: "Basic", standard: "Optimal", flex: "Flexible", premium: "Premium Economy", business: "Business" }, 70),
  },
  {
    iata: "TP", icao: "TAP", name: "TAP Air Portugal", slug: "tap-air-portugal", country: "Portugal", countryCode: "PT", alliance: "star",
    hubs: ["LIS", "OPO"], color: "#00aa4f", website: "https://www.flytap.com",
    fleet: ["Airbus A330-900neo", "Airbus A321neo LR", "Airbus A320neo"], cabins: ["economy", "premium_economy", "business"],
    founded: 1945, headquarters: "Lisbon", loyaltyProgram: "TAP Miles&Go", checkedBagFee: 70,
    description: "TAP Air Portugal is Portugal's flag carrier, known for competitive transatlantic fares from Lisbon and Porto to the US East Coast and a free stopover program in Portugal. It is a Star Alliance member.",
    fareBrands: intlLadder({ light: "Discount", standard: "Basic", flex: "Classic", premium: "Economy Xtra", business: "Executive" }, 70),
  },
  {
    iata: "AZ", icao: "ITY", name: "ITA Airways", slug: "ita-airways", country: "Italy", countryCode: "IT",
    hubs: ["FCO", "MXP"], color: "#0a2d5c", website: "https://www.ita-airways.com",
    fleet: ["Airbus A350-900", "Airbus A330-900neo", "Airbus A321neo", "Airbus A320neo"], cabins: ["economy", "premium_economy", "business"],
    founded: 2021, headquarters: "Rome", loyaltyProgram: "Volare", checkedBagFee: 70,
    description: "ITA Airways is Italy's flag carrier, launched in 2021 as the successor to Alitalia. Lufthansa acquired a stake in 2025, and the airline left SkyTeam as it moves into the Lufthansa Group orbit. It flies from Rome and Milan to major US cities.",
    fareBrands: intlLadder({ light: "Economy Light", standard: "Economy Classic", flex: "Economy Flex", premium: "Premium Economy", business: "Business" }, 70),
  },
  {
    iata: "SK", icao: "SAS", name: "SAS Scandinavian Airlines", slug: "sas", country: "Sweden", countryCode: "SE", alliance: "skyteam",
    hubs: ["CPH", "ARN", "OSL"], color: "#000f6e", website: "https://www.flysas.com",
    fleet: ["Airbus A350-900", "Airbus A330-300", "Airbus A320neo", "Embraer E195"], cabins: ["economy", "premium_economy", "business"],
    founded: 1946, headquarters: "Stockholm", loyaltyProgram: "EuroBonus", checkedBagFee: 70,
    description: "SAS is the flag carrier of Denmark, Norway and Sweden, with its main hub in Copenhagen. After restructuring, SAS joined SkyTeam in 2024 and now partners with Air France–KLM and Delta on transatlantic routes.",
    fareBrands: intlLadder({ light: "SAS Go Light", standard: "SAS Go Smart", flex: "SAS Go Pro", premium: "SAS Plus", business: "SAS Business" }, 70),
  },
  {
    iata: "AY", icao: "FIN", name: "Finnair", slug: "finnair", country: "Finland", countryCode: "FI", alliance: "oneworld",
    hubs: ["HEL"], color: "#0b1560", website: "https://www.finnair.com",
    fleet: ["Airbus A350-900", "Airbus A330-300", "Airbus A321", "Embraer E190"], cabins: ["economy", "premium_economy", "business"],
    founded: 1923, headquarters: "Helsinki", loyaltyProgram: "Finnair Plus", checkedBagFee: 70,
    description: "Finnair is Finland's flag carrier and a oneworld member, flying from Helsinki to New York, Chicago, Dallas/Fort Worth, Los Angeles and Seattle, with a modern Airbus A350 long-haul fleet.",
    fareBrands: intlLadder({ light: "Economy Light", standard: "Economy Classic", flex: "Economy Flex", premium: "Premium Economy", business: "Business" }, 70),
  },
  {
    iata: "FI", icao: "ICE", name: "Icelandair", slug: "icelandair", country: "Iceland", countryCode: "IS",
    hubs: ["KEF"], color: "#004b8d", website: "https://www.icelandair.com",
    fleet: ["Boeing 737 MAX 8", "Boeing 757-200", "Boeing 767-300ER", "Airbus A321LR"], cabins: ["economy", "premium_economy", "business"],
    founded: 1937, headquarters: "Reykjavík", loyaltyProgram: "Saga Club", checkedBagFee: 70,
    description: "Icelandair connects North America and Europe through its Keflavík hub outside Reykjavík, with a popular free stopover program that lets travelers spend up to seven days in Iceland at no extra airfare.",
    fareBrands: intlLadder({ light: "Economy Light", standard: "Economy Standard", flex: "Economy Flex", premium: "Saga Premium", business: "Saga Premium Flex" }, 70),
  },
  {
    iata: "TK", icao: "THY", name: "Turkish Airlines", slug: "turkish-airlines", country: "Turkey", countryCode: "TR", alliance: "star",
    hubs: ["IST"], color: "#c70a0c", website: "https://www.turkishairlines.com",
    fleet: ["Boeing 787-9", "Airbus A350-900", "Boeing 777-300ER", "Airbus A330-300", "Airbus A321neo"], cabins: ["economy", "business"],
    founded: 1933, headquarters: "Istanbul", loyaltyProgram: "Miles&Smiles", checkedBagFee: 70,
    description: "Turkish Airlines flies to more countries than any other airline, using its Istanbul mega-hub to connect a dozen US cities with Europe, the Middle East, Africa and Asia. It is a Star Alliance member.",
    fareBrands: intlLadder({ light: "EcoFly", standard: "ExtraFly", flex: "PrimeFly", premium: "Comfort Class", business: "Business" }, 70),
  },
  {
    iata: "NO", icao: "NBT", name: "Norse Atlantic Airways", slug: "norse-atlantic-airways", country: "Norway", countryCode: "NO", lowCost: true,
    hubs: ["LGW", "OSL"], color: "#0d2c54", website: "https://flynorse.com",
    fleet: ["Boeing 787-9"], cabins: ["economy", "premium_economy"],
    founded: 2021, headquarters: "Arendal, Norway", loyaltyProgram: "Norse Rewards", checkedBagFee: 80,
    description: "Norse Atlantic Airways is a low-cost long-haul airline flying Boeing 787 Dreamliners between London Gatwick, Oslo and other European cities and US gateways including New York, Los Angeles, Miami and Orlando.",
    fareBrands: [
      fb({ brand: "Economy Light", cabin: "economy", priceMultiplier: 1, carryOnIncluded: false, changeable: false, checkedBagFee: 80, seatSelection: "paid" }),
      fb({ brand: "Economy Classic", cabin: "economy", priceMultiplier: 1.35, carryOnIncluded: true, checkedBagsIncluded: 1, changeFee: 100, seatSelection: "paid" }),
      fb({ brand: "Economy Flextra", cabin: "economy", priceMultiplier: 1.75, carryOnIncluded: true, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
      fb({ brand: "Premium Light", cabin: "premium_economy", priceMultiplier: 1, checkedBagsIncluded: 1, seatSelection: "free" }),
      fb({ brand: "Premium Flextra", cabin: "premium_economy", priceMultiplier: 1.4, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
    ],
  },

  /* ──────────────────────── Middle East · Africa ──────────────────────── */
  {
    iata: "EK", icao: "UAE", name: "Emirates", slug: "emirates", country: "United Arab Emirates", countryCode: "AE",
    hubs: ["DXB"], color: "#d71a21", website: "https://www.emirates.com",
    fleet: ["Airbus A380", "Boeing 777-300ER", "Airbus A350-900"],
    founded: 1985, headquarters: "Dubai", loyaltyProgram: "Emirates Skywards", checkedBagFee: 0,
    description: "Emirates is the world's largest international airline, connecting a dozen US gateways with Dubai and onward to Asia, Africa and Australia on an all-widebody fleet of A380s and 777s. Checked bags are included on all long-haul fares.",
    fareBrands: [
      fb({ brand: "Economy Special", cabin: "economy", priceMultiplier: 1, checkedBagsIncluded: 1, changeable: false, seatSelection: "paid" }),
      fb({ brand: "Economy Saver", cabin: "economy", priceMultiplier: 1.15, checkedBagsIncluded: 1, changeFee: 200, seatSelection: "paid" }),
      fb({ brand: "Economy Flex", cabin: "economy", priceMultiplier: 1.5, checkedBagsIncluded: 2, seatSelection: "free" }),
      fb({ brand: "Economy Flex Plus", cabin: "economy", priceMultiplier: 1.9, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
      fb({ brand: "Premium Economy", cabin: "premium_economy", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
      fb({ brand: "Business", cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
      fb({ brand: "Business Flex Plus", cabin: "business", priceMultiplier: 1.3, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
      fb({ brand: "First", cabin: "first", priceMultiplier: 1, checkedBagsIncluded: 3, refundable: true, seatSelection: "free" }),
    ],
  },
  {
    iata: "QR", icao: "QTR", name: "Qatar Airways", slug: "qatar-airways", country: "Qatar", countryCode: "QA", alliance: "oneworld",
    hubs: ["DOH"], color: "#5c0632", website: "https://www.qatarairways.com",
    fleet: ["Airbus A350-1000", "Boeing 777-300ER", "Boeing 787-9", "Airbus A380"],
    founded: 1993, headquarters: "Doha", loyaltyProgram: "Privilege Club", checkedBagFee: 0,
    description: "Qatar Airways flies from its Doha hub to more than a dozen US cities and over 170 destinations worldwide. A oneworld member, it is regularly rated among the best airlines in the world, especially for its Qsuite business class.",
    fareBrands: [
      fb({ brand: "Economy Classic", cabin: "economy", priceMultiplier: 1, checkedBagsIncluded: 1, changeable: false, seatSelection: "paid" }),
      fb({ brand: "Economy Convenience", cabin: "economy", priceMultiplier: 1.2, checkedBagsIncluded: 2, changeFee: 150, seatSelection: "paid" }),
      fb({ brand: "Economy Comfort", cabin: "economy", priceMultiplier: 1.6, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
      fb({ brand: "Business Classic", cabin: "business", priceMultiplier: 1, checkedBagsIncluded: 2, seatSelection: "free" }),
      fb({ brand: "Business Elite", cabin: "business", priceMultiplier: 1.35, checkedBagsIncluded: 2, refundable: true, seatSelection: "free" }),
      fb({ brand: "First", cabin: "first", priceMultiplier: 1, checkedBagsIncluded: 3, refundable: true, seatSelection: "free" }),
    ],
  },
  {
    iata: "EY", icao: "ETD", name: "Etihad Airways", slug: "etihad-airways", country: "United Arab Emirates", countryCode: "AE",
    hubs: ["AUH"], color: "#bd8b13", website: "https://www.etihad.com",
    fleet: ["Boeing 787-9", "Airbus A350-1000", "Boeing 777-300ER", "Airbus A380"],
    founded: 2003, headquarters: "Abu Dhabi", loyaltyProgram: "Etihad Guest", checkedBagFee: 0,
    description: "Etihad Airways is the national airline of the United Arab Emirates, based in Abu Dhabi, flying to New York, Washington, Chicago and Boston. Abu Dhabi offers US Preclearance so passengers arrive in the US as domestic travelers.",
    fareBrands: intlLadder({ light: "Economy Basic", standard: "Economy Value", flex: "Economy Comfort", premium: "Economy Space", business: "Business", first: "First" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(1, b.checkedBagsIncluded) })),
  },
  {
    iata: "LY", icao: "ELY", name: "El Al", slug: "el-al", country: "Israel", countryCode: "IL",
    hubs: ["TLV"], color: "#0b2d6e", website: "https://www.elal.com",
    fleet: ["Boeing 787-9", "Boeing 777-200ER", "Boeing 737-800"], cabins: ["economy", "premium_economy", "business"],
    founded: 1948, headquarters: "Tel Aviv", loyaltyProgram: "Matmid", checkedBagFee: 80,
    description: "El Al is Israel's flag carrier, flying nonstop from Tel Aviv to New York, Newark, Boston, Miami, Los Angeles and other US cities, and is known for its rigorous security procedures.",
    fareBrands: intlLadder({ light: "Lite", standard: "Classic", flex: "Flex", premium: "Premium", business: "Business" }, 80),
  },
  {
    iata: "ET", icao: "ETH", name: "Ethiopian Airlines", slug: "ethiopian-airlines", country: "Ethiopia", countryCode: "ET", alliance: "star",
    hubs: ["ADD"], color: "#2e8b57", website: "https://www.ethiopianairlines.com",
    fleet: ["Boeing 787-9", "Airbus A350-900", "Boeing 777-300ER", "Boeing 737 MAX 8"], cabins: ["economy", "business"],
    founded: 1945, headquarters: "Addis Ababa", loyaltyProgram: "ShebaMiles", checkedBagFee: 0,
    description: "Ethiopian Airlines is Africa's largest and most profitable airline, connecting the US (Washington, Newark, Chicago, Atlanta) with more than 60 African cities through its Addis Ababa hub. It is a Star Alliance member.",
    fareBrands: intlLadder({ light: "Economy Saver", standard: "Economy Classic", flex: "Economy Flex", premium: "Economy Plus", business: "Cloud Nine" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(1, b.checkedBagsIncluded) })),
  },

  /* ───────────────────────────── Asia · Pacific ───────────────────────────── */
  {
    iata: "JL", icao: "JAL", name: "Japan Airlines", slug: "japan-airlines", country: "Japan", countryCode: "JP", alliance: "oneworld",
    hubs: ["HND", "NRT", "KIX"], color: "#c8102e", website: "https://www.jal.co.jp/us/en/",
    fleet: ["Boeing 787-9", "Airbus A350-1000", "Boeing 777-300ER", "Boeing 787-8"],
    founded: 1951, headquarters: "Tokyo", loyaltyProgram: "JAL Mileage Bank", checkedBagFee: 0,
    description: "Japan Airlines flies from Tokyo Haneda and Narita to Los Angeles, San Francisco, New York, Chicago, Dallas/Fort Worth, Seattle, Boston, San Diego and Honolulu. A oneworld member and joint-venture partner of American Airlines, JAL includes two free checked bags on transpacific economy fares.",
    fareBrands: intlLadder({ light: "Economy Saver", standard: "Economy Standard", flex: "Economy Flex", premium: "Premium Economy", business: "Business Class", first: "First Class" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(2, b.checkedBagsIncluded) })),
  },
  {
    iata: "NH", icao: "ANA", name: "ANA All Nippon Airways", slug: "ana", country: "Japan", countryCode: "JP", alliance: "star",
    hubs: ["HND", "NRT"], color: "#00318a", website: "https://www.ana.co.jp/en/us/",
    fleet: ["Boeing 787-9", "Boeing 777-300ER", "Boeing 787-10", "Airbus A380"],
    founded: 1952, headquarters: "Tokyo", loyaltyProgram: "ANA Mileage Club", checkedBagFee: 0,
    description: "ANA is Japan's largest airline and a Star Alliance member, flying from Tokyo to more US cities than any other Japanese carrier, including New York, Washington, Chicago, Houston, Los Angeles, San Francisco, Seattle and Honolulu. Two checked bags are included in economy.",
    fareBrands: intlLadder({ light: "Economy Basic", standard: "Economy Standard", flex: "Economy Flex", premium: "Premium Economy", business: "Business Class", first: "First Class" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(2, b.checkedBagsIncluded) })),
  },
  {
    iata: "KE", icao: "KAL", name: "Korean Air", slug: "korean-air", country: "South Korea", countryCode: "KR", alliance: "skyteam",
    hubs: ["ICN"], color: "#0f4c81", website: "https://www.koreanair.com",
    fleet: ["Boeing 787-9", "Airbus A350-900", "Boeing 777-300ER", "Airbus A380", "Boeing 747-8"],
    founded: 1969, headquarters: "Seoul", loyaltyProgram: "SKYPASS", checkedBagFee: 0,
    description: "Korean Air is South Korea's flag carrier and a founding SkyTeam member, connecting Seoul Incheon with a dozen US cities. Its 2024 merger with Asiana created one of Asia's largest airlines.",
    fareBrands: intlLadder({ light: "Economy Saver", standard: "Economy Standard", flex: "Economy Flex", premium: "Premium Economy", business: "Prestige Class", first: "First Class" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(1, b.checkedBagsIncluded) })),
  },
  {
    iata: "OZ", icao: "AAR", name: "Asiana Airlines", slug: "asiana-airlines", country: "South Korea", countryCode: "KR", alliance: "star",
    hubs: ["ICN"], color: "#8b1c2f", website: "https://flyasiana.com",
    fleet: ["Airbus A350-900", "Boeing 777-200ER", "Airbus A380", "Airbus A321neo"], cabins: ["economy", "business"],
    founded: 1988, headquarters: "Seoul", loyaltyProgram: "Asiana Club", checkedBagFee: 0,
    description: "Asiana Airlines flies from Seoul Incheon to Los Angeles, San Francisco, Seattle, New York and Honolulu. Now a subsidiary of Korean Air, it continues to operate under its own brand during integration.",
    fareBrands: intlLadder({ light: "Economy Saver", standard: "Economy Standard", flex: "Economy Flex", premium: "Economy Smartium", business: "Business Smartium" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(1, b.checkedBagsIncluded) })),
  },
  {
    iata: "CX", icao: "CPA", name: "Cathay Pacific", slug: "cathay-pacific", country: "Hong Kong", countryCode: "HK", alliance: "oneworld",
    hubs: ["HKG"], color: "#006564", website: "https://www.cathaypacific.com",
    fleet: ["Airbus A350-1000", "Boeing 777-300ER", "Airbus A350-900", "Boeing 777-9"],
    founded: 1946, headquarters: "Hong Kong", loyaltyProgram: "Cathay", checkedBagFee: 0,
    description: "Cathay Pacific is Hong Kong's home airline and a oneworld founding member, flying nonstop from Hong Kong to New York, Los Angeles, San Francisco, Chicago, Boston, Dallas/Fort Worth and Seattle.",
    fareBrands: intlLadder({ light: "Economy Light", standard: "Economy Essential", flex: "Economy Flex", premium: "Premium Economy", business: "Business", first: "First" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(1, b.checkedBagsIncluded) })),
  },
  {
    iata: "BR", icao: "EVA", name: "EVA Air", slug: "eva-air", country: "Taiwan", countryCode: "TW", alliance: "star",
    hubs: ["TPE"], color: "#00845a", website: "https://www.evaair.com",
    fleet: ["Boeing 787-10", "Boeing 777-300ER", "Airbus A350-900", "Airbus A321"], cabins: ["economy", "premium_economy", "business"],
    founded: 1989, headquarters: "Taoyuan, Taiwan", loyaltyProgram: "Infinity MileageLands", checkedBagFee: 0,
    description: "EVA Air is a Taiwanese Star Alliance carrier with nonstop flights from Taipei to Los Angeles, San Francisco, Seattle, New York, Chicago, Houston and Dallas/Fort Worth, and a highly rated premium economy cabin.",
    fareBrands: intlLadder({ light: "Economy Basic", standard: "Economy Standard", flex: "Economy Up", premium: "Premium Economy", business: "Royal Laurel" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(2, b.checkedBagsIncluded) })),
  },
  {
    iata: "CI", icao: "CAL", name: "China Airlines", slug: "china-airlines", country: "Taiwan", countryCode: "TW", alliance: "skyteam",
    hubs: ["TPE"], color: "#cf2d5f", website: "https://www.china-airlines.com",
    fleet: ["Airbus A350-900", "Boeing 777-300ER", "Airbus A321neo"], cabins: ["economy", "premium_economy", "business"],
    founded: 1959, headquarters: "Taoyuan, Taiwan", loyaltyProgram: "Dynasty Flyer", checkedBagFee: 0,
    description: "China Airlines is Taiwan's flag carrier and a SkyTeam member, flying from Taipei to Los Angeles, San Francisco, New York, Ontario (California), Seattle and Honolulu.",
    fareBrands: intlLadder({ light: "Economy Basic", standard: "Economy Standard", flex: "Economy Flex", premium: "Premium Economy", business: "Business" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(2, b.checkedBagsIncluded) })),
  },
  {
    iata: "SQ", icao: "SIA", name: "Singapore Airlines", slug: "singapore-airlines", country: "Singapore", countryCode: "SG", alliance: "star",
    hubs: ["SIN"], color: "#f2a900", website: "https://www.singaporeair.com",
    fleet: ["Airbus A350-900ULR", "Airbus A380", "Boeing 777-300ER", "Boeing 787-10"],
    founded: 1972, headquarters: "Singapore", loyaltyProgram: "KrisFlyer", checkedBagFee: 0,
    description: "Singapore Airlines operates the world's longest nonstop flights, from Singapore to New York and Newark, plus service to Los Angeles, San Francisco, Seattle and Houston. It is consistently ranked among the world's best airlines.",
    fareBrands: intlLadder({ light: "Economy Lite", standard: "Economy Value", flex: "Economy Flexi", premium: "Premium Economy", business: "Business", first: "Suites" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(1, b.checkedBagsIncluded) })),
  },
  {
    iata: "PR", icao: "PAL", name: "Philippine Airlines", slug: "philippine-airlines", country: "Philippines", countryCode: "PH",
    hubs: ["MNL"], color: "#0038a8", website: "https://www.philippineairlines.com",
    fleet: ["Boeing 777-300ER", "Airbus A350-900", "Airbus A321neo"], cabins: ["economy", "premium_economy", "business"],
    founded: 1941, headquarters: "Manila", loyaltyProgram: "Mabuhay Miles", checkedBagFee: 0,
    description: "Philippine Airlines is Asia's oldest airline, flying nonstop from Manila to Los Angeles, San Francisco, New York, Seattle and Honolulu, and is the main link between the large Filipino-American community and the Philippines.",
    fareBrands: intlLadder({ light: "Economy Saver", standard: "Economy Value", flex: "Economy Flex", premium: "Premium Economy", business: "Business" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(2, b.checkedBagsIncluded) })),
  },
  {
    iata: "AI", icao: "AIC", name: "Air India", slug: "air-india", country: "India", countryCode: "IN", alliance: "star",
    hubs: ["DEL", "BOM"], color: "#c8102e", website: "https://www.airindia.com",
    fleet: ["Boeing 777-300ER", "Boeing 787-8", "Airbus A350-900", "Boeing 777-200LR"], cabins: ["economy", "premium_economy", "business", "first"],
    founded: 1932, headquarters: "Gurugram, India", loyaltyProgram: "Maharaja Club", checkedBagFee: 0,
    description: "Air India is India's flag carrier, now owned by the Tata Group and undergoing a major fleet renewal. It flies nonstop from Delhi and Mumbai to New York, Newark, Chicago, San Francisco and Washington as a Star Alliance member.",
    fareBrands: intlLadder({ light: "Economy Comfort", standard: "Economy Comfort Plus", flex: "Economy Flex", premium: "Premium Economy", business: "Business", first: "First" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(2, b.checkedBagsIncluded) })),
  },
  {
    iata: "QF", icao: "QFA", name: "Qantas", slug: "qantas", country: "Australia", countryCode: "AU", alliance: "oneworld",
    hubs: ["SYD", "MEL", "BNE"], color: "#e0001b", website: "https://www.qantas.com",
    fleet: ["Boeing 787-9", "Airbus A380", "Airbus A330-300", "Boeing 737-800"],
    founded: 1920, headquarters: "Sydney", loyaltyProgram: "Qantas Frequent Flyer", checkedBagFee: 0,
    description: "Qantas is Australia's flag carrier and a oneworld founding member, flying from Sydney, Melbourne and Brisbane to Los Angeles, San Francisco, Dallas/Fort Worth, New York and Honolulu, often in partnership with American Airlines.",
    fareBrands: intlLadder({ light: "Economy Sale", standard: "Economy Saver", flex: "Economy Flex", premium: "Premium Economy", business: "Business", first: "First" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(1, b.checkedBagsIncluded) })),
  },
  {
    iata: "NZ", icao: "ANZ", name: "Air New Zealand", slug: "air-new-zealand", country: "New Zealand", countryCode: "NZ", alliance: "star",
    hubs: ["AKL"], color: "#00247d", website: "https://www.airnewzealand.com",
    fleet: ["Boeing 787-9", "Boeing 777-300ER", "Airbus A321neo"], cabins: ["economy", "premium_economy", "business"],
    founded: 1940, headquarters: "Auckland", loyaltyProgram: "Airpoints", checkedBagFee: 0,
    description: "Air New Zealand connects Auckland with Los Angeles, San Francisco, Houston, Chicago and New York, and is known for innovative economy products like the Skycouch. It is a Star Alliance member.",
    fareBrands: intlLadder({ light: "Seat", standard: "Seat + Bag", flex: "The Works", premium: "Premium Economy", business: "Business Premier" }, 0).map((b, i) => ({ ...b, checkedBagsIncluded: i === 0 ? 0 : Math.max(1, b.checkedBagsIncluded) })),
  },
  {
    iata: "FJ", icao: "FJI", name: "Fiji Airways", slug: "fiji-airways", country: "Fiji", countryCode: "FJ", alliance: "oneworld",
    hubs: ["NAN"], color: "#00a3a1", website: "https://www.fijiairways.com",
    fleet: ["Airbus A350-900", "Airbus A330-300", "Boeing 737 MAX 8"], cabins: ["economy", "business"],
    founded: 1947, headquarters: "Nadi, Fiji", loyaltyProgram: "Tabua Club", checkedBagFee: 0,
    description: "Fiji Airways flies from Nadi to Los Angeles, San Francisco, Dallas/Fort Worth and Honolulu, making Fiji a popular stopover between the US mainland and Australia or New Zealand. It became a full oneworld member in 2025.",
    fareBrands: intlLadder({ light: "Lite", standard: "Value", flex: "Comfort", premium: "Bula Space", business: "Business" }, 0).map((b) => ({ ...b, checkedBagsIncluded: Math.max(1, b.checkedBagsIncluded) })),
  },
];

/* ──────────────────────────────── Lookups ──────────────────────────────── */

export const AIRLINE_BY_IATA: Record<string, AirlineProfile> = Object.fromEntries(AIRLINES.map((a) => [a.iata, a]));

export function getAirline(iata: string): AirlineProfile | undefined {
  return AIRLINE_BY_IATA[iata.toUpperCase()];
}

export function getAirlineBySlug(slug: string): AirlineProfile | undefined {
  return AIRLINES.find((a) => a.slug === slug.toLowerCase());
}

export const US_AIRLINES: AirlineProfile[] = AIRLINES.filter((a) => a.countryCode === "US");

/** Regional partners that operate flights under a mainline brand (shown as "operated by"). */
const OPERATOR_NAMES: Record<string, string> = {
  OO: "SkyWest Airlines",
  "9E": "Endeavor Air",
  YX: "Republic Airways",
  MQ: "Envoy Air",
  OH: "PSA Airlines",
  PT: "Piedmont Airlines",
  YV: "Mesa Airlines",
  G7: "GoJet Airlines",
  C5: "CommuteAir",
  QX: "Horizon Air",
  QK: "Jazz Aviation",
};

/** Airline display name for any IATA code (falls back to the code itself). */
export function airlineName(iata: string): string {
  return AIRLINE_BY_IATA[iata]?.name ?? OPERATOR_NAMES[iata] ?? iata;
}

export const ALLIANCE_LABELS: Record<Alliance, string> = {
  oneworld: "oneworld",
  skyteam: "SkyTeam",
  star: "Star Alliance",
};
