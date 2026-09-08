import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an amount in USD. Accepts dollars (number) — never cents. */
export function formatMoney(
  amount: number,
  opts: { currency?: string; cents?: boolean } = {},
): string {
  const { currency = "USD", cents = false } = opts;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(amount);
}

/** "5h 35m" from minutes. */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** "7:45 AM" from an ISO local datetime string ("2026-10-12T07:45"). */
export function formatTime(isoLocal: string): string {
  const [, time] = isoLocal.split("T");
  if (!time) return "";
  const [hh, mm] = time.split(":").map(Number);
  const suffix = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${suffix}`;
}

/** Parse "YYYY-MM-DD" as a local calendar date (never shifts by timezone). */
export function parseDateOnly(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** "YYYY-MM-DD" for a Date in local time. */
export function toDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "Mon, Oct 12" from "YYYY-MM-DD" or an ISO local datetime. */
export function formatDateShort(date: string): string {
  const d = parseDateOnly(date.slice(0, 10));
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** "Monday, October 12, 2026" */
export function formatDateLong(date: string): string {
  const d = parseDateOnly(date.slice(0, 10));
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Add days to a "YYYY-MM-DD" string. */
export function addDays(date: string, days: number): string {
  const d = parseDateOnly(date);
  d.setDate(d.getDate() + days);
  return toDateOnly(d);
}

/** Whole-day difference between two "YYYY-MM-DD" strings (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = parseDateOnly(b).getTime() - parseDateOnly(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleCase(input: string): string {
  return input.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
