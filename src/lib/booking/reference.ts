/** Air1 booking references: "A1" + 6 unambiguous characters, e.g. A1K7M2QX. */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateBookingReference(random: () => number = Math.random): string {
  let s = "A1";
  for (let i = 0; i < 6; i++) s += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return s;
}

export function normalizeReference(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isValidReference(input: string): boolean {
  return /^A1[A-Z0-9]{6}$/.test(normalizeReference(input));
}
