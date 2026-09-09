/**
 * Small text helpers shared by the programmatic SEO pages: title/description
 * fitting, list joining, and number formatting. Pure functions.
 */
import { site } from "@/lib/site";
import { formatDuration } from "@/lib/utils";

export const TITLE_SUFFIX = ` | ${site.name}`;
export const TITLE_MAX = 60;

/** First candidate that fits the 60-character limit including the " | Air1 Tickets" suffix. */
export function fitTitle(candidates: string[], max = TITLE_MAX): string {
  const budget = max - TITLE_SUFFIX.length;
  for (const c of candidates) if (c.length <= budget) return c;
  const last = candidates[candidates.length - 1] ?? "";
  if (last.length <= budget) return last;
  const cut = last.slice(0, budget);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), 20)).trim();
}

/**
 * Join sentences until the description is at least `min` characters, never
 * exceeding `max`. Sentences that would overflow are skipped in favour of
 * shorter ones that follow.
 */
export function fitDescription(sentences: string[], min = 120, max = 158): string {
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > max) {
      if (out.length >= min) break;
      continue;
    }
    out = next;
    if (out.length >= min) break;
  }
  if (out.length < min) {
    for (const s of sentences) {
      const next = out ? `${out} ${s}` : s;
      if (next.length <= max && !out.includes(s)) out = next;
      if (out.length >= min) break;
    }
  }
  return out;
}

/** "Delta, American and JetBlue" */
export function joinNames(names: string[], conjunction = "and"): string {
  const list = names.filter(Boolean);
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} ${conjunction} ${list[1]}`;
  return `${list.slice(0, -1).join(", ")} ${conjunction} ${list[list.length - 1]}`;
}

export function formatMiles(n: number): string {
  return `${new Intl.NumberFormat("en-US").format(Math.round(n))} miles`;
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** "about 5h 40m" / "about 55m" */
export function aboutDuration(minutes: number): string {
  return `about ${formatDuration(minutes)}`;
}

/** "UTC−7" / "UTC+5:30" */
export function formatUtcOffset(minutes: number): string {
  const sign = minutes < 0 ? "−" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

/** "3 hours behind New York" style phrase for a signed minute difference. */
export function describeTimeDifference(diffMinutes: number, originCity: string, destinationCity: string): string {
  if (diffMinutes === 0) return `${destinationCity} is in the same time zone as ${originCity}, so there is no clock change.`;
  const abs = Math.abs(diffMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const amount = m ? `${h} hours ${m} minutes` : h === 1 ? "1 hour" : `${h} hours`;
  return `${destinationCity} is ${amount} ${diffMinutes > 0 ? "ahead of" : "behind"} ${originCity}.`;
}

/** Trim a day name to "Tue" style for tight layouts. */
export function shortDay(label: string): string {
  return label.slice(0, 3);
}

/** Percentage string without decimals. */
export function percent(n: number): string {
  return `${Math.round(n)}%`;
}
