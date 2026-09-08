/**
 * Popular flight routes — the backbone of the SEO route pages, home-page
 * modules and internal linking. Directional: the site generates the reverse
 * direction automatically, so each city pair appears once.
 */
import type { RouteDef } from "./types";
import { getAirport } from "./airports";

const US = new Set(["US", "PR", "VI", "GU"]);

function r(origin: string, destination: string, popular = false): RouteDef {
  const o = getAirport(origin);
  const d = getAirport(destination);
  const domestic = Boolean(o && d && US.has(o.countryCode) && US.has(d.countryCode));
  return { origin, destination, popular: popular || undefined, category: domestic ? "domestic" : "international" };
}

export const ROUTES: RouteDef[] = [
  // ── Transcontinental & trunk routes ──────────────────────────────────────
  r("JFK", "LAX", true), r("JFK", "SFO", true), r("EWR", "LAX"), r("EWR", "SFO"), r("BOS", "LAX", true), r("BOS", "SFO"),
  r("JFK", "LAS", true), r("JFK", "SEA"), r("EWR", "SEA"), r("BOS", "SEA"), r("JFK", "SAN"), r("IAD", "LAX"), r("IAD", "SFO"),
  r("DCA", "LAX"), r("PHL", "LAX"), r("JFK", "PHX"), r("JFK", "DEN"), r("JFK", "AUS"), r("BOS", "DEN"),
  // ── Northeast shuttle & short-haul ──────────────────────────────────────
  r("LGA", "ORD", true), r("LGA", "ATL", true), r("LGA", "MIA", true), r("LGA", "DCA"), r("BOS", "DCA", true), r("LGA", "BOS"),
  r("JFK", "MIA", true), r("JFK", "MCO", true), r("JFK", "FLL", true), r("EWR", "MCO", true), r("EWR", "FLL"), r("BOS", "MIA", true), r("BOS", "MCO", true),
  r("PHL", "MCO", true), r("PHL", "FLL"), r("BWI", "MCO"), r("BWI", "FLL"), r("DCA", "MIA"), r("IAD", "MCO"), r("LGA", "DTW"), r("LGA", "CLT"),
  r("JFK", "SJU", true), r("BOS", "SJU"), r("MCO", "SJU"), r("EWR", "SJU"), r("PHL", "SJU"),
  r("BOS", "ORD"), r("LGA", "MSP"), r("LGA", "DFW"), r("LGA", "IAH"), r("JFK", "ATL"), r("LGA", "RDU"), r("LGA", "BNA"), r("JFK", "TPA"), r("BOS", "TPA"), r("BOS", "PHL"),
  // ── Southeast ───────────────────────────────────────────────────────────
  r("ATL", "MCO", true), r("ATL", "LAX", true), r("ATL", "LAS", true), r("ATL", "MIA"), r("ATL", "FLL"), r("ATL", "DFW"), r("ATL", "ORD"), r("ATL", "DEN"), r("ATL", "SEA"), r("ATL", "SFO"), r("ATL", "TPA"), r("ATL", "BOS"), r("ATL", "IAH"), r("ATL", "PHX"), r("ATL", "MSY"), r("ATL", "BNA"),
  r("CLT", "MCO"), r("CLT", "LAX"), r("CLT", "LAS"), r("MIA", "ORD"), r("MIA", "LAX"), r("MIA", "DFW"), r("MIA", "LAS"), r("MCO", "ORD"), r("MCO", "DFW"), r("MCO", "DTW"), r("MCO", "LAX"), r("MCO", "DEN"), r("MCO", "LAS"), r("TPA", "ORD"), r("FLL", "ORD"), r("RSW", "ORD"), r("MSY", "LAX"), r("BNA", "LAX"), r("BNA", "DEN"), r("RDU", "LAX"), r("SAV", "ORD"), r("CHS", "ORD"),
  // ── Midwest ─────────────────────────────────────────────────────────────
  r("ORD", "LAX", true), r("ORD", "SFO", true), r("ORD", "LAS", true), r("ORD", "DEN"), r("ORD", "PHX"), r("ORD", "SEA"), r("ORD", "DFW"), r("ORD", "IAH"), r("ORD", "SAN"), r("ORD", "AUS"), r("ORD", "MSP"), r("ORD", "DTW"), r("ORD", "BNA"), r("ORD", "MSY"),
  r("MDW", "LAS"), r("MDW", "MCO"), r("MDW", "DEN"), r("DTW", "LAX"), r("DTW", "LAS"), r("DTW", "FLL"), r("DTW", "DEN"), r("MSP", "PHX"), r("MSP", "LAX"), r("MSP", "LAS"), r("MSP", "MCO"), r("MSP", "DEN"), r("MSP", "SEA"), r("STL", "DEN"), r("STL", "LAS"), r("MCI", "DEN"), r("MCI", "LAX"), r("IND", "MCO"), r("CLE", "MCO"), r("CMH", "MCO"), r("CVG", "MCO"), r("MKE", "MCO"),
  // ── Texas & South Central ───────────────────────────────────────────────
  r("DFW", "LAX", true), r("DFW", "DEN", true), r("DFW", "LAS"), r("DFW", "SFO"), r("DFW", "SEA"), r("DFW", "PHX"), r("DFW", "SAN"), r("DFW", "ORD"), r("DFW", "MCO"), r("DFW", "BOS"), r("DFW", "JFK"), r("DFW", "MSY"),
  r("IAH", "LAX", true), r("IAH", "DEN"), r("IAH", "LAS"), r("IAH", "SFO"), r("IAH", "MCO"), r("IAH", "JFK"), r("DAL", "LAS"), r("DAL", "DEN"), r("HOU", "LAS"), r("HOU", "MCO"),
  r("AUS", "LAX"), r("AUS", "DEN"), r("AUS", "LAS"), r("AUS", "SFO"), r("AUS", "SEA"), r("SAT", "LAS"), r("SAT", "DEN"), r("OKC", "DEN"), r("MSY", "DEN"),
  // ── Mountain West ───────────────────────────────────────────────────────
  r("DEN", "LAX", true), r("DEN", "LAS", true), r("DEN", "PHX"), r("DEN", "SFO"), r("DEN", "SEA"), r("DEN", "SAN"), r("DEN", "SLC"), r("DEN", "PDX"), r("DEN", "BOS"),
  r("PHX", "SEA"), r("PHX", "LAX"), r("PHX", "LAS"), r("PHX", "SFO"), r("PHX", "DFW"), r("PHX", "ORD"), r("PHX", "PDX"), r("SLC", "LAX"), r("SLC", "LAS"), r("SLC", "SEA"), r("SLC", "SFO"), r("SLC", "PHX"), r("ABQ", "DEN"), r("BOI", "SEA"), r("BOI", "LAS"), r("BZN", "DEN"), r("JAC", "DEN"),
  // ── West Coast ──────────────────────────────────────────────────────────
  r("LAX", "SFO", true), r("LAX", "LAS", true), r("LAX", "SEA", true), r("LAX", "PDX"), r("LAX", "SJC"), r("LAX", "OAK"), r("LAX", "SMF"), r("LAX", "SAN"), r("SFO", "SEA", true), r("SFO", "LAS"), r("SFO", "SAN"), r("SFO", "PDX"), r("SEA", "LAS"), r("SEA", "SAN"), r("SEA", "PDX"), r("SAN", "LAS"), r("SAN", "SJC"), r("SAN", "SMF"), r("PDX", "LAS"), r("PDX", "SAN"), r("BUR", "LAS"), r("SNA", "SFO"), r("OAK", "LAS"), r("SJC", "LAS"),
  // ── Hawaii & Alaska ─────────────────────────────────────────────────────
  r("LAX", "HNL", true), r("SFO", "HNL", true), r("LAX", "OGG", true), r("SEA", "HNL", true), r("SFO", "OGG"), r("SEA", "OGG"), r("SAN", "HNL"), r("PHX", "HNL"), r("LAS", "HNL"), r("DEN", "HNL"), r("DFW", "HNL"), r("ORD", "HNL"), r("JFK", "HNL"), r("LAX", "KOA"), r("LAX", "LIH"), r("SFO", "KOA"), r("SEA", "KOA"), r("HNL", "OGG"),
  r("SEA", "ANC", true), r("LAX", "ANC"), r("SFO", "ANC"), r("DEN", "ANC"), r("ORD", "ANC"), r("PDX", "ANC"), r("SEA", "FAI"), r("SEA", "JNU"),
  // ── Canada ──────────────────────────────────────────────────────────────
  r("JFK", "YYZ", true), r("LGA", "YYZ"), r("EWR", "YYZ"), r("BOS", "YYZ"), r("ORD", "YYZ"), r("LAX", "YYZ"), r("SFO", "YYZ"), r("MIA", "YYZ"), r("DEN", "YYZ"), r("LAX", "YVR", true), r("SEA", "YVR", true), r("SFO", "YVR"), r("JFK", "YVR"), r("LAS", "YVR"), r("JFK", "YUL"), r("BOS", "YUL"), r("ORD", "YUL"), r("LAX", "YYC"), r("LAS", "YYC"), r("DEN", "YYC"),
  // ── Mexico ──────────────────────────────────────────────────────────────
  r("JFK", "CUN", true), r("EWR", "CUN"), r("BOS", "CUN"), r("ORD", "CUN", true), r("ATL", "CUN", true), r("MIA", "CUN"), r("DFW", "CUN", true), r("IAH", "CUN"), r("LAX", "CUN", true), r("DEN", "CUN"), r("PHX", "CUN"), r("CLT", "CUN"), r("MSP", "CUN"), r("DTW", "CUN"), r("PHL", "CUN"), r("BWI", "CUN"), r("MCO", "CUN"), r("LAS", "CUN"), r("SFO", "CUN"), r("SEA", "CUN"),
  r("JFK", "MEX", true), r("ORD", "MEX"), r("MIA", "MEX"), r("DFW", "MEX"), r("IAH", "MEX"), r("LAX", "MEX", true), r("ATL", "MEX"), r("SFO", "MEX"), r("LAS", "MEX"), r("SAN", "MEX"),
  r("LAX", "SJD", true), r("SFO", "SJD"), r("DFW", "SJD"), r("DEN", "SJD"), r("PHX", "SJD"), r("SEA", "SJD"), r("LAX", "PVR", true), r("DFW", "PVR"), r("DEN", "PVR"), r("PHX", "PVR"), r("SFO", "PVR"), r("LAX", "GDL", true), r("SFO", "GDL"), r("ORD", "GDL"), r("DFW", "GDL"), r("LAX", "OAX"), r("IAH", "MTY"), r("DFW", "MTY"), r("LAX", "MTY"),
  // ── Caribbean & Central America ─────────────────────────────────────────
  r("JFK", "PUJ", true), r("EWR", "PUJ"), r("MIA", "PUJ"), r("BOS", "PUJ"), r("ATL", "PUJ"), r("ORD", "PUJ"), r("PHL", "PUJ"), r("CLT", "PUJ"), r("JFK", "SDQ"), r("MIA", "SDQ"),
  r("MIA", "MBJ", true), r("JFK", "MBJ"), r("ATL", "MBJ"), r("FLL", "MBJ"), r("ORD", "MBJ"), r("BOS", "MBJ"), r("CLT", "MBJ"), r("MIA", "KIN"), r("JFK", "KIN"),
  r("MIA", "NAS", true), r("FLL", "NAS"), r("JFK", "NAS"), r("ATL", "NAS"), r("MCO", "NAS"), r("CLT", "NAS"),
  r("JFK", "AUA"), r("MIA", "AUA"), r("BOS", "AUA"), r("ATL", "AUA"), r("CLT", "AUA"), r("EWR", "AUA"), r("MIA", "CUR"), r("JFK", "SXM"), r("MIA", "SXM"), r("MIA", "GCM"), r("JFK", "PLS"), r("MIA", "PLS"), r("MIA", "BGI"), r("JFK", "BGI"), r("MIA", "POS"), r("MIA", "HAV"),
  r("MIA", "SJO", true), r("JFK", "SJO"), r("LAX", "SJO"), r("IAH", "SJO"), r("DFW", "SJO"), r("ATL", "SJO"), r("EWR", "SJO"), r("LAX", "LIR"), r("DFW", "LIR"), r("IAH", "LIR"), r("DEN", "LIR"), r("MIA", "PTY", true), r("JFK", "PTY"), r("LAX", "PTY"), r("IAH", "PTY"), r("MIA", "GUA"), r("LAX", "GUA"), r("IAH", "GUA"), r("MIA", "SAL"), r("LAX", "SAL"), r("IAH", "SAL"), r("MIA", "BZE"), r("IAH", "BZE"), r("DFW", "BZE"), r("IAH", "RTB"),
  // ── South America ───────────────────────────────────────────────────────
  r("MIA", "BOG", true), r("JFK", "BOG"), r("FLL", "BOG"), r("IAH", "BOG"), r("LAX", "BOG"), r("MIA", "MDE"), r("JFK", "MDE"), r("MIA", "CTG"), r("JFK", "CTG"),
  r("MIA", "LIM", true), r("JFK", "LIM"), r("LAX", "LIM"), r("IAH", "LIM"), r("ATL", "LIM"), r("MIA", "UIO"), r("JFK", "UIO"), r("IAH", "UIO"), r("MIA", "GYE"),
  r("MIA", "GRU", true), r("JFK", "GRU"), r("IAH", "GRU"), r("ATL", "GRU"), r("LAX", "GRU"), r("ORD", "GRU"), r("MIA", "GIG"), r("JFK", "GIG"), r("IAH", "GIG"),
  r("MIA", "SCL", true), r("JFK", "SCL"), r("ATL", "SCL"), r("LAX", "SCL"), r("MIA", "EZE", true), r("JFK", "EZE"), r("IAH", "EZE"), r("ATL", "EZE"), r("DFW", "EZE"), r("MIA", "MVD"),
  // ── United Kingdom & Ireland ────────────────────────────────────────────
  r("JFK", "LHR", true), r("EWR", "LHR", true), r("BOS", "LHR", true), r("ORD", "LHR", true), r("IAD", "LHR", true), r("ATL", "LHR"), r("MIA", "LHR"), r("DFW", "LHR"), r("LAX", "LHR", true), r("SFO", "LHR", true), r("SEA", "LHR"), r("IAH", "LHR"), r("PHL", "LHR"), r("DEN", "LHR"), r("LAS", "LHR"), r("MCO", "LHR"), r("PHX", "LHR"), r("AUS", "LHR"), r("BNA", "LHR"), r("SAN", "LHR"), r("MSP", "LHR"), r("DTW", "LHR"), r("CLT", "LHR"), r("PIT", "LHR"), r("RDU", "LHR"), r("SLC", "LHR"), r("PDX", "LHR"), r("TPA", "LHR"), r("MSY", "LHR"), r("CVG", "LHR"), r("STL", "LHR"), r("MCI", "LHR"), r("IND", "LHR"),
  r("JFK", "LGW"), r("MCO", "LGW"), r("TPA", "LGW"), r("LAS", "LGW"), r("JFK", "MAN"), r("ORD", "MAN"), r("ATL", "MAN"), r("JFK", "EDI"), r("BOS", "EDI"), r("ORD", "EDI"),
  r("JFK", "DUB", true), r("BOS", "DUB", true), r("ORD", "DUB"), r("EWR", "DUB"), r("PHL", "DUB"), r("IAD", "DUB"), r("LAX", "DUB"), r("SFO", "DUB"), r("MIA", "DUB"), r("SEA", "DUB"), r("DFW", "DUB"), r("ATL", "DUB"), r("DEN", "DUB"), r("CLT", "DUB"), r("MSP", "DUB"), r("BOS", "SNN"), r("JFK", "SNN"),
  // ── Continental Europe ──────────────────────────────────────────────────
  r("JFK", "CDG", true), r("EWR", "CDG"), r("BOS", "CDG", true), r("ORD", "CDG", true), r("IAD", "CDG"), r("ATL", "CDG", true), r("MIA", "CDG"), r("DFW", "CDG"), r("LAX", "CDG", true), r("SFO", "CDG", true), r("SEA", "CDG"), r("IAH", "CDG"), r("DTW", "CDG"), r("MSP", "CDG"), r("PHL", "CDG"), r("DEN", "CDG"), r("SLC", "CDG"), r("RDU", "CDG"), r("JFK", "ORY"), r("JFK", "NCE"), r("EWR", "NCE"),
  r("JFK", "AMS", true), r("EWR", "AMS"), r("BOS", "AMS"), r("ORD", "AMS"), r("ATL", "AMS"), r("IAD", "AMS"), r("MIA", "AMS"), r("DFW", "AMS"), r("LAX", "AMS"), r("SFO", "AMS"), r("SEA", "AMS"), r("IAH", "AMS"), r("DTW", "AMS"), r("MSP", "AMS"), r("SLC", "AMS"), r("PDX", "AMS"), r("AUS", "AMS"), r("LAS", "AMS"), r("JFK", "BRU"), r("IAD", "BRU"), r("ORD", "BRU"), r("ATL", "BRU"),
  r("JFK", "FRA", true), r("EWR", "FRA"), r("BOS", "FRA"), r("ORD", "FRA", true), r("IAD", "FRA"), r("ATL", "FRA"), r("MIA", "FRA"), r("DFW", "FRA"), r("LAX", "FRA"), r("SFO", "FRA"), r("SEA", "FRA"), r("IAH", "FRA"), r("DEN", "FRA"), r("DTW", "FRA"), r("PHL", "FRA"), r("CLT", "FRA"), r("JFK", "MUC"), r("EWR", "MUC"), r("BOS", "MUC"), r("ORD", "MUC"), r("IAD", "MUC"), r("LAX", "MUC"), r("SFO", "MUC"), r("DEN", "MUC"), r("CLT", "MUC"), r("JFK", "BER"), r("EWR", "BER"), r("JFK", "DUS"), r("ATL", "DUS"),
  r("JFK", "ZRH"), r("EWR", "ZRH"), r("BOS", "ZRH"), r("ORD", "ZRH"), r("IAD", "ZRH"), r("MIA", "ZRH"), r("LAX", "ZRH"), r("SFO", "ZRH"), r("JFK", "GVA"), r("IAD", "GVA"), r("JFK", "VIE"), r("EWR", "VIE"), r("ORD", "VIE"), r("IAD", "VIE"), r("BOS", "VIE"),
  r("JFK", "MAD", true), r("EWR", "MAD"), r("BOS", "MAD"), r("ORD", "MAD"), r("MIA", "MAD", true), r("IAD", "MAD"), r("DFW", "MAD"), r("LAX", "MAD"), r("ATL", "MAD"), r("PHL", "MAD"), r("JFK", "BCN", true), r("EWR", "BCN"), r("BOS", "BCN"), r("MIA", "BCN"), r("ORD", "BCN"), r("ATL", "BCN"), r("LAX", "BCN"), r("SFO", "BCN"), r("IAD", "BCN"), r("PHL", "BCN"), r("JFK", "AGP"), r("EWR", "AGP"),
  r("JFK", "LIS", true), r("EWR", "LIS"), r("BOS", "LIS", true), r("MIA", "LIS"), r("ORD", "LIS"), r("IAD", "LIS"), r("SFO", "LIS"), r("PHL", "LIS"), r("ATL", "LIS"), r("EWR", "OPO"), r("JFK", "OPO"), r("BOS", "OPO"),
  r("JFK", "FCO", true), r("EWR", "FCO"), r("BOS", "FCO"), r("ORD", "FCO"), r("MIA", "FCO"), r("ATL", "FCO"), r("IAD", "FCO"), r("LAX", "FCO", true), r("SFO", "FCO"), r("PHL", "FCO"), r("DFW", "FCO"), r("JFK", "MXP", true), r("EWR", "MXP"), r("BOS", "MXP"), r("ORD", "MXP"), r("MIA", "MXP"), r("LAX", "MXP"), r("JFK", "VCE"), r("EWR", "VCE"), r("ATL", "VCE"), r("JFK", "NAP"), r("EWR", "NAP"),
  r("JFK", "ATH", true), r("EWR", "ATH"), r("BOS", "ATH"), r("ORD", "ATH"), r("IAD", "ATH"), r("PHL", "ATH"), r("ATL", "ATH"), r("JFK", "IST", true), r("EWR", "IST"), r("ORD", "IST"), r("IAD", "IST"), r("LAX", "IST"), r("SFO", "IST"), r("MIA", "IST"), r("BOS", "IST"), r("ATL", "IST"), r("DFW", "IST"), r("IAH", "IST"), r("SEA", "IST"), r("DEN", "IST"), r("DTW", "IST"),
  r("JFK", "CPH"), r("EWR", "CPH"), r("BOS", "CPH"), r("ORD", "CPH"), r("MIA", "CPH"), r("SFO", "CPH"), r("JFK", "ARN"), r("EWR", "ARN"), r("ORD", "ARN"), r("JFK", "OSL"), r("EWR", "OSL"), r("JFK", "HEL"), r("DFW", "HEL"), r("JFK", "KEF", true), r("BOS", "KEF"), r("EWR", "KEF"), r("ORD", "KEF"), r("IAD", "KEF"), r("SEA", "KEF"), r("DEN", "KEF"), r("MSP", "KEF"), r("RDU", "KEF"), r("JFK", "PRG"), r("EWR", "PRG"), r("JFK", "WAW"), r("ORD", "WAW"), r("EWR", "WAW"), r("MIA", "WAW"), r("JFK", "KRK"), r("ORD", "KRK"), r("JFK", "BUD"), r("EWR", "ZAG"), r("JFK", "DBV"),
  // ── Middle East & Africa ────────────────────────────────────────────────
  r("JFK", "DXB", true), r("EWR", "DXB"), r("BOS", "DXB"), r("ORD", "DXB"), r("IAD", "DXB"), r("MIA", "DXB"), r("DFW", "DXB"), r("IAH", "DXB"), r("LAX", "DXB", true), r("SFO", "DXB"), r("SEA", "DXB"), r("MCO", "DXB"), r("JFK", "AUH"), r("IAD", "AUH"), r("ORD", "AUH"), r("BOS", "AUH"), r("JFK", "DOH", true), r("IAD", "DOH"), r("BOS", "DOH"), r("ORD", "DOH"), r("MIA", "DOH"), r("DFW", "DOH"), r("IAH", "DOH"), r("LAX", "DOH"), r("SFO", "DOH"), r("SEA", "DOH"), r("PHL", "DOH"), r("ATL", "DOH"),
  r("JFK", "TLV", true), r("EWR", "TLV"), r("BOS", "TLV"), r("MIA", "TLV"), r("LAX", "TLV"), r("SFO", "TLV"), r("ORD", "TLV"), r("IAD", "TLV"), r("JFK", "AMM"), r("ORD", "AMM"), r("JFK", "CAI"), r("IAD", "CAI"), r("JFK", "CMN"), r("IAD", "CMN"), r("MIA", "CMN"),
  r("JFK", "JNB", true), r("ATL", "JNB"), r("IAD", "JNB"), r("EWR", "JNB"), r("JFK", "CPT"), r("ATL", "CPT"), r("IAD", "CPT"), r("JFK", "NBO"), r("IAD", "NBO"), r("IAD", "ADD"), r("EWR", "ADD"), r("ORD", "ADD"), r("ATL", "ADD"), r("JFK", "LOS"), r("IAD", "LOS"), r("ATL", "LOS"), r("JFK", "ACC"), r("IAD", "ACC"),
  // ── Asia ────────────────────────────────────────────────────────────────
  r("JFK", "NRT", true), r("JFK", "HND", true), r("EWR", "NRT"), r("EWR", "HND"), r("BOS", "NRT"), r("BOS", "HND"), r("ORD", "NRT"), r("ORD", "HND", true), r("IAD", "NRT"), r("IAD", "HND"), r("ATL", "HND"), r("DFW", "NRT"), r("DFW", "HND"), r("IAH", "NRT"), r("LAX", "NRT", true), r("LAX", "HND", true), r("SFO", "NRT", true), r("SFO", "HND"), r("SEA", "NRT", true), r("SEA", "HND"), r("SAN", "NRT"), r("HNL", "NRT"), r("HNL", "HND"), r("DEN", "NRT"), r("MSP", "HND"), r("DTW", "HND"), r("LAX", "KIX"), r("SFO", "KIX"), r("SEA", "KIX"), r("HNL", "KIX"),
  r("JFK", "ICN", true), r("EWR", "ICN"), r("BOS", "ICN"), r("ORD", "ICN"), r("IAD", "ICN"), r("ATL", "ICN"), r("DFW", "ICN"), r("LAX", "ICN", true), r("SFO", "ICN"), r("SEA", "ICN", true), r("SAN", "ICN"), r("LAS", "ICN"), r("HNL", "ICN"), r("DTW", "ICN"), r("MSP", "ICN"),
  r("JFK", "HKG", true), r("EWR", "HKG"), r("BOS", "HKG"), r("ORD", "HKG"), r("DFW", "HKG"), r("LAX", "HKG", true), r("SFO", "HKG", true), r("SEA", "HKG"), r("JFK", "TPE"), r("EWR", "TPE"), r("ORD", "TPE"), r("IAH", "TPE"), r("DFW", "TPE"), r("LAX", "TPE", true), r("SFO", "TPE", true), r("SEA", "TPE"), r("ONT", "TPE"), r("JFK", "PEK"), r("LAX", "PEK"), r("SFO", "PEK"), r("JFK", "PVG"), r("LAX", "PVG"), r("SFO", "PVG"), r("SEA", "PVG"), r("DFW", "PVG"),
  r("JFK", "SIN", true), r("EWR", "SIN"), r("LAX", "SIN"), r("SFO", "SIN", true), r("SEA", "SIN"), r("IAH", "SIN"), r("JFK", "BKK", true), r("LAX", "BKK", true), r("SFO", "BKK"), r("SEA", "BKK"), r("ORD", "BKK"), r("LAX", "KUL"), r("JFK", "KUL"), r("LAX", "MNL", true), r("SFO", "MNL", true), r("JFK", "MNL"), r("SEA", "MNL"), r("HNL", "MNL"), r("LAX", "CGK"), r("JFK", "CGK"), r("LAX", "DPS", true), r("JFK", "DPS"), r("SFO", "DPS"), r("SEA", "DPS"),
  r("JFK", "DEL", true), r("EWR", "DEL"), r("ORD", "DEL"), r("SFO", "DEL"), r("IAD", "DEL"), r("IAH", "DEL"), r("DFW", "DEL"), r("JFK", "BOM", true), r("EWR", "BOM"), r("ORD", "BOM"), r("SFO", "BOM"), r("LAX", "BOM"), r("SFO", "BLR"), r("JFK", "BLR"), r("SEA", "BLR"), r("LAX", "HAN"), r("SFO", "HAN"), r("LAX", "SGN"), r("SFO", "SGN", true), r("JFK", "SGN"), r("SEA", "SGN"),
  // ── Oceania ─────────────────────────────────────────────────────────────
  r("LAX", "SYD", true), r("SFO", "SYD", true), r("DFW", "SYD"), r("JFK", "SYD"), r("HNL", "SYD"), r("SEA", "SYD"), r("IAH", "SYD"), r("LAX", "MEL", true), r("SFO", "MEL"), r("DFW", "MEL"), r("LAX", "BNE"), r("SFO", "BNE"), r("DFW", "BNE"), r("LAX", "AKL", true), r("SFO", "AKL"), r("IAH", "AKL"), r("ORD", "AKL"), r("JFK", "AKL"), r("HNL", "AKL"), r("LAX", "NAN", true), r("SFO", "NAN"), r("DFW", "NAN"), r("HNL", "NAN"), r("LAX", "PPT"), r("SFO", "PPT"), r("SEA", "PPT"),
];

