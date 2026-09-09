/**
 * Airport dataset for Air1 Tickets.
 *
 * Coverage: every US commercial airport with roughly 1M+ annual enplanements
 * (plus a few smaller ones so every state is represented), the US territories,
 * Canada, Mexico, the Caribbean, Central and South America, and the main
 * long-haul gateways in Europe, the Middle East, Africa, Asia and Oceania.
 *
 * Conventions
 *  - `city` is the passenger-facing city name shown in search results.
 *  - `metro` is set only when 2+ airports in this file share a metro area.
 *  - `size` 5 = mega hub … 1 = regional; it drives frequency in the mock engine.
 *  - `tz` is the IANA zone of the airport itself (Arizona, Indiana, Kentucky and
 *    Michigan airports are deliberately not on the "obvious" zone).
 *  - Coordinates are decimal degrees at the terminal / reference point.
 */
import type { Airport } from "@/lib/flights/types";

const US = { country: "United States", countryCode: "US" } as const;

export const AIRPORTS: Airport[] = [
  /* ───────────────────────────── US Northeast ───────────────────────────── */
  { iata: "JFK", icao: "KJFK", name: "John F. Kennedy International Airport", city: "New York", metro: "NYC", state: "NY", ...US, lat: 40.6413, lon: -73.7781, tz: "America/New_York", size: 5, keywords: ["New York City", "NYC", "Kennedy", "Queens", "Manhattan", "Brooklyn"] },
  { iata: "LGA", icao: "KLGA", name: "LaGuardia Airport", city: "New York", metro: "NYC", state: "NY", ...US, lat: 40.7769, lon: -73.874, tz: "America/New_York", size: 4, keywords: ["New York City", "NYC", "La Guardia", "Queens", "Manhattan", "Bronx"] },
  { iata: "EWR", icao: "KEWR", name: "Newark Liberty International Airport", city: "Newark", metro: "NYC", state: "NJ", ...US, lat: 40.6895, lon: -74.1745, tz: "America/New_York", size: 5, keywords: ["New York", "New York City", "NYC", "New Jersey", "Manhattan", "Jersey City"] },
  { iata: "BOS", icao: "KBOS", name: "Boston Logan International Airport", city: "Boston", state: "MA", ...US, lat: 42.3656, lon: -71.0096, tz: "America/New_York", size: 4, keywords: ["Logan", "Massachusetts", "Cambridge", "New England"] },
  { iata: "PHL", icao: "KPHL", name: "Philadelphia International Airport", city: "Philadelphia", state: "PA", ...US, lat: 39.8744, lon: -75.2424, tz: "America/New_York", size: 4, keywords: ["Philly", "Pennsylvania", "South Jersey"] },
  { iata: "PIT", icao: "KPIT", name: "Pittsburgh International Airport", city: "Pittsburgh", state: "PA", ...US, lat: 40.4915, lon: -80.2329, tz: "America/New_York", size: 3, keywords: ["Pennsylvania", "Steel City"] },
  { iata: "BWI", icao: "KBWI", name: "Baltimore/Washington International Thurgood Marshall Airport", city: "Baltimore", metro: "WAS", state: "MD", ...US, lat: 39.1774, lon: -76.6684, tz: "America/New_York", size: 4, keywords: ["Washington", "Washington DC", "DC", "Maryland", "Thurgood Marshall", "Annapolis"] },
  { iata: "IAD", icao: "KIAD", name: "Washington Dulles International Airport", city: "Washington", metro: "WAS", state: "VA", ...US, lat: 38.9531, lon: -77.4565, tz: "America/New_York", size: 4, keywords: ["Washington DC", "DC", "Dulles", "Northern Virginia", "Reston", "Herndon"] },
  { iata: "DCA", icao: "KDCA", name: "Ronald Reagan Washington National Airport", city: "Washington", metro: "WAS", state: "VA", ...US, lat: 38.8521, lon: -77.0377, tz: "America/New_York", size: 4, keywords: ["Washington DC", "DC", "Reagan", "National", "Arlington", "Alexandria"] },
  { iata: "BDL", icao: "KBDL", name: "Bradley International Airport", city: "Hartford", state: "CT", ...US, lat: 41.9389, lon: -72.6832, tz: "America/New_York", size: 3, keywords: ["Connecticut", "Windsor Locks", "Springfield", "New Haven"] },
  { iata: "PVD", icao: "KPVD", name: "Rhode Island T. F. Green International Airport", city: "Providence", state: "RI", ...US, lat: 41.724, lon: -71.4283, tz: "America/New_York", size: 3, keywords: ["Rhode Island", "Warwick", "T.F. Green", "Newport"] },
  { iata: "BUF", icao: "KBUF", name: "Buffalo Niagara International Airport", city: "Buffalo", state: "NY", ...US, lat: 42.9405, lon: -78.7322, tz: "America/New_York", size: 3, keywords: ["Niagara Falls", "Western New York", "Cheektowaga"] },
  { iata: "ALB", icao: "KALB", name: "Albany International Airport", city: "Albany", state: "NY", ...US, lat: 42.7483, lon: -73.8017, tz: "America/New_York", size: 2, keywords: ["Capital Region", "Upstate New York", "Saratoga Springs"] },
  { iata: "ROC", icao: "KROC", name: "Frederick Douglass Greater Rochester International Airport", city: "Rochester", state: "NY", ...US, lat: 43.1189, lon: -77.6724, tz: "America/New_York", size: 2, keywords: ["Upstate New York", "Finger Lakes"] },
  { iata: "SYR", icao: "KSYR", name: "Syracuse Hancock International Airport", city: "Syracuse", state: "NY", ...US, lat: 43.1112, lon: -76.1063, tz: "America/New_York", size: 2, keywords: ["Upstate New York", "Central New York"] },
  { iata: "MHT", icao: "KMHT", name: "Manchester-Boston Regional Airport", city: "Manchester", state: "NH", ...US, lat: 42.9326, lon: -71.4357, tz: "America/New_York", size: 1, keywords: ["New Hampshire", "Boston", "Nashua"] },
  { iata: "PWM", icao: "KPWM", name: "Portland International Jetport", city: "Portland", state: "ME", ...US, lat: 43.6462, lon: -70.3093, tz: "America/New_York", size: 2, keywords: ["Maine", "Portland Maine", "Jetport"] },
  { iata: "BTV", icao: "KBTV", name: "Patrick Leahy Burlington International Airport", city: "Burlington", state: "VT", ...US, lat: 44.4719, lon: -73.1533, tz: "America/New_York", size: 1, keywords: ["Vermont", "South Burlington", "Lake Champlain"] },

  /* ───────────────────────────── US Southeast ───────────────────────────── */
  { iata: "ATL", icao: "KATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", state: "GA", ...US, lat: 33.6407, lon: -84.4277, tz: "America/New_York", size: 5, keywords: ["Hartsfield", "Georgia", "Hartsfield-Jackson"] },
  { iata: "CLT", icao: "KCLT", name: "Charlotte Douglas International Airport", city: "Charlotte", state: "NC", ...US, lat: 35.214, lon: -80.9431, tz: "America/New_York", size: 5, keywords: ["North Carolina", "Douglas", "Queen City"] },
  { iata: "MIA", icao: "KMIA", name: "Miami International Airport", city: "Miami", metro: "MIA", state: "FL", ...US, lat: 25.7959, lon: -80.287, tz: "America/New_York", size: 5, keywords: ["South Florida", "Miami Beach", "South Beach", "Coral Gables", "Florida"] },
  { iata: "FLL", icao: "KFLL", name: "Fort Lauderdale-Hollywood International Airport", city: "Fort Lauderdale", metro: "MIA", state: "FL", ...US, lat: 26.0742, lon: -80.1506, tz: "America/New_York", size: 4, keywords: ["Miami", "South Florida", "Hollywood", "Ft Lauderdale", "Boca Raton", "Florida"] },
  { iata: "MCO", icao: "KMCO", name: "Orlando International Airport", city: "Orlando", state: "FL", ...US, lat: 28.4312, lon: -81.3081, tz: "America/New_York", size: 5, keywords: ["Disney World", "Walt Disney World", "Universal", "Kissimmee", "Central Florida", "Florida"] },
  { iata: "TPA", icao: "KTPA", name: "Tampa International Airport", city: "Tampa", state: "FL", ...US, lat: 27.9755, lon: -82.5332, tz: "America/New_York", size: 4, keywords: ["Tampa Bay", "St. Petersburg", "Clearwater", "Florida"] },
  { iata: "RSW", icao: "KRSW", name: "Southwest Florida International Airport", city: "Fort Myers", state: "FL", ...US, lat: 26.5362, lon: -81.7552, tz: "America/New_York", size: 4, keywords: ["Ft Myers", "Naples", "Cape Coral", "Sanibel", "Southwest Florida", "Florida"] },
  { iata: "PBI", icao: "KPBI", name: "Palm Beach International Airport", city: "West Palm Beach", state: "FL", ...US, lat: 26.6832, lon: -80.0956, tz: "America/New_York", size: 3, keywords: ["Palm Beach", "Boca Raton", "DJT", "Trump International", "Jupiter", "Florida"] },
  { iata: "JAX", icao: "KJAX", name: "Jacksonville International Airport", city: "Jacksonville", state: "FL", ...US, lat: 30.4941, lon: -81.6879, tz: "America/New_York", size: 3, keywords: ["Northeast Florida", "St. Augustine", "Amelia Island", "Florida"] },
  { iata: "SFB", icao: "KSFB", name: "Orlando Sanford International Airport", city: "Sanford", state: "FL", ...US, lat: 28.7776, lon: -81.2375, tz: "America/New_York", size: 2, keywords: ["Orlando", "Orlando Sanford", "Central Florida", "Florida"] },
  { iata: "PIE", icao: "KPIE", name: "St. Pete-Clearwater International Airport", city: "St. Petersburg", state: "FL", ...US, lat: 27.9102, lon: -82.6874, tz: "America/New_York", size: 2, keywords: ["Clearwater", "Tampa Bay", "Saint Petersburg", "Florida"] },
  { iata: "SRQ", icao: "KSRQ", name: "Sarasota Bradenton International Airport", city: "Sarasota", state: "FL", ...US, lat: 27.3954, lon: -82.5544, tz: "America/New_York", size: 3, keywords: ["Bradenton", "Siesta Key", "Gulf Coast", "Florida"] },
  { iata: "PNS", icao: "KPNS", name: "Pensacola International Airport", city: "Pensacola", state: "FL", ...US, lat: 30.4734, lon: -87.1866, tz: "America/Chicago", size: 2, keywords: ["Florida Panhandle", "Gulf Coast", "Florida"] },
  { iata: "VPS", icao: "KVPS", name: "Destin-Fort Walton Beach Airport", city: "Destin", state: "FL", ...US, lat: 30.4832, lon: -86.5254, tz: "America/Chicago", size: 2, keywords: ["Fort Walton Beach", "Emerald Coast", "Florida Panhandle", "Eglin", "Florida"] },
  { iata: "EYW", icao: "KEYW", name: "Key West International Airport", city: "Key West", state: "FL", ...US, lat: 24.5561, lon: -81.7596, tz: "America/New_York", size: 1, keywords: ["Florida Keys", "The Keys", "Florida"] },
  { iata: "RDU", icao: "KRDU", name: "Raleigh-Durham International Airport", city: "Raleigh", state: "NC", ...US, lat: 35.8776, lon: -78.7875, tz: "America/New_York", size: 4, keywords: ["Durham", "Chapel Hill", "Research Triangle", "North Carolina"] },
  { iata: "GSO", icao: "KGSO", name: "Piedmont Triad International Airport", city: "Greensboro", state: "NC", ...US, lat: 36.0978, lon: -79.9373, tz: "America/New_York", size: 2, keywords: ["Winston-Salem", "High Point", "Triad", "North Carolina"] },
  { iata: "AVL", icao: "KAVL", name: "Asheville Regional Airport", city: "Asheville", state: "NC", ...US, lat: 35.4362, lon: -82.5418, tz: "America/New_York", size: 2, keywords: ["Blue Ridge", "Western North Carolina", "North Carolina"] },
  { iata: "SAV", icao: "KSAV", name: "Savannah/Hilton Head International Airport", city: "Savannah", state: "GA", ...US, lat: 32.1276, lon: -81.2021, tz: "America/New_York", size: 3, keywords: ["Hilton Head", "Georgia", "Tybee Island"] },
  { iata: "CHS", icao: "KCHS", name: "Charleston International Airport", city: "Charleston", state: "SC", ...US, lat: 32.8986, lon: -80.0405, tz: "America/New_York", size: 3, keywords: ["South Carolina", "Lowcountry", "Kiawah", "North Charleston"] },
  { iata: "MYR", icao: "KMYR", name: "Myrtle Beach International Airport", city: "Myrtle Beach", state: "SC", ...US, lat: 33.6797, lon: -78.9283, tz: "America/New_York", size: 2, keywords: ["Grand Strand", "South Carolina"] },
  { iata: "GSP", icao: "KGSP", name: "Greenville-Spartanburg International Airport", city: "Greenville", state: "SC", ...US, lat: 34.8957, lon: -82.2189, tz: "America/New_York", size: 2, keywords: ["Spartanburg", "Upstate South Carolina", "South Carolina"] },
  { iata: "BNA", icao: "KBNA", name: "Nashville International Airport", city: "Nashville", state: "TN", ...US, lat: 36.1263, lon: -86.6774, tz: "America/Chicago", size: 4, keywords: ["Music City", "Tennessee", "Franklin"] },
  { iata: "MEM", icao: "KMEM", name: "Memphis International Airport", city: "Memphis", state: "TN", ...US, lat: 35.0424, lon: -89.9767, tz: "America/Chicago", size: 3, keywords: ["Tennessee", "Graceland"] },
  { iata: "TYS", icao: "KTYS", name: "McGhee Tyson Airport", city: "Knoxville", state: "TN", ...US, lat: 35.811, lon: -83.994, tz: "America/New_York", size: 2, keywords: ["Tennessee", "Great Smoky Mountains", "Gatlinburg", "Pigeon Forge"] },
  { iata: "SDF", icao: "KSDF", name: "Louisville Muhammad Ali International Airport", city: "Louisville", state: "KY", ...US, lat: 38.1744, lon: -85.736, tz: "America/Kentucky/Louisville", size: 3, keywords: ["Kentucky", "Muhammad Ali", "Standiford Field"] },
  { iata: "CVG", icao: "KCVG", name: "Cincinnati/Northern Kentucky International Airport", city: "Cincinnati", state: "KY", ...US, lat: 39.0488, lon: -84.6678, tz: "America/New_York", size: 3, keywords: ["Northern Kentucky", "Hebron", "Covington", "Ohio", "Kentucky"] },
  { iata: "BHM", icao: "KBHM", name: "Birmingham-Shuttlesworth International Airport", city: "Birmingham", state: "AL", ...US, lat: 33.5629, lon: -86.7535, tz: "America/Chicago", size: 2, keywords: ["Alabama", "Shuttlesworth"] },
  { iata: "MSY", icao: "KMSY", name: "Louis Armstrong New Orleans International Airport", city: "New Orleans", state: "LA", ...US, lat: 29.9934, lon: -90.258, tz: "America/Chicago", size: 4, keywords: ["NOLA", "Louisiana", "French Quarter", "Kenner", "Big Easy"] },
  { iata: "LIT", icao: "KLIT", name: "Bill and Hillary Clinton National Airport", city: "Little Rock", state: "AR", ...US, lat: 34.7294, lon: -92.2243, tz: "America/Chicago", size: 2, keywords: ["Arkansas", "Adams Field"] },
  { iata: "XNA", icao: "KXNA", name: "Northwest Arkansas National Airport", city: "Fayetteville", state: "AR", ...US, lat: 36.2819, lon: -94.3068, tz: "America/Chicago", size: 2, keywords: ["Bentonville", "Rogers", "Springdale", "Northwest Arkansas", "Arkansas"] },
  { iata: "JAN", icao: "KJAN", name: "Jackson-Medgar Wiley Evers International Airport", city: "Jackson", state: "MS", ...US, lat: 32.3112, lon: -90.0759, tz: "America/Chicago", size: 1, keywords: ["Mississippi", "Medgar Evers"] },
  { iata: "CRW", icao: "KCRW", name: "West Virginia International Yeager Airport", city: "Charleston", state: "WV", ...US, lat: 38.3731, lon: -81.5932, tz: "America/New_York", size: 1, keywords: ["West Virginia", "Yeager"] },
  { iata: "RIC", icao: "KRIC", name: "Richmond International Airport", city: "Richmond", state: "VA", ...US, lat: 37.5052, lon: -77.3197, tz: "America/New_York", size: 3, keywords: ["Virginia", "Central Virginia"] },
  { iata: "ORF", icao: "KORF", name: "Norfolk International Airport", city: "Norfolk", state: "VA", ...US, lat: 36.8946, lon: -76.2012, tz: "America/New_York", size: 3, keywords: ["Virginia Beach", "Hampton Roads", "Chesapeake", "Virginia"] },
  { iata: "SJU", icao: "TJSJ", name: "Luis Muñoz Marín International Airport", city: "San Juan", state: "PR", ...US, lat: 18.4394, lon: -66.0018, tz: "America/Puerto_Rico", size: 4, keywords: ["Puerto Rico", "Carolina", "Old San Juan", "Condado", "Isla Verde"] },
  { iata: "BQN", icao: "TJBQ", name: "Rafael Hernández International Airport", city: "Aguadilla", state: "PR", ...US, lat: 18.4949, lon: -67.1294, tz: "America/Puerto_Rico", size: 1, keywords: ["Puerto Rico", "Rincon", "Rincón", "West Puerto Rico"] },
  { iata: "STT", icao: "TIST", name: "Cyril E. King Airport", city: "St. Thomas", state: "VI", ...US, lat: 18.3373, lon: -64.9734, tz: "America/St_Thomas", size: 2, keywords: ["US Virgin Islands", "USVI", "Charlotte Amalie", "Saint Thomas", "St. John", "Virgin Islands"] },
  { iata: "STX", icao: "TISX", name: "Henry E. Rohlsen Airport", city: "St. Croix", state: "VI", ...US, lat: 17.7019, lon: -64.7986, tz: "America/St_Thomas", size: 1, keywords: ["US Virgin Islands", "USVI", "Christiansted", "Saint Croix", "Virgin Islands"] },

  /* ───────────────────────────── US Midwest ─────────────────────────────── */
  { iata: "ORD", icao: "KORD", name: "O'Hare International Airport", city: "Chicago", metro: "CHI", state: "IL", ...US, lat: 41.9742, lon: -87.9073, tz: "America/Chicago", size: 5, keywords: ["OHare", "O Hare", "Illinois", "Chicagoland", "Windy City"] },
  { iata: "MDW", icao: "KMDW", name: "Chicago Midway International Airport", city: "Chicago", metro: "CHI", state: "IL", ...US, lat: 41.7868, lon: -87.7522, tz: "America/Chicago", size: 4, keywords: ["Midway", "Illinois", "Chicagoland", "South Side"] },
  { iata: "DTW", icao: "KDTW", name: "Detroit Metropolitan Wayne County Airport", city: "Detroit", state: "MI", ...US, lat: 42.2124, lon: -83.3534, tz: "America/Detroit", size: 4, keywords: ["Michigan", "Romulus", "Ann Arbor", "Motor City", "Detroit Metro"] },
  { iata: "GRR", icao: "KGRR", name: "Gerald R. Ford International Airport", city: "Grand Rapids", state: "MI", ...US, lat: 42.8808, lon: -85.5228, tz: "America/Detroit", size: 2, keywords: ["Michigan", "West Michigan", "Gerald Ford"] },
  { iata: "MSP", icao: "KMSP", name: "Minneapolis-Saint Paul International Airport", city: "Minneapolis", state: "MN", ...US, lat: 44.8848, lon: -93.2223, tz: "America/Chicago", size: 4, keywords: ["St. Paul", "Saint Paul", "Twin Cities", "Minnesota", "Bloomington"] },
  { iata: "STL", icao: "KSTL", name: "St. Louis Lambert International Airport", city: "St. Louis", state: "MO", ...US, lat: 38.7499, lon: -90.3748, tz: "America/Chicago", size: 4, keywords: ["Saint Louis", "Lambert", "Missouri"] },
  { iata: "MCI", icao: "KMCI", name: "Kansas City International Airport", city: "Kansas City", state: "MO", ...US, lat: 39.2976, lon: -94.7139, tz: "America/Chicago", size: 4, keywords: ["KC", "Missouri", "Kansas", "Overland Park"] },
  { iata: "IND", icao: "KIND", name: "Indianapolis International Airport", city: "Indianapolis", state: "IN", ...US, lat: 39.7173, lon: -86.2944, tz: "America/Indiana/Indianapolis", size: 3, keywords: ["Indy", "Indiana", "Carmel"] },
  { iata: "CLE", icao: "KCLE", name: "Cleveland Hopkins International Airport", city: "Cleveland", state: "OH", ...US, lat: 41.4117, lon: -81.8498, tz: "America/New_York", size: 3, keywords: ["Hopkins", "Ohio", "Akron", "Northeast Ohio"] },
  { iata: "CMH", icao: "KCMH", name: "John Glenn Columbus International Airport", city: "Columbus", state: "OH", ...US, lat: 39.998, lon: -82.8919, tz: "America/New_York", size: 3, keywords: ["John Glenn", "Ohio", "Central Ohio"] },
  { iata: "MKE", icao: "KMKE", name: "Milwaukee Mitchell International Airport", city: "Milwaukee", state: "WI", ...US, lat: 42.9472, lon: -87.8966, tz: "America/Chicago", size: 3, keywords: ["Wisconsin", "Mitchell", "General Mitchell"] },
  { iata: "MSN", icao: "KMSN", name: "Dane County Regional Airport", city: "Madison", state: "WI", ...US, lat: 43.1399, lon: -89.3375, tz: "America/Chicago", size: 2, keywords: ["Wisconsin", "Dane County"] },
  { iata: "OMA", icao: "KOMA", name: "Eppley Airfield", city: "Omaha", state: "NE", ...US, lat: 41.3032, lon: -95.8941, tz: "America/Chicago", size: 3, keywords: ["Nebraska", "Eppley", "Council Bluffs", "Lincoln"] },
  { iata: "DSM", icao: "KDSM", name: "Des Moines International Airport", city: "Des Moines", state: "IA", ...US, lat: 41.534, lon: -93.6631, tz: "America/Chicago", size: 2, keywords: ["Iowa", "Central Iowa"] },
  { iata: "ICT", icao: "KICT", name: "Wichita Dwight D. Eisenhower National Airport", city: "Wichita", state: "KS", ...US, lat: 37.6499, lon: -97.4331, tz: "America/Chicago", size: 1, keywords: ["Kansas", "Eisenhower"] },
  { iata: "FAR", icao: "KFAR", name: "Hector International Airport", city: "Fargo", state: "ND", ...US, lat: 46.9207, lon: -96.8158, tz: "America/Chicago", size: 1, keywords: ["North Dakota", "Moorhead", "Hector"] },
  { iata: "FSD", icao: "KFSD", name: "Sioux Falls Regional Airport", city: "Sioux Falls", state: "SD", ...US, lat: 43.582, lon: -96.7419, tz: "America/Chicago", size: 1, keywords: ["South Dakota", "Joe Foss Field"] },

  /* ─────────────────────── US Southwest & Mountain West ─────────────────── */
  { iata: "DFW", icao: "KDFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", metro: "DAL", state: "TX", ...US, lat: 32.8998, lon: -97.0403, tz: "America/Chicago", size: 5, keywords: ["Fort Worth", "Ft Worth", "DFW", "Texas", "Metroplex", "Arlington", "Plano", "Irving"] },
  { iata: "DAL", icao: "KDAL", name: "Dallas Love Field", city: "Dallas", metro: "DAL", state: "TX", ...US, lat: 32.8471, lon: -96.8518, tz: "America/Chicago", size: 4, keywords: ["Love Field", "Texas", "Fort Worth", "Metroplex", "Uptown Dallas"] },
  { iata: "IAH", icao: "KIAH", name: "George Bush Intercontinental Airport", city: "Houston", metro: "HOU", state: "TX", ...US, lat: 29.9902, lon: -95.3368, tz: "America/Chicago", size: 5, keywords: ["Bush Intercontinental", "Intercontinental", "Texas", "The Woodlands", "Space City"] },
  { iata: "HOU", icao: "KHOU", name: "William P. Hobby Airport", city: "Houston", metro: "HOU", state: "TX", ...US, lat: 29.6454, lon: -95.2789, tz: "America/Chicago", size: 4, keywords: ["Hobby", "Texas", "Galveston", "Space City"] },
  { iata: "AUS", icao: "KAUS", name: "Austin-Bergstrom International Airport", city: "Austin", state: "TX", ...US, lat: 30.1975, lon: -97.6664, tz: "America/Chicago", size: 4, keywords: ["Bergstrom", "Texas", "Hill Country", "Round Rock", "ATX"] },
  { iata: "SAT", icao: "KSAT", name: "San Antonio International Airport", city: "San Antonio", state: "TX", ...US, lat: 29.5337, lon: -98.4698, tz: "America/Chicago", size: 4, keywords: ["Texas", "Alamo", "River Walk", "Hill Country"] },
  { iata: "ELP", icao: "KELP", name: "El Paso International Airport", city: "El Paso", state: "TX", ...US, lat: 31.8072, lon: -106.3776, tz: "America/Denver", size: 2, keywords: ["Texas", "Ciudad Juarez", "Las Cruces", "Fort Bliss"] },
  { iata: "OKC", icao: "KOKC", name: "OKC Will Rogers International Airport", city: "Oklahoma City", state: "OK", ...US, lat: 35.3931, lon: -97.6007, tz: "America/Chicago", size: 3, keywords: ["Oklahoma", "Will Rogers", "Will Rogers World Airport", "Norman"] },
  { iata: "TUL", icao: "KTUL", name: "Tulsa International Airport", city: "Tulsa", state: "OK", ...US, lat: 36.1984, lon: -95.8881, tz: "America/Chicago", size: 2, keywords: ["Oklahoma", "Green Country"] },
  { iata: "PHX", icao: "KPHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", state: "AZ", ...US, lat: 33.4373, lon: -112.0078, tz: "America/Phoenix", size: 5, keywords: ["Sky Harbor", "Arizona", "Scottsdale", "Tempe", "Mesa", "Valley of the Sun"] },
  { iata: "TUS", icao: "KTUS", name: "Tucson International Airport", city: "Tucson", state: "AZ", ...US, lat: 32.1161, lon: -110.941, tz: "America/Phoenix", size: 2, keywords: ["Arizona", "Southern Arizona", "Sonoran Desert"] },
  { iata: "ABQ", icao: "KABQ", name: "Albuquerque International Sunport", city: "Albuquerque", state: "NM", ...US, lat: 35.0402, lon: -106.609, tz: "America/Denver", size: 3, keywords: ["New Mexico", "Sunport", "Santa Fe"] },
  { iata: "DEN", icao: "KDEN", name: "Denver International Airport", city: "Denver", state: "CO", ...US, lat: 39.8561, lon: -104.6737, tz: "America/Denver", size: 5, keywords: ["Colorado", "DIA", "Mile High", "Boulder", "Aurora", "Rocky Mountains"] },
  { iata: "COS", icao: "KCOS", name: "Colorado Springs Airport", city: "Colorado Springs", state: "CO", ...US, lat: 38.8058, lon: -104.7008, tz: "America/Denver", size: 2, keywords: ["Colorado", "Pikes Peak", "Air Force Academy"] },
  { iata: "SLC", icao: "KSLC", name: "Salt Lake City International Airport", city: "Salt Lake City", state: "UT", ...US, lat: 40.7899, lon: -111.9791, tz: "America/Denver", size: 4, keywords: ["Utah", "SLC", "Park City", "Wasatch", "Provo"] },
  { iata: "LAS", icao: "KLAS", name: "Harry Reid International Airport", city: "Las Vegas", state: "NV", ...US, lat: 36.084, lon: -115.1537, tz: "America/Los_Angeles", size: 5, keywords: ["Vegas", "Nevada", "The Strip", "McCarran", "Henderson", "Paradise"] },
  { iata: "RNO", icao: "KRNO", name: "Reno-Tahoe International Airport", city: "Reno", state: "NV", ...US, lat: 39.4991, lon: -119.7681, tz: "America/Los_Angeles", size: 3, keywords: ["Lake Tahoe", "Tahoe", "Nevada", "Sparks", "Carson City"] },

  /* ─────────────────────────────── US West ──────────────────────────────── */
  { iata: "LAX", icao: "KLAX", name: "Los Angeles International Airport", city: "Los Angeles", metro: "LAX", state: "CA", ...US, lat: 33.9416, lon: -118.4085, tz: "America/Los_Angeles", size: 5, keywords: ["LA", "L.A.", "Hollywood", "Santa Monica", "Beverly Hills", "Southern California", "SoCal", "California"] },
  { iata: "BUR", icao: "KBUR", name: "Hollywood Burbank Airport", city: "Burbank", metro: "LAX", state: "CA", ...US, lat: 34.2007, lon: -118.3587, tz: "America/Los_Angeles", size: 3, keywords: ["Los Angeles", "Hollywood", "Bob Hope", "San Fernando Valley", "Pasadena", "Glendale", "California"] },
  { iata: "LGB", icao: "KLGB", name: "Long Beach Airport", city: "Long Beach", metro: "LAX", state: "CA", ...US, lat: 33.8177, lon: -118.1516, tz: "America/Los_Angeles", size: 2, keywords: ["Los Angeles", "Orange County", "South Bay", "California"] },
  { iata: "SNA", icao: "KSNA", name: "John Wayne Airport, Orange County", city: "Santa Ana", metro: "LAX", state: "CA", ...US, lat: 33.6762, lon: -117.8675, tz: "America/Los_Angeles", size: 4, keywords: ["Orange County", "John Wayne", "Irvine", "Anaheim", "Disneyland", "Newport Beach", "Los Angeles", "California"] },
  { iata: "ONT", icao: "KONT", name: "Ontario International Airport", city: "Ontario", metro: "LAX", state: "CA", ...US, lat: 34.056, lon: -117.6012, tz: "America/Los_Angeles", size: 3, keywords: ["Inland Empire", "Riverside", "San Bernardino", "Los Angeles", "California"] },
  { iata: "SFO", icao: "KSFO", name: "San Francisco International Airport", city: "San Francisco", metro: "BAY", state: "CA", ...US, lat: 37.6213, lon: -122.379, tz: "America/Los_Angeles", size: 5, keywords: ["Bay Area", "SF", "Silicon Valley", "Peninsula", "Northern California", "California"] },
  { iata: "OAK", icao: "KOAK", name: "Oakland San Francisco Bay Airport", city: "Oakland", metro: "BAY", state: "CA", ...US, lat: 37.7126, lon: -122.2197, tz: "America/Los_Angeles", size: 4, keywords: ["San Francisco", "Bay Area", "East Bay", "Berkeley", "San Francisco Bay Oakland", "California"] },
  { iata: "SJC", icao: "KSJC", name: "San Jose Mineta International Airport", city: "San Jose", metro: "BAY", state: "CA", ...US, lat: 37.3639, lon: -121.9289, tz: "America/Los_Angeles", size: 4, keywords: ["Silicon Valley", "Bay Area", "Mineta", "San Francisco", "Santa Clara", "Palo Alto", "California"] },
  { iata: "SAN", icao: "KSAN", name: "San Diego International Airport", city: "San Diego", state: "CA", ...US, lat: 32.7338, lon: -117.1933, tz: "America/Los_Angeles", size: 4, keywords: ["Lindbergh Field", "La Jolla", "Southern California", "California"] },
  { iata: "SMF", icao: "KSMF", name: "Sacramento International Airport", city: "Sacramento", state: "CA", ...US, lat: 38.6954, lon: -121.5908, tz: "America/Los_Angeles", size: 4, keywords: ["Northern California", "Davis", "Lake Tahoe", "California"] },
  { iata: "PSP", icao: "KPSP", name: "Palm Springs International Airport", city: "Palm Springs", state: "CA", ...US, lat: 33.8297, lon: -116.5067, tz: "America/Los_Angeles", size: 2, keywords: ["Coachella Valley", "Palm Desert", "Coachella", "California"] },
  { iata: "FAT", icao: "KFAT", name: "Fresno Yosemite International Airport", city: "Fresno", state: "CA", ...US, lat: 36.7762, lon: -119.7181, tz: "America/Los_Angeles", size: 2, keywords: ["Yosemite", "Central Valley", "California"] },
  { iata: "SEA", icao: "KSEA", name: "Seattle-Tacoma International Airport", city: "Seattle", state: "WA", ...US, lat: 47.4502, lon: -122.3088, tz: "America/Los_Angeles", size: 5, keywords: ["Sea-Tac", "SeaTac", "Tacoma", "Washington", "Bellevue", "Puget Sound", "Pacific Northwest"] },
  { iata: "GEG", icao: "KGEG", name: "Spokane International Airport", city: "Spokane", state: "WA", ...US, lat: 47.6199, lon: -117.5339, tz: "America/Los_Angeles", size: 3, keywords: ["Washington", "Inland Northwest", "Coeur d'Alene"] },
  { iata: "PDX", icao: "KPDX", name: "Portland International Airport", city: "Portland", state: "OR", ...US, lat: 45.5898, lon: -122.5951, tz: "America/Los_Angeles", size: 4, keywords: ["Oregon", "Portland Oregon", "Vancouver WA", "Pacific Northwest"] },
  { iata: "BOI", icao: "KBOI", name: "Boise Airport", city: "Boise", state: "ID", ...US, lat: 43.5644, lon: -116.2228, tz: "America/Boise", size: 3, keywords: ["Idaho", "Treasure Valley", "Sun Valley"] },
  { iata: "BZN", icao: "KBZN", name: "Bozeman Yellowstone International Airport", city: "Bozeman", state: "MT", ...US, lat: 45.7775, lon: -111.153, tz: "America/Denver", size: 2, keywords: ["Yellowstone", "Montana", "Big Sky", "Belgrade"] },
  { iata: "JAC", icao: "KJAC", name: "Jackson Hole Airport", city: "Jackson", state: "WY", ...US, lat: 43.6073, lon: -110.7377, tz: "America/Denver", size: 1, keywords: ["Jackson Hole", "Wyoming", "Grand Teton", "Yellowstone", "Teton Village"] },

  /* ─────────────────────────── Hawaii, Alaska, Guam ─────────────────────── */
  { iata: "HNL", icao: "PHNL", name: "Daniel K. Inouye International Airport", city: "Honolulu", state: "HI", ...US, lat: 21.3187, lon: -157.9224, tz: "Pacific/Honolulu", size: 4, keywords: ["Hawaii", "Oahu", "Waikiki", "Inouye", "Pearl Harbor"] },
  { iata: "OGG", icao: "PHOG", name: "Kahului Airport", city: "Kahului", state: "HI", ...US, lat: 20.8986, lon: -156.4305, tz: "Pacific/Honolulu", size: 3, keywords: ["Maui", "Hawaii", "Wailea", "Kaanapali", "Lahaina", "Kihei"] },
  { iata: "KOA", icao: "PHKO", name: "Ellison Onizuka Kona International Airport at Keahole", city: "Kailua-Kona", state: "HI", ...US, lat: 19.7388, lon: -156.0456, tz: "Pacific/Honolulu", size: 2, keywords: ["Kona", "Big Island", "Hawaii", "Hawaii Island", "Waikoloa"] },
  { iata: "LIH", icao: "PHLI", name: "Lihue Airport", city: "Lihue", state: "HI", ...US, lat: 21.976, lon: -159.339, tz: "Pacific/Honolulu", size: 2, keywords: ["Kauai", "Hawaii", "Poipu", "Princeville", "Lihu'e"] },
  { iata: "ITO", icao: "PHTO", name: "Hilo International Airport", city: "Hilo", state: "HI", ...US, lat: 19.7203, lon: -155.0485, tz: "Pacific/Honolulu", size: 1, keywords: ["Big Island", "Hawaii", "Hawaii Island", "Volcanoes National Park"] },
  { iata: "ANC", icao: "PANC", name: "Ted Stevens Anchorage International Airport", city: "Anchorage", state: "AK", ...US, lat: 61.1743, lon: -149.9963, tz: "America/Anchorage", size: 3, keywords: ["Alaska", "Ted Stevens", "Denali"] },
  { iata: "FAI", icao: "PAFA", name: "Fairbanks International Airport", city: "Fairbanks", state: "AK", ...US, lat: 64.8151, lon: -147.8561, tz: "America/Anchorage", size: 1, keywords: ["Alaska", "Interior Alaska", "Northern Lights"] },
  { iata: "JNU", icao: "PAJN", name: "Juneau International Airport", city: "Juneau", state: "AK", ...US, lat: 58.355, lon: -134.5763, tz: "America/Juneau", size: 1, keywords: ["Alaska", "Southeast Alaska", "Inside Passage"] },
  { iata: "GUM", icao: "PGUM", name: "Antonio B. Won Pat International Airport", city: "Guam", country: "Guam", countryCode: "GU", lat: 13.4834, lon: 144.796, tz: "Pacific/Guam", size: 2, keywords: ["Guam", "Hagatna", "Hagåtña", "Tumon", "US territory", "Micronesia"] },

  /* ─────────────────────────────── Canada ───────────────────────────────── */
  { iata: "YYZ", icao: "CYYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada", countryCode: "CA", lat: 43.6777, lon: -79.6248, tz: "America/Toronto", size: 4, keywords: ["Pearson", "Ontario", "Mississauga", "GTA"] },
  { iata: "YVR", icao: "CYVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada", countryCode: "CA", lat: 49.1967, lon: -123.1815, tz: "America/Vancouver", size: 4, keywords: ["British Columbia", "BC", "Richmond", "Whistler"] },
  { iata: "YUL", icao: "CYUL", name: "Montréal-Trudeau International Airport", city: "Montreal", country: "Canada", countryCode: "CA", lat: 45.4706, lon: -73.7408, tz: "America/Toronto", size: 4, keywords: ["Montréal", "Quebec", "Trudeau", "Dorval"] },
  { iata: "YYC", icao: "CYYC", name: "Calgary International Airport", city: "Calgary", country: "Canada", countryCode: "CA", lat: 51.1215, lon: -114.0076, tz: "America/Edmonton", size: 3, keywords: ["Alberta", "Banff", "Canadian Rockies"] },
  { iata: "YOW", icao: "CYOW", name: "Ottawa Macdonald-Cartier International Airport", city: "Ottawa", country: "Canada", countryCode: "CA", lat: 45.3225, lon: -75.6692, tz: "America/Toronto", size: 2, keywords: ["Ontario", "Gatineau", "Canadian capital"] },
  { iata: "YEG", icao: "CYEG", name: "Edmonton International Airport", city: "Edmonton", country: "Canada", countryCode: "CA", lat: 53.3097, lon: -113.58, tz: "America/Edmonton", size: 2, keywords: ["Alberta", "Leduc", "Jasper"] },
  { iata: "YHZ", icao: "CYHZ", name: "Halifax Stanfield International Airport", city: "Halifax", country: "Canada", countryCode: "CA", lat: 44.8808, lon: -63.5086, tz: "America/Halifax", size: 2, keywords: ["Nova Scotia", "Stanfield", "Maritimes", "Atlantic Canada"] },
  { iata: "YWG", icao: "CYWG", name: "Winnipeg James Armstrong Richardson International Airport", city: "Winnipeg", country: "Canada", countryCode: "CA", lat: 49.91, lon: -97.2399, tz: "America/Winnipeg", size: 2, keywords: ["Manitoba", "Richardson"] },
  { iata: "YQB", icao: "CYQB", name: "Québec City Jean Lesage International Airport", city: "Quebec City", country: "Canada", countryCode: "CA", lat: 46.7911, lon: -71.3933, tz: "America/Toronto", size: 1, keywords: ["Québec", "Quebec", "Jean Lesage", "Old Quebec"] },

  /* ─────────────────────────────── Mexico ───────────────────────────────── */
  { iata: "MEX", icao: "MMMX", name: "Mexico City International Airport", city: "Mexico City", country: "Mexico", countryCode: "MX", lat: 19.4363, lon: -99.0721, tz: "America/Mexico_City", size: 4, keywords: ["Benito Juarez", "Benito Juárez", "CDMX", "Ciudad de Mexico", "Ciudad de México", "Polanco", "Roma"] },
  { iata: "CUN", icao: "MMUN", name: "Cancún International Airport", city: "Cancun", country: "Mexico", countryCode: "MX", lat: 21.0365, lon: -86.8771, tz: "America/Cancun", size: 4, keywords: ["Cancún", "Riviera Maya", "Playa del Carmen", "Tulum", "Quintana Roo", "Yucatan", "Yucatán"] },
  { iata: "GDL", icao: "MMGL", name: "Guadalajara International Airport", city: "Guadalajara", country: "Mexico", countryCode: "MX", lat: 20.5218, lon: -103.3111, tz: "America/Mexico_City", size: 3, keywords: ["Jalisco", "Miguel Hidalgo", "Tlaquepaque", "Zapopan"] },
  { iata: "MTY", icao: "MMMY", name: "Monterrey International Airport", city: "Monterrey", country: "Mexico", countryCode: "MX", lat: 25.7785, lon: -100.1069, tz: "America/Monterrey", size: 3, keywords: ["Nuevo Leon", "Nuevo León", "Mariano Escobedo", "Apodaca"] },
  { iata: "SJD", icao: "MMSD", name: "Los Cabos International Airport", city: "San Jose del Cabo", country: "Mexico", countryCode: "MX", lat: 23.1518, lon: -109.7215, tz: "America/Mazatlan", size: 3, keywords: ["Cabo", "Los Cabos", "Cabo San Lucas", "San José del Cabo", "Baja California Sur", "Baja"] },
  { iata: "PVR", icao: "MMPR", name: "Puerto Vallarta International Airport", city: "Puerto Vallarta", country: "Mexico", countryCode: "MX", lat: 20.6801, lon: -105.2542, tz: "America/Mexico_City", size: 3, keywords: ["Vallarta", "Gustavo Diaz Ordaz", "Riviera Nayarit", "Nuevo Vallarta", "Sayulita", "Punta Mita", "Jalisco"] },
  { iata: "TIJ", icao: "MMTJ", name: "Tijuana International Airport", city: "Tijuana", country: "Mexico", countryCode: "MX", lat: 32.5411, lon: -116.9701, tz: "America/Tijuana", size: 3, keywords: ["Cross Border Xpress", "CBX", "Baja California", "San Diego", "General Abelardo L. Rodriguez"] },
  { iata: "CZM", icao: "MMCZ", name: "Cozumel International Airport", city: "Cozumel", country: "Mexico", countryCode: "MX", lat: 20.5224, lon: -86.9256, tz: "America/Cancun", size: 2, keywords: ["Quintana Roo", "Riviera Maya", "Playa del Carmen", "scuba"] },
  { iata: "OAX", icao: "MMOX", name: "Oaxaca International Airport", city: "Oaxaca", country: "Mexico", countryCode: "MX", lat: 16.9999, lon: -96.7266, tz: "America/Mexico_City", size: 2, keywords: ["Oaxaca City", "Xoxocotlán", "Xoxocotlan"] },
  { iata: "MID", icao: "MMMD", name: "Mérida International Airport", city: "Merida", country: "Mexico", countryCode: "MX", lat: 20.937, lon: -89.6577, tz: "America/Merida", size: 2, keywords: ["Mérida", "Yucatan", "Yucatán", "Manuel Crescencio Rejon", "Chichen Itza"] },

  /* ────────────────────────────── Caribbean ─────────────────────────────── */
  { iata: "PUJ", icao: "MDPC", name: "Punta Cana International Airport", city: "Punta Cana", country: "Dominican Republic", countryCode: "DO", lat: 18.5674, lon: -68.3634, tz: "America/Santo_Domingo", size: 3, keywords: ["Bavaro", "Bávaro", "Cap Cana", "DR", "Dominican", "La Altagracia"] },
  { iata: "SDQ", icao: "MDSD", name: "Las Américas International Airport", city: "Santo Domingo", country: "Dominican Republic", countryCode: "DO", lat: 18.4297, lon: -69.6689, tz: "America/Santo_Domingo", size: 3, keywords: ["Las Americas", "DR", "Dominican", "Zona Colonial", "Boca Chica"] },
  { iata: "MBJ", icao: "MKJS", name: "Sangster International Airport", city: "Montego Bay", country: "Jamaica", countryCode: "JM", lat: 18.5037, lon: -77.9134, tz: "America/Jamaica", size: 3, keywords: ["MoBay", "Negril", "Ocho Rios", "Sangster"] },
  { iata: "KIN", icao: "MKJP", name: "Norman Manley International Airport", city: "Kingston", country: "Jamaica", countryCode: "JM", lat: 17.9357, lon: -76.7875, tz: "America/Jamaica", size: 2, keywords: ["Norman Manley", "Port Royal"] },
  { iata: "NAS", icao: "MYNN", name: "Lynden Pindling International Airport", city: "Nassau", country: "Bahamas", countryCode: "BS", lat: 25.039, lon: -77.4662, tz: "America/Nassau", size: 3, keywords: ["Bahamas", "Paradise Island", "Atlantis", "New Providence", "Cable Beach"] },
  { iata: "AUA", icao: "TNCA", name: "Queen Beatrix International Airport", city: "Oranjestad", country: "Aruba", countryCode: "AW", lat: 12.5014, lon: -70.0152, tz: "America/Aruba", size: 2, keywords: ["Aruba", "Palm Beach", "Eagle Beach", "One Happy Island", "ABC islands"] },
  { iata: "CUR", icao: "TNCC", name: "Curaçao International Airport", city: "Willemstad", country: "Curaçao", countryCode: "CW", lat: 12.1889, lon: -68.9598, tz: "America/Curacao", size: 2, keywords: ["Curacao", "Hato", "ABC islands", "Dutch Caribbean"] },
  { iata: "SXM", icao: "TNCM", name: "Princess Juliana International Airport", city: "Philipsburg", country: "Sint Maarten", countryCode: "SX", lat: 18.041, lon: -63.1089, tz: "America/Lower_Princes", size: 2, keywords: ["St. Maarten", "St. Martin", "Saint Martin", "Maho Beach", "Anguilla", "St. Barts"] },
  { iata: "GCM", icao: "MWCR", name: "Owen Roberts International Airport", city: "George Town", country: "Cayman Islands", countryCode: "KY", lat: 19.2928, lon: -81.3577, tz: "America/Cayman", size: 2, keywords: ["Grand Cayman", "Cayman", "Seven Mile Beach"] },
  { iata: "PLS", icao: "MBPV", name: "Providenciales International Airport", city: "Providenciales", country: "Turks and Caicos Islands", countryCode: "TC", lat: 21.7736, lon: -72.2659, tz: "America/Grand_Turk", size: 2, keywords: ["Turks and Caicos", "Provo", "Grace Bay", "TCI"] },
  { iata: "BGI", icao: "TBPB", name: "Grantley Adams International Airport", city: "Bridgetown", country: "Barbados", countryCode: "BB", lat: 13.0746, lon: -59.4925, tz: "America/Barbados", size: 2, keywords: ["Barbados", "Christ Church", "Grantley Adams"] },
  { iata: "POS", icao: "TTPP", name: "Piarco International Airport", city: "Port of Spain", country: "Trinidad and Tobago", countryCode: "TT", lat: 10.5954, lon: -61.3372, tz: "America/Port_of_Spain", size: 2, keywords: ["Trinidad", "Piarco", "Tobago", "Carnival"] },
  { iata: "HAV", icao: "MUHA", name: "José Martí International Airport", city: "Havana", country: "Cuba", countryCode: "CU", lat: 22.9892, lon: -82.4091, tz: "America/Havana", size: 2, keywords: ["Jose Marti", "La Habana", "Cuba", "Old Havana"] },

  /* ─────────────────────────── Central America ──────────────────────────── */
  { iata: "PTY", icao: "MPTO", name: "Tocumen International Airport", city: "Panama City", country: "Panama", countryCode: "PA", lat: 9.0714, lon: -79.3835, tz: "America/Panama", size: 4, keywords: ["Tocumen", "Panama", "Panama Canal", "Ciudad de Panama"] },
  { iata: "SJO", icao: "MROC", name: "Juan Santamaría International Airport", city: "San Jose", country: "Costa Rica", countryCode: "CR", lat: 9.9981, lon: -84.2041, tz: "America/Costa_Rica", size: 3, keywords: ["San José", "Juan Santamaria", "Alajuela", "Costa Rica", "Manuel Antonio", "Arenal"] },
  { iata: "LIR", icao: "MRLB", name: "Daniel Oduber Quirós International Airport", city: "Liberia", country: "Costa Rica", countryCode: "CR", lat: 10.5933, lon: -85.5444, tz: "America/Costa_Rica", size: 2, keywords: ["Guanacaste", "Tamarindo", "Papagayo", "Nosara", "Costa Rica"] },
  { iata: "GUA", icao: "MGGT", name: "La Aurora International Airport", city: "Guatemala City", country: "Guatemala", countryCode: "GT", lat: 14.5833, lon: -90.5275, tz: "America/Guatemala", size: 3, keywords: ["La Aurora", "Antigua Guatemala", "Guatemala"] },
  { iata: "SAL", icao: "MSLP", name: "El Salvador International Airport", city: "San Salvador", country: "El Salvador", countryCode: "SV", lat: 13.4409, lon: -89.0557, tz: "America/El_Salvador", size: 3, keywords: ["Monseñor Óscar Arnulfo Romero", "Oscar Romero", "Comalapa", "El Salvador"] },
  { iata: "BZE", icao: "MZBZ", name: "Philip S. W. Goldson International Airport", city: "Belize City", country: "Belize", countryCode: "BZ", lat: 17.5391, lon: -88.3082, tz: "America/Belize", size: 2, keywords: ["Belize", "Goldson", "Ambergris Caye", "San Pedro", "Caye Caulker", "Placencia"] },
  { iata: "RTB", icao: "MHRO", name: "Juan Manuel Gálvez International Airport", city: "Roatan", country: "Honduras", countryCode: "HN", lat: 16.3168, lon: -86.523, tz: "America/Tegucigalpa", size: 1, keywords: ["Roatán", "Bay Islands", "West Bay", "Honduras", "scuba"] },

  /* ───────────────────────────── South America ──────────────────────────── */
  { iata: "BOG", icao: "SKBO", name: "El Dorado International Airport", city: "Bogota", country: "Colombia", countryCode: "CO", lat: 4.7016, lon: -74.1469, tz: "America/Bogota", size: 4, keywords: ["Bogotá", "El Dorado", "Colombia"] },
  { iata: "MDE", icao: "SKRG", name: "José María Córdova International Airport", city: "Medellin", country: "Colombia", countryCode: "CO", lat: 6.1645, lon: -75.4231, tz: "America/Bogota", size: 3, keywords: ["Medellín", "Rionegro", "Jose Maria Cordova", "Colombia", "Antioquia"] },
  { iata: "CTG", icao: "SKCG", name: "Rafael Núñez International Airport", city: "Cartagena", country: "Colombia", countryCode: "CO", lat: 10.4424, lon: -75.513, tz: "America/Bogota", size: 2, keywords: ["Rafael Nunez", "Colombia", "Bocagrande", "Caribbean coast"] },
  { iata: "LIM", icao: "SPJC", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru", countryCode: "PE", lat: -12.0219, lon: -77.1143, tz: "America/Lima", size: 4, keywords: ["Jorge Chavez", "Callao", "Peru", "Miraflores", "Machu Picchu", "Cusco"] },
  { iata: "UIO", icao: "SEQM", name: "Mariscal Sucre International Airport", city: "Quito", country: "Ecuador", countryCode: "EC", lat: -0.1292, lon: -78.3575, tz: "America/Guayaquil", size: 3, keywords: ["Ecuador", "Tababela", "Mariscal Sucre", "Andes"] },
  { iata: "GYE", icao: "SEGU", name: "José Joaquín de Olmedo International Airport", city: "Guayaquil", country: "Ecuador", countryCode: "EC", lat: -2.1574, lon: -79.8837, tz: "America/Guayaquil", size: 2, keywords: ["Ecuador", "Galapagos", "Galápagos", "Jose Joaquin de Olmedo"] },
  { iata: "GRU", icao: "SBGR", name: "São Paulo/Guarulhos International Airport", city: "Sao Paulo", country: "Brazil", countryCode: "BR", lat: -23.4356, lon: -46.4731, tz: "America/Sao_Paulo", size: 4, keywords: ["São Paulo", "Guarulhos", "Brazil", "Brasil", "Sampa"] },
  { iata: "GIG", icao: "SBGL", name: "Rio de Janeiro/Galeão International Airport", city: "Rio de Janeiro", country: "Brazil", countryCode: "BR", lat: -22.81, lon: -43.2506, tz: "America/Sao_Paulo", size: 3, keywords: ["Rio", "Galeão", "Galeao", "Tom Jobim", "Copacabana", "Ipanema", "Brazil"] },
  { iata: "SCL", icao: "SCEL", name: "Arturo Merino Benítez International Airport", city: "Santiago", country: "Chile", countryCode: "CL", lat: -33.393, lon: -70.7858, tz: "America/Santiago", size: 4, keywords: ["Chile", "Santiago de Chile", "Arturo Merino Benitez", "Pudahuel", "Patagonia"] },
  { iata: "EZE", icao: "SAEZ", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina", countryCode: "AR", lat: -34.8222, lon: -58.5358, tz: "America/Argentina/Buenos_Aires", size: 4, keywords: ["Ezeiza", "Argentina", "Palermo", "Recoleta", "Patagonia"] },
  { iata: "MVD", icao: "SUMU", name: "Carrasco International Airport", city: "Montevideo", country: "Uruguay", countryCode: "UY", lat: -34.8384, lon: -56.0308, tz: "America/Montevideo", size: 2, keywords: ["Uruguay", "Carrasco", "Punta del Este"] },

  /* ─────────────────────────────── Europe ───────────────────────────────── */
  { iata: "LHR", icao: "EGLL", name: "London Heathrow Airport", city: "London", metro: "LON", country: "United Kingdom", countryCode: "GB", lat: 51.47, lon: -0.4543, tz: "Europe/London", size: 5, keywords: ["Heathrow", "England", "UK", "Britain", "Great Britain", "Westminster"] },
  { iata: "LGW", icao: "EGKK", name: "London Gatwick Airport", city: "London", metro: "LON", country: "United Kingdom", countryCode: "GB", lat: 51.1537, lon: -0.1821, tz: "Europe/London", size: 4, keywords: ["Gatwick", "England", "UK", "Britain", "Crawley", "Brighton"] },
  { iata: "STN", icao: "EGSS", name: "London Stansted Airport", city: "London", metro: "LON", country: "United Kingdom", countryCode: "GB", lat: 51.886, lon: 0.2389, tz: "Europe/London", size: 3, keywords: ["Stansted", "England", "UK", "Cambridge", "Essex"] },
  { iata: "MAN", icao: "EGCC", name: "Manchester Airport", city: "Manchester", country: "United Kingdom", countryCode: "GB", lat: 53.3537, lon: -2.275, tz: "Europe/London", size: 4, keywords: ["England", "UK", "Liverpool", "Northern England", "Ringway"] },
  { iata: "EDI", icao: "EGPH", name: "Edinburgh Airport", city: "Edinburgh", country: "United Kingdom", countryCode: "GB", lat: 55.9508, lon: -3.3615, tz: "Europe/London", size: 3, keywords: ["Scotland", "UK", "Glasgow", "Highlands"] },
  { iata: "DUB", icao: "EIDW", name: "Dublin Airport", city: "Dublin", country: "Ireland", countryCode: "IE", lat: 53.4213, lon: -6.2701, tz: "Europe/Dublin", size: 4, keywords: ["Ireland", "Eire", "Temple Bar", "US preclearance"] },
  { iata: "SNN", icao: "EINN", name: "Shannon Airport", city: "Shannon", country: "Ireland", countryCode: "IE", lat: 52.7019, lon: -8.9248, tz: "Europe/Dublin", size: 2, keywords: ["Ireland", "Limerick", "Galway", "Cliffs of Moher", "County Clare", "US preclearance"] },
  { iata: "CDG", icao: "LFPG", name: "Paris Charles de Gaulle Airport", city: "Paris", metro: "PAR", country: "France", countryCode: "FR", lat: 49.0097, lon: 2.5479, tz: "Europe/Paris", size: 5, keywords: ["Charles de Gaulle", "Roissy", "France", "Île-de-France", "Ile-de-France"] },
  { iata: "ORY", icao: "LFPO", name: "Paris Orly Airport", city: "Paris", metro: "PAR", country: "France", countryCode: "FR", lat: 48.7262, lon: 2.3652, tz: "Europe/Paris", size: 4, keywords: ["Orly", "France", "Île-de-France", "Ile-de-France"] },
  { iata: "NCE", icao: "LFMN", name: "Nice Côte d'Azur Airport", city: "Nice", country: "France", countryCode: "FR", lat: 43.6584, lon: 7.2159, tz: "Europe/Paris", size: 3, keywords: ["French Riviera", "Cote d'Azur", "Côte d'Azur", "Monaco", "Cannes", "Antibes", "France"] },
  { iata: "AMS", icao: "EHAM", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", countryCode: "NL", lat: 52.3105, lon: 4.7683, tz: "Europe/Amsterdam", size: 5, keywords: ["Schiphol", "Holland", "The Netherlands", "Rotterdam", "The Hague", "Utrecht"] },
  { iata: "BRU", icao: "EBBR", name: "Brussels Airport", city: "Brussels", country: "Belgium", countryCode: "BE", lat: 50.901, lon: 4.4856, tz: "Europe/Brussels", size: 4, keywords: ["Zaventem", "Belgium", "Bruxelles", "Brussel", "Bruges", "Antwerp"] },
  { iata: "FRA", icao: "EDDF", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", countryCode: "DE", lat: 50.0379, lon: 8.5622, tz: "Europe/Berlin", size: 5, keywords: ["Frankfurt am Main", "Germany", "Deutschland", "Rhein-Main", "Hesse"] },
  { iata: "MUC", icao: "EDDM", name: "Munich Airport", city: "Munich", country: "Germany", countryCode: "DE", lat: 48.3538, lon: 11.7861, tz: "Europe/Berlin", size: 4, keywords: ["München", "Munchen", "Bavaria", "Germany", "Franz Josef Strauss", "Oktoberfest"] },
  { iata: "DUS", icao: "EDDL", name: "Düsseldorf Airport", city: "Dusseldorf", country: "Germany", countryCode: "DE", lat: 51.2895, lon: 6.7668, tz: "Europe/Berlin", size: 3, keywords: ["Düsseldorf", "Cologne", "Köln", "Ruhr", "North Rhine-Westphalia", "Germany"] },
  { iata: "BER", icao: "EDDB", name: "Berlin Brandenburg Airport", city: "Berlin", country: "Germany", countryCode: "DE", lat: 52.3667, lon: 13.5033, tz: "Europe/Berlin", size: 4, keywords: ["Brandenburg", "Willy Brandt", "Schönefeld", "Schonefeld", "Germany"] },
  { iata: "ZRH", icao: "LSZH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", countryCode: "CH", lat: 47.4647, lon: 8.5492, tz: "Europe/Zurich", size: 4, keywords: ["Zürich", "Kloten", "Switzerland", "Swiss Alps", "Lucerne"] },
  { iata: "GVA", icao: "LSGG", name: "Geneva Airport", city: "Geneva", country: "Switzerland", countryCode: "CH", lat: 46.2381, lon: 6.109, tz: "Europe/Zurich", size: 3, keywords: ["Genève", "Geneve", "Cointrin", "Switzerland", "Lausanne", "Chamonix", "Alps"] },
  { iata: "VIE", icao: "LOWW", name: "Vienna International Airport", city: "Vienna", country: "Austria", countryCode: "AT", lat: 48.1103, lon: 16.5697, tz: "Europe/Vienna", size: 4, keywords: ["Wien", "Schwechat", "Austria", "Bratislava"] },
  { iata: "MAD", icao: "LEMD", name: "Adolfo Suárez Madrid-Barajas Airport", city: "Madrid", country: "Spain", countryCode: "ES", lat: 40.4983, lon: -3.5676, tz: "Europe/Madrid", size: 4, keywords: ["Barajas", "Spain", "España", "Adolfo Suarez"] },
  { iata: "BCN", icao: "LEBL", name: "Josep Tarradellas Barcelona-El Prat Airport", city: "Barcelona", country: "Spain", countryCode: "ES", lat: 41.2974, lon: 2.0833, tz: "Europe/Madrid", size: 4, keywords: ["El Prat", "Catalonia", "Catalunya", "Spain", "Costa Brava"] },
  { iata: "AGP", icao: "LEMG", name: "Málaga-Costa del Sol Airport", city: "Malaga", country: "Spain", countryCode: "ES", lat: 36.6749, lon: -4.4991, tz: "Europe/Madrid", size: 3, keywords: ["Málaga", "Costa del Sol", "Marbella", "Andalusia", "Andalucía", "Seville", "Granada", "Spain"] },
  { iata: "LIS", icao: "LPPT", name: "Lisbon Humberto Delgado Airport", city: "Lisbon", country: "Portugal", countryCode: "PT", lat: 38.7756, lon: -9.1354, tz: "Europe/Lisbon", size: 4, keywords: ["Lisboa", "Portela", "Portugal", "Cascais", "Sintra"] },
  { iata: "OPO", icao: "LPPR", name: "Porto Airport", city: "Porto", country: "Portugal", countryCode: "PT", lat: 41.2481, lon: -8.6814, tz: "Europe/Lisbon", size: 3, keywords: ["Francisco Sá Carneiro", "Francisco Sa Carneiro", "Oporto", "Portugal", "Douro"] },
  { iata: "FCO", icao: "LIRF", name: "Rome Fiumicino Airport", city: "Rome", metro: "ROM", country: "Italy", countryCode: "IT", lat: 41.8003, lon: 12.2389, tz: "Europe/Rome", size: 4, keywords: ["Fiumicino", "Leonardo da Vinci", "Roma", "Italy", "Italia", "Vatican", "Lazio"] },
  { iata: "CIA", icao: "LIRA", name: "Rome Ciampino Airport", city: "Rome", metro: "ROM", country: "Italy", countryCode: "IT", lat: 41.7994, lon: 12.5949, tz: "Europe/Rome", size: 2, keywords: ["Ciampino", "G. B. Pastine", "Roma", "Italy", "Italia"] },
  { iata: "MXP", icao: "LIMC", name: "Milan Malpensa Airport", city: "Milan", metro: "MIL", country: "Italy", countryCode: "IT", lat: 45.6306, lon: 8.7281, tz: "Europe/Rome", size: 4, keywords: ["Malpensa", "Milano", "Lombardy", "Italy", "Italia", "Lake Como"] },
  { iata: "LIN", icao: "LIML", name: "Milan Linate Airport", city: "Milan", metro: "MIL", country: "Italy", countryCode: "IT", lat: 45.4451, lon: 9.2767, tz: "Europe/Rome", size: 3, keywords: ["Linate", "Milano", "Lombardy", "Italy", "Italia"] },
  { iata: "VCE", icao: "LIPZ", name: "Venice Marco Polo Airport", city: "Venice", country: "Italy", countryCode: "IT", lat: 45.5053, lon: 12.3519, tz: "Europe/Rome", size: 3, keywords: ["Venezia", "Marco Polo", "Tessera", "Veneto", "Italy", "Italia"] },
  { iata: "NAP", icao: "LIRN", name: "Naples International Airport", city: "Naples", country: "Italy", countryCode: "IT", lat: 40.886, lon: 14.2908, tz: "Europe/Rome", size: 3, keywords: ["Napoli", "Capodichino", "Amalfi Coast", "Pompeii", "Capri", "Sorrento", "Italy", "Italia"] },
  { iata: "ATH", icao: "LGAV", name: "Athens International Airport", city: "Athens", country: "Greece", countryCode: "GR", lat: 37.9364, lon: 23.9445, tz: "Europe/Athens", size: 4, keywords: ["Eleftherios Venizelos", "Athína", "Athina", "Greece", "Greek islands", "Acropolis"] },
  { iata: "IST", icao: "LTFM", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", countryCode: "TR", lat: 41.2753, lon: 28.7519, tz: "Europe/Istanbul", size: 5, keywords: ["Türkiye", "Turkiye", "Turkey", "Arnavutköy", "Bosphorus", "Constantinople"] },
  { iata: "CPH", icao: "EKCH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark", countryCode: "DK", lat: 55.618, lon: 12.6508, tz: "Europe/Copenhagen", size: 4, keywords: ["København", "Kobenhavn", "Kastrup", "Denmark", "Malmö", "Malmo", "Scandinavia"] },
  { iata: "ARN", icao: "ESSA", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden", countryCode: "SE", lat: 59.6498, lon: 17.9238, tz: "Europe/Stockholm", size: 4, keywords: ["Arlanda", "Sweden", "Sverige", "Uppsala", "Scandinavia"] },
  { iata: "OSL", icao: "ENGM", name: "Oslo Airport", city: "Oslo", country: "Norway", countryCode: "NO", lat: 60.1976, lon: 11.1004, tz: "Europe/Oslo", size: 4, keywords: ["Gardermoen", "Norway", "Norge", "Scandinavia", "fjords"] },
  { iata: "HEL", icao: "EFHK", name: "Helsinki Airport", city: "Helsinki", country: "Finland", countryCode: "FI", lat: 60.3172, lon: 24.9633, tz: "Europe/Helsinki", size: 3, keywords: ["Vantaa", "Helsinki-Vantaa", "Finland", "Suomi", "Lapland"] },
  { iata: "KEF", icao: "BIKF", name: "Keflavík International Airport", city: "Reykjavik", country: "Iceland", countryCode: "IS", lat: 63.985, lon: -22.6056, tz: "Atlantic/Reykjavik", size: 3, keywords: ["Keflavik", "Reykjavík", "Iceland", "Blue Lagoon", "Northern Lights"] },
  { iata: "PRG", icao: "LKPR", name: "Václav Havel Airport Prague", city: "Prague", country: "Czech Republic", countryCode: "CZ", lat: 50.1008, lon: 14.2632, tz: "Europe/Prague", size: 3, keywords: ["Praha", "Vaclav Havel", "Ruzyně", "Ruzyne", "Czechia", "Bohemia"] },
  { iata: "WAW", icao: "EPWA", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland", countryCode: "PL", lat: 52.1657, lon: 20.9671, tz: "Europe/Warsaw", size: 3, keywords: ["Warszawa", "Chopin", "Okęcie", "Okecie", "Poland", "Polska"] },
  { iata: "KRK", icao: "EPKK", name: "Kraków John Paul II International Airport", city: "Krakow", country: "Poland", countryCode: "PL", lat: 50.0777, lon: 19.7848, tz: "Europe/Warsaw", size: 2, keywords: ["Kraków", "Cracow", "Balice", "John Paul II", "Poland", "Polska", "Auschwitz"] },
  { iata: "BUD", icao: "LHBP", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", country: "Hungary", countryCode: "HU", lat: 47.4298, lon: 19.2611, tz: "Europe/Budapest", size: 3, keywords: ["Ferenc Liszt", "Ferihegy", "Hungary", "Magyarország", "Danube"] },
  { iata: "ZAG", icao: "LDZA", name: "Zagreb Franjo Tuđman Airport", city: "Zagreb", country: "Croatia", countryCode: "HR", lat: 45.7429, lon: 16.0688, tz: "Europe/Zagreb", size: 2, keywords: ["Franjo Tudman", "Pleso", "Croatia", "Hrvatska"] },
  { iata: "DBV", icao: "LDDU", name: "Dubrovnik Airport", city: "Dubrovnik", country: "Croatia", countryCode: "HR", lat: 42.5614, lon: 18.2682, tz: "Europe/Zagreb", size: 2, keywords: ["Čilipi", "Cilipi", "Dalmatia", "Croatia", "Hrvatska", "Adriatic", "Montenegro"] },

  /* ────────────────────────── Middle East & Africa ──────────────────────── */
  { iata: "DXB", icao: "OMDB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", countryCode: "AE", lat: 25.2532, lon: 55.3657, tz: "Asia/Dubai", size: 5, keywords: ["UAE", "Emirates", "Burj Khalifa", "Jumeirah", "Deira", "Sharjah"] },
  { iata: "AUH", icao: "OMAA", name: "Zayed International Airport", city: "Abu Dhabi", country: "United Arab Emirates", countryCode: "AE", lat: 24.433, lon: 54.6511, tz: "Asia/Dubai", size: 4, keywords: ["UAE", "Emirates", "Zayed", "Yas Island", "Saadiyat", "US preclearance"] },
  { iata: "DOH", icao: "OTHH", name: "Hamad International Airport", city: "Doha", country: "Qatar", countryCode: "QA", lat: 25.2731, lon: 51.6081, tz: "Asia/Qatar", size: 4, keywords: ["Hamad", "Qatar", "West Bay", "The Pearl", "Gulf"] },
  { iata: "TLV", icao: "LLBG", name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel", countryCode: "IL", lat: 32.0055, lon: 34.8854, tz: "Asia/Jerusalem", size: 4, keywords: ["Ben-Gurion", "Lod", "Israel", "Jerusalem", "Jaffa", "Haifa"] },
  { iata: "AMM", icao: "OJAI", name: "Queen Alia International Airport", city: "Amman", country: "Jordan", countryCode: "JO", lat: 31.7226, lon: 35.9932, tz: "Asia/Amman", size: 3, keywords: ["Queen Alia", "Jordan", "Petra", "Dead Sea", "Wadi Rum"] },
  { iata: "CAI", icao: "HECA", name: "Cairo International Airport", city: "Cairo", country: "Egypt", countryCode: "EG", lat: 30.1219, lon: 31.4056, tz: "Africa/Cairo", size: 4, keywords: ["Egypt", "Giza", "Pyramids", "Heliopolis", "Nile", "Al Qahirah"] },
  { iata: "CMN", icao: "GMMN", name: "Mohammed V International Airport", city: "Casablanca", country: "Morocco", countryCode: "MA", lat: 33.3675, lon: -7.5898, tz: "Africa/Casablanca", size: 3, keywords: ["Mohammed V", "Morocco", "Maroc", "Rabat", "Marrakech", "Marrakesh"] },
  { iata: "JNB", icao: "FAOR", name: "O. R. Tambo International Airport", city: "Johannesburg", country: "South Africa", countryCode: "ZA", lat: -26.1392, lon: 28.246, tz: "Africa/Johannesburg", size: 4, keywords: ["OR Tambo", "Joburg", "Jozi", "Kempton Park", "Pretoria", "Kruger", "South Africa", "Gauteng"] },
  { iata: "CPT", icao: "FACT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa", countryCode: "ZA", lat: -33.9715, lon: 18.6021, tz: "Africa/Johannesburg", size: 3, keywords: ["Kaapstad", "Table Mountain", "Western Cape", "Winelands", "Stellenbosch", "South Africa"] },
  { iata: "NBO", icao: "HKJK", name: "Jomo Kenyatta International Airport", city: "Nairobi", country: "Kenya", countryCode: "KE", lat: -1.3192, lon: 36.9278, tz: "Africa/Nairobi", size: 3, keywords: ["Jomo Kenyatta", "Kenya", "safari", "Masai Mara", "East Africa"] },
  { iata: "ADD", icao: "HAAB", name: "Addis Ababa Bole International Airport", city: "Addis Ababa", country: "Ethiopia", countryCode: "ET", lat: 8.9779, lon: 38.7993, tz: "Africa/Addis_Ababa", size: 3, keywords: ["Bole", "Ethiopia", "East Africa", "Horn of Africa"] },
  { iata: "LOS", icao: "DNMM", name: "Murtala Muhammed International Airport", city: "Lagos", country: "Nigeria", countryCode: "NG", lat: 6.5774, lon: 3.3212, tz: "Africa/Lagos", size: 3, keywords: ["Murtala Muhammed", "Ikeja", "Nigeria", "Victoria Island", "Lekki", "West Africa"] },
  { iata: "ACC", icao: "DGAA", name: "Kotoka International Airport", city: "Accra", country: "Ghana", countryCode: "GH", lat: 5.6052, lon: -0.1668, tz: "Africa/Accra", size: 2, keywords: ["Kotoka", "Ghana", "West Africa", "Osu"] },

  /* ──────────────────────────────── Asia ────────────────────────────────── */
  { iata: "NRT", icao: "RJAA", name: "Narita International Airport", city: "Tokyo", metro: "TYO", country: "Japan", countryCode: "JP", lat: 35.772, lon: 140.3929, tz: "Asia/Tokyo", size: 4, keywords: ["Narita", "Chiba", "Japan", "Nippon", "Nihon"] },
  { iata: "HND", icao: "RJTT", name: "Tokyo Haneda Airport", city: "Tokyo", metro: "TYO", country: "Japan", countryCode: "JP", lat: 35.5494, lon: 139.7798, tz: "Asia/Tokyo", size: 5, keywords: ["Haneda", "Ota", "Shinjuku", "Shibuya", "Ginza", "Japan", "Nippon", "Nihon", "Yokohama"] },
  { iata: "KIX", icao: "RJBB", name: "Kansai International Airport", city: "Osaka", country: "Japan", countryCode: "JP", lat: 34.4347, lon: 135.244, tz: "Asia/Tokyo", size: 3, keywords: ["Kansai", "Kyoto", "Kobe", "Nara", "Japan", "Nippon", "Nihon", "Izumisano"] },
  { iata: "ICN", icao: "RKSI", name: "Incheon International Airport", city: "Seoul", country: "South Korea", countryCode: "KR", lat: 37.4602, lon: 126.4407, tz: "Asia/Seoul", size: 4, keywords: ["Incheon", "Korea", "Republic of Korea", "Gangnam", "Myeongdong"] },
  { iata: "PEK", icao: "ZBAA", name: "Beijing Capital International Airport", city: "Beijing", country: "China", countryCode: "CN", lat: 40.0799, lon: 116.6031, tz: "Asia/Shanghai", size: 4, keywords: ["Peking", "Capital Airport", "China", "Forbidden City", "Great Wall", "Shunyi"] },
  { iata: "PVG", icao: "ZSPD", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China", countryCode: "CN", lat: 31.1443, lon: 121.8083, tz: "Asia/Shanghai", size: 4, keywords: ["Pudong", "China", "The Bund", "Lujiazui"] },
  { iata: "HKG", icao: "VHHH", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong", countryCode: "HK", lat: 22.308, lon: 113.9185, tz: "Asia/Hong_Kong", size: 4, keywords: ["Chek Lap Kok", "HK", "Kowloon", "Lantau", "Central", "Xianggang"] },
  { iata: "TPE", icao: "RCTP", name: "Taiwan Taoyuan International Airport", city: "Taipei", country: "Taiwan", countryCode: "TW", lat: 25.0797, lon: 121.2342, tz: "Asia/Taipei", size: 4, keywords: ["Taoyuan", "Taiwan", "Republic of China", "Formosa"] },
  { iata: "SIN", icao: "WSSS", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", countryCode: "SG", lat: 1.3644, lon: 103.9915, tz: "Asia/Singapore", size: 4, keywords: ["Changi", "Jewel", "Marina Bay", "Sentosa", "Southeast Asia"] },
  { iata: "BKK", icao: "VTBS", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", countryCode: "TH", lat: 13.69, lon: 100.7501, tz: "Asia/Bangkok", size: 4, keywords: ["Suvarnabhumi", "Krung Thep", "Thailand", "Siam", "Sukhumvit", "Southeast Asia"] },
  { iata: "KUL", icao: "WMKK", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", lat: 2.7456, lon: 101.7099, tz: "Asia/Kuala_Lumpur", size: 3, keywords: ["KLIA", "KL", "Sepang", "Malaysia", "Petronas Towers", "Southeast Asia"] },
  { iata: "MNL", icao: "RPLL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines", countryCode: "PH", lat: 14.5086, lon: 121.0198, tz: "Asia/Manila", size: 4, keywords: ["NAIA", "Ninoy Aquino", "Pasay", "Makati", "Metro Manila", "Philippines", "Pilipinas"] },
  { iata: "CGK", icao: "WIII", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia", countryCode: "ID", lat: -6.1256, lon: 106.6559, tz: "Asia/Jakarta", size: 3, keywords: ["Soekarno-Hatta", "Soekarno Hatta", "Tangerang", "Cengkareng", "Java", "Indonesia"] },
  { iata: "DPS", icao: "WADD", name: "Ngurah Rai International Airport", city: "Denpasar", country: "Indonesia", countryCode: "ID", lat: -8.7482, lon: 115.1672, tz: "Asia/Makassar", size: 3, keywords: ["Bali", "Ngurah Rai", "Kuta", "Seminyak", "Ubud", "Canggu", "Nusa Dua", "Indonesia"] },
  { iata: "DEL", icao: "VIDP", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", countryCode: "IN", lat: 28.5562, lon: 77.1, tz: "Asia/Kolkata", size: 4, keywords: ["Delhi", "Indira Gandhi", "Gurgaon", "Gurugram", "Noida", "India", "Agra", "Taj Mahal"] },
  { iata: "BOM", icao: "VABB", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", countryCode: "IN", lat: 19.0896, lon: 72.8656, tz: "Asia/Kolkata", size: 4, keywords: ["Bombay", "Chhatrapati Shivaji", "Sahar", "Maharashtra", "India", "Bollywood"] },
  { iata: "BLR", icao: "VOBL", name: "Kempegowda International Airport", city: "Bengaluru", country: "India", countryCode: "IN", lat: 13.1989, lon: 77.7068, tz: "Asia/Kolkata", size: 3, keywords: ["Bangalore", "Kempegowda", "Devanahalli", "Karnataka", "India", "Silicon Valley of India"] },
  { iata: "HAN", icao: "VVNB", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam", countryCode: "VN", lat: 21.2212, lon: 105.8072, tz: "Asia/Ho_Chi_Minh", size: 3, keywords: ["Noi Bai", "Hà Nội", "Ha Noi", "Vietnam", "Ha Long Bay", "Halong Bay", "Old Quarter"] },
  { iata: "SGN", icao: "VVTS", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam", countryCode: "VN", lat: 10.8188, lon: 106.652, tz: "Asia/Ho_Chi_Minh", size: 3, keywords: ["Saigon", "HCMC", "Tan Son Nhat", "Tân Sơn Nhất", "Vietnam", "District 1", "Mekong Delta"] },

  /* ─────────────────────────────── Oceania ──────────────────────────────── */
  { iata: "SYD", icao: "YSSY", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", countryCode: "AU", lat: -33.9399, lon: 151.1753, tz: "Australia/Sydney", size: 4, keywords: ["Kingsford Smith", "Mascot", "New South Wales", "NSW", "Bondi", "Australia", "Oz"] },
  { iata: "MEL", icao: "YMML", name: "Melbourne Airport", city: "Melbourne", country: "Australia", countryCode: "AU", lat: -37.669, lon: 144.841, tz: "Australia/Melbourne", size: 4, keywords: ["Tullamarine", "Victoria", "Australia", "Oz", "Great Ocean Road"] },
  { iata: "BNE", icao: "YBBN", name: "Brisbane Airport", city: "Brisbane", country: "Australia", countryCode: "AU", lat: -27.3842, lon: 153.1175, tz: "Australia/Brisbane", size: 3, keywords: ["Queensland", "Gold Coast", "Sunshine Coast", "Australia", "Oz", "Great Barrier Reef"] },
  { iata: "AKL", icao: "NZAA", name: "Auckland Airport", city: "Auckland", country: "New Zealand", countryCode: "NZ", lat: -37.0082, lon: 174.785, tz: "Pacific/Auckland", size: 3, keywords: ["Mangere", "Māngere", "New Zealand", "NZ", "Aotearoa", "North Island", "Kiwi"] },
  { iata: "NAN", icao: "NFFN", name: "Nadi International Airport", city: "Nadi", country: "Fiji", countryCode: "FJ", lat: -17.7554, lon: 177.4434, tz: "Pacific/Fiji", size: 2, keywords: ["Fiji", "Viti Levu", "Denarau", "Mamanuca", "Yasawa", "South Pacific"] },
  { iata: "PPT", icao: "NTAA", name: "Faa'a International Airport", city: "Papeete", country: "French Polynesia", countryCode: "PF", lat: -17.5537, lon: -149.6072, tz: "Pacific/Tahiti", size: 2, keywords: ["Tahiti", "Faaa", "Bora Bora", "Moorea", "French Polynesia", "South Pacific"] },
];

/* ──────────────────────────────── Lookups ────────────────────────────────── */

export const AIRPORT_BY_IATA: Record<string, Airport> = Object.fromEntries(
  AIRPORTS.map((a) => [a.iata, a]),
);

/** Case-insensitive lookup by IATA code. */
export function getAirport(iata: string): Airport | undefined {
  if (!iata) return undefined;
  return AIRPORT_BY_IATA[iata.trim().toUpperCase()];
}

/** Human labels for metro-area codes used by `Airport.metro`. */
export const METRO_LABELS: Record<string, string> = {
  NYC: "New York (all airports)",
  CHI: "Chicago (all airports)",
  WAS: "Washington, D.C. (all airports)",
  HOU: "Houston (all airports)",
  DAL: "Dallas (all airports)",
  BAY: "San Francisco Bay Area (all airports)",
  LAX: "Los Angeles (all airports)",
  MIA: "Miami (all airports)",
  LON: "London (all airports)",
  PAR: "Paris (all airports)",
  TYO: "Tokyo (all airports)",
  MIL: "Milan (all airports)",
  ROM: "Rome (all airports)",
};

/** Search terms that resolve to a whole metro area (matched as prefixes). */
const METRO_TERMS: Record<string, string[]> = {
  NYC: ["new york", "new york city", "nyc"],
  CHI: ["chicago", "chicagoland"],
  WAS: ["washington", "washington dc", "washington d.c.", "dc", "d.c."],
  HOU: ["houston"],
  DAL: ["dallas", "dallas fort worth", "dallas/fort worth", "dfw"],
  BAY: ["san francisco", "san francisco bay area", "bay area", "sf"],
  LAX: ["los angeles", "l.a.", "socal", "southern california"],
  MIA: ["miami", "south florida"],
  LON: ["london"],
  PAR: ["paris"],
  TYO: ["tokyo"],
  MIL: ["milan", "milano"],
  ROM: ["rome", "roma"],
};

/** Airports grouped by metro code, largest first. */
export const AIRPORTS_BY_METRO: Record<string, Airport[]> = (() => {
  const groups: Record<string, Airport[]> = {};
  for (const a of AIRPORTS) {
    if (!a.metro) continue;
    (groups[a.metro] ??= []).push(a);
  }
  for (const list of Object.values(groups)) list.sort(bySizeThenCity);
  return groups;
})();

/* ──────────────────────────────── Search ─────────────────────────────────── */

/** Lowercase, strip accents, collapse whitespace. */
function normalize(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[.,'’()\-/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bySizeThenCity(a: Airport, b: Airport): number {
  return b.size - a.size || a.city.localeCompare(b.city) || a.iata.localeCompare(b.iata);
}

interface SearchIndexEntry {
  airport: Airport;
  iata: string;
  city: string;
  metroTerms: string[];
  name: string;
  keywords: string[];
  /** Everything searchable, for substring matching. */
  haystack: string[];
}

const SEARCH_INDEX: SearchIndexEntry[] = AIRPORTS.map((a) => {
  const city = normalize(a.city);
  const name = normalize(a.name);
  const keywords = (a.keywords ?? []).map(normalize);
  const metroTerms = a.metro ? (METRO_TERMS[a.metro] ?? []).map(normalize) : [];
  const extras = [a.state, a.country, a.icao, a.metro ? METRO_LABELS[a.metro] : undefined]
    .filter((s): s is string => Boolean(s))
    .map(normalize);
  return {
    airport: a,
    iata: a.iata.toLowerCase(),
    city,
    metroTerms,
    name,
    keywords,
    haystack: [city, name, ...keywords, ...metroTerms, ...extras],
  };
});

/** Lower rank = better match. Returns null when the entry doesn't match. */
function rankEntry(e: SearchIndexEntry, q: string): number | null {
  if (e.iata === q) return 0;
  if (e.city.startsWith(q)) return 1;
  if (e.metroTerms.some((t) => t.startsWith(q))) return 1.5;
  if (e.name.startsWith(q) || e.keywords.some((k) => k.startsWith(q))) return 2;
  // Word-start matches inside the city/name ("york" → New York) rank just above raw substrings.
  if (e.haystack.some((h) => h.split(" ").some((w) => w.startsWith(q)))) return 3;
  if (e.haystack.some((h) => h.includes(q))) return 4;
  return null;
}

/**
 * Autocomplete search. Ranking: exact IATA → city/metro prefix → name/keyword
 * prefix → word-start → substring; ties broken by airport size (desc) then city.
 * An empty query returns the biggest airports.
 */
export function searchAirports(query: string, limit = 8): Airport[] {
  const q = normalize(query ?? "");
  if (!q) return [...AIRPORTS].sort((a, b) => Number(b.countryCode === "US") - Number(a.countryCode === "US") || bySizeThenCity(a, b)).slice(0, limit);

  const scored: { airport: Airport; rank: number }[] = [];
  for (const e of SEARCH_INDEX) {
    const rank = rankEntry(e, q);
    if (rank !== null) scored.push({ airport: e.airport, rank });
  }
  scored.sort((x, y) => x.rank - y.rank || bySizeThenCity(x.airport, y.airport));
  return scored.slice(0, limit).map((s) => s.airport);
}

/**
 * All airports for a city name ("New York", "Chicago", "London") or a metro
 * code ("NYC"). City-name matches also expand to the whole metro when the
 * matching airport belongs to one. Sorted largest first.
 */
export function getAirportsForCity(cityOrMetro: string): Airport[] {
  const raw = (cityOrMetro ?? "").trim();
  if (!raw) return [];
  const metroByCode = AIRPORTS_BY_METRO[raw.toUpperCase()];
  if (metroByCode) return metroByCode;

  const q = normalize(raw);
  for (const [code, terms] of Object.entries(METRO_TERMS)) {
    if (terms.includes(q) && AIRPORTS_BY_METRO[code]) return AIRPORTS_BY_METRO[code];
  }
  const byCity = AIRPORTS.filter((a) => normalize(a.city) === q);
  if (byCity.length === 0) return [];
  const metro = byCity.find((a) => a.metro)?.metro;
  if (metro && AIRPORTS_BY_METRO[metro]) {
    // Include the metro's other airports but keep the named city's own airports first.
    const own = byCity.sort(bySizeThenCity);
    const rest = AIRPORTS_BY_METRO[metro].filter((a) => !own.includes(a));
    return [...own, ...rest];
  }
  return byCity.sort(bySizeThenCity);
}

/* ──────────────────────────────── Labels ─────────────────────────────────── */

/** "New York (JFK)" */
export function airportLabel(a: Airport): string {
  return `${a.city} (${a.iata})`;
}

/** "New York, NY" for US airports, "London, United Kingdom" otherwise. */
export function cityLabel(a: Airport): string {
  if (a.countryCode === "US" && a.state) return `${a.city}, ${a.state}`;
  return `${a.city}, ${a.country}`;
}

/* ─────────────────────────────── Geography ───────────────────────────────── */

/** ISO codes treated as US for domestic-itinerary rules (no passport needed for US citizens). */
const US_DOMESTIC_CODES = new Set(["US", "PR", "VI", "GU", "AS", "MP"]);

function isUSAirport(a: Airport): boolean {
  return US_DOMESTIC_CODES.has(a.countryCode);
}

/** True when both airports are in the US, including Puerto Rico, the USVI and Guam. */
export function isDomesticUS(a: string, b: string): boolean {
  const from = getAirport(a);
  const to = getAirport(b);
  return Boolean(from && to && isUSAirport(from) && isUSAirport(to));
}

/** Major US airports (size ≥ 4) sorted by size then city — used for hubs and popular-origin modules. */
export const TOP_US_AIRPORTS: Airport[] = AIRPORTS.filter((a) => a.countryCode === "US" && a.size >= 4).sort(
  bySizeThenCity,
);
