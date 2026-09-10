import type { Offer } from "@/lib/flights/types";

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** "L-7K2M9Q": short, unambiguous (no 0/O, 1/I), easy to read out on the phone. */
export function generateLockReference(random: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += REF_ALPHABET[Math.floor(random() * REF_ALPHABET.length)];
  return `L-${s}`;
}

export function isValidLockReference(input: string): boolean {
  return /^L-[A-HJ-NP-Z2-9]{6}$/.test(input.trim().toUpperCase());
}

/** Whether a lock has passed its expiry (evaluated at request time). */
export function lockExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

/** Per-paying-traveler price the customer saw, which is what we lock. */
export function lockedPriceFor(offer: Offer): number {
  const paying = Math.max(1, offer.passengers.adults + offer.passengers.children);
  return Math.round((offer.price.total / paying) * 100) / 100;
}
