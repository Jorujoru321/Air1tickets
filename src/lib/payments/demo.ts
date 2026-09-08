/**
 * Demo payment processor used when Stripe keys are not configured.
 * Accepts standard test card numbers and declines a few well-known ones so
 * the error paths can be exercised. Never stores card data.
 */
import { nanoid } from "nanoid";

export interface DemoCardInput {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  name: string;
}

export const DEMO_DECLINE_CARDS: Record<string, string> = {
  "4000000000000002": "Your card was declined.",
  "4000000000009995": "Your card has insufficient funds.",
  "4000000000000069": "Your card has expired.",
  "4000000000000127": "Your card's security code is incorrect.",
};

export function luhnValid(number: string): boolean {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function cardBrand(number: string): "visa" | "mastercard" | "amex" | "discover" | "unknown" {
  const n = number.replace(/\D/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(6011|65|64[4-9])/.test(n)) return "discover";
  return "unknown";
}

export function processDemoPayment(card: DemoCardInput, amountUsd: number): { ok: true; reference: string; last4: string; brand: string } | { ok: false; error: string } {
  const number = card.number.replace(/\D/g, "");
  if (!luhnValid(number)) return { ok: false, error: "That card number doesn't look right. Please check it and try again." };
  const now = new Date();
  const year = card.expYear < 100 ? 2000 + card.expYear : card.expYear;
  if (card.expMonth < 1 || card.expMonth > 12) return { ok: false, error: "Enter a valid expiration month." };
  if (year < now.getFullYear() || (year === now.getFullYear() && card.expMonth < now.getMonth() + 1)) return { ok: false, error: "This card has expired." };
  if (!/^\d{3,4}$/.test(card.cvc)) return { ok: false, error: "Enter the 3- or 4-digit security code." };
  if (!card.name.trim()) return { ok: false, error: "Enter the name as it appears on the card." };
  if (amountUsd <= 0) return { ok: false, error: "Invalid amount." };
  const decline = DEMO_DECLINE_CARDS[number];
  if (decline) return { ok: false, error: decline };
  return { ok: true, reference: `demo_pi_${nanoid(18)}`, last4: number.slice(-4), brand: cardBrand(number) };
}
