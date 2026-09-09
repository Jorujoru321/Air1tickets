/**
 * IATA codes that have a real logo file at /public/airlines/{IATA}.svg.
 * Add a code here when you drop the file in — anything not listed renders the
 * generated brand-colour mark instead of requesting a file that 404s.
 */
export const AIRLINE_LOGO_FILES: ReadonlySet<string> = new Set<string>([
  // "DL", "AA", "UA", "WN", "B6", "AS", "NK", "F9",
]);

export function hasAirlineLogoFile(iata: string): boolean {
  return AIRLINE_LOGO_FILES.has(iata.toUpperCase());
}