/* ─────────────────────────────── Helpers ─────────────────────────────── */

export function routeKey(origin: string, destination: string): string {
  return `${origin}-${destination}`;
}

export const POPULAR_ROUTES: RouteDef[] = ROUTES.filter((r) => r.popular);
export const DOMESTIC_ROUTES: RouteDef[] = ROUTES.filter((r) => r.category === "domestic");
export const INTERNATIONAL_ROUTES: RouteDef[] = ROUTES.filter((r) => r.category === "international");

function reverse(r: RouteDef): RouteDef {
  return { ...r, origin: r.destination, destination: r.origin };
}

/** Every route plus its reverse, de-duplicated. */
export const ALL_DIRECTIONAL_ROUTES: RouteDef[] = (() => {
  const seen = new Set<string>();
  const out: RouteDef[] = [];
  for (const r of ROUTES) {
    for (const x of [r, reverse(r)]) {
      const k = routeKey(x.origin, x.destination);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(x);
    }
  }
  return out;
})();

const byOrigin = new Map<string, RouteDef[]>();
const byDestination = new Map<string, RouteDef[]>();
for (const r of ALL_DIRECTIONAL_ROUTES) {
  byOrigin.set(r.origin, [...(byOrigin.get(r.origin) ?? []), r]);
  byDestination.set(r.destination, [...(byDestination.get(r.destination) ?? []), r]);
}

/** Routes departing an airport (both directions of the curated list considered). */
export function getRoutesFrom(iata: string): RouteDef[] {
  return byOrigin.get(iata.toUpperCase()) ?? [];
}

/** Routes arriving at an airport. */
export function getRoutesTo(iata: string): RouteDef[] {
  return byDestination.get(iata.toUpperCase()) ?? [];
}

export function isKnownRoute(origin: string, destination: string): boolean {
  return getRoutesFrom(origin).some((r) => r.destination === destination.toUpperCase());
}
