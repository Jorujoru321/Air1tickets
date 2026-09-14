/**
 * Agent shorthand → a finished WhatsApp message.
 *
 * An agent quoting from their phone types the fewest characters they can get
 * away with: "atl lhr 450 delta oct3". This turns that into the message they
 * would otherwise retype twenty times a day, with the fare, what it includes
 * and the price-lock offer already worded consistently.
 *
 * Everything here is pure string work so it runs in the browser on the static
 * export, and so the parsing can be tested without a DOM.
 */
import { getAirport } from "@/data/airports";
import { site } from "@/lib/site";

export interface ParsedQuote {
  /** IATA codes, uppercased, only when they match a known airport. */
  origin?: string;
  destination?: string;
  /** Fare per traveler, in whole dollars. */
  price?: number;
  /** Free text the parser could not place — airline, dates, anything. */
  notes: string[];
}

const IATA = /^[A-Za-z]{3}$/;
/** $450, 450, 450.00, 1,299 — the ways an agent actually types a fare. */
const MONEY = /^\$?(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?$/;

/**
 * Parse agent shorthand. Deliberately forgiving: anything it cannot place
 * becomes a note rather than an error, because a half-parsed quote the agent
 * fixes by hand still beats retyping the whole thing.
 */
export function parseShorthand(input: string): ParsedQuote {
  const out: ParsedQuote = { notes: [] };
  // Strip the thousands separator first, or splitting on commas turns "$1,299"
  // into "$1" and "299" and the fare comes out as 299.
  const normalised = input.trim().replace(/(\d),(?=\d{3}\b)/g, "$1");
  const tokens = normalised.split(/[\s,]+/).filter(Boolean);

  for (const raw of tokens) {
    const token = raw.replace(/[–—]/g, "-");

    // "ATL-LHR" written as one token.
    const pair = token.split("-");
    if (pair.length === 2 && pair.every((p) => IATA.test(p) && isAirport(p))) {
      out.origin ??= pair[0].toUpperCase();
      out.destination ??= pair[1].toUpperCase();
      continue;
    }

    if (MONEY.test(token) && out.price === undefined) {
      const n = Number(token.replace(/[$,]/g, ""));
      // A bare 3-letter code can't be money, but a bare number could be a date
      // ("3"). Treat only plausible fares as the fare.
      if (Number.isFinite(n) && n >= 20) {
        out.price = Math.round(n);
        continue;
      }
    }

    if (IATA.test(token) && isAirport(token)) {
      if (!out.origin) {
        out.origin = token.toUpperCase();
        continue;
      }
      if (!out.destination) {
        out.destination = token.toUpperCase();
        continue;
      }
    }

    out.notes.push(raw);
  }
  return out;
}

function isAirport(code: string): boolean {
  return Boolean(getAirport(code.toUpperCase()));
}

/** "Atlanta (ATL)" when we know the airport, else just the code. */
export function describePlace(code?: string): string {
  if (!code) return "";
  const a = getAirport(code);
  return a ? `${a.city} (${code})` : code;
}

export function formatMoney(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export type TemplateId = "quote" | "lock" | "followUp" | "noFare";

export interface TemplateInput extends ParsedQuote {
  /** Traveler's first name, when the agent knows it. */
  name?: string;
}

/**
 * The four messages that cover most of a quoting day. Written to be pasted as
 * they are: no placeholders left in, and no claim the business cannot keep.
 */
export function buildMessage(id: TemplateId, q: TemplateInput): string {
  const hi = q.name ? `Hi ${q.name}!` : "Hi!";
  const trip =
    q.origin && q.destination
      ? `${describePlace(q.origin)} → ${describePlace(q.destination)}`
      : q.origin || q.destination
        ? describePlace(q.origin || q.destination)
        : "your trip";
  const extra = q.notes.length ? `\n${q.notes.join(" ")}` : "";
  const fare = q.price !== undefined ? formatMoney(q.price) : null;
  const hours = site.priceLock.hours;

  switch (id) {
    case "quote":
      return [
        `${hi} Here's what I found for ${trip}:`,
        fare
          ? `\n${fare} per traveler, all taxes and fees included.`
          : `\nI have a fare for you.`,
        extra,
        `\nThis is an agent fare, so it isn't what you'd see on public search.`,
        `\nWant me to hold it? I can lock it for ${hours} hours, no card needed.`,
      ]
        .join("")
        .trim();

    case "lock":
      return [
        `${hi} Locked${fare ? ` at ${fare} per traveler` : ""} for ${trip}.`,
        `\n\nHeld for ${hours} hours. That's the most you'll pay — if the fare drops before you fly, you get the lower one.`,
        `\nNo card taken, and you can walk away at any point.`,
        extra,
      ]
        .join("")
        .trim();

    case "followUp":
      return [
        `${hi} Just checking in on ${trip}${fare ? ` at ${fare}` : ""}.`,
        `\n\nStill want it? Seats on agent fares move, so tell me either way and I'll stop watching it if you've booked elsewhere.`,
      ]
        .join("")
        .trim();

    case "noFare":
      return [
        `${hi} I checked ${trip} and I can't beat what's on public search today.`,
        `\n\nI'd rather tell you that than waste your time. Book it yourself where you saw it.`,
        `\nIf your dates are flexible, send me a range and I'll look again.`,
      ]
        .join("")
        .trim();
  }
}

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  quote: "Send the fare",
  lock: "Confirm a price lock",
  followUp: "Follow up",
  noFare: "Can't beat it (be honest)",
};
