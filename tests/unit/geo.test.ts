import { describe, expect, it } from "vitest";
import { dayOffset, distanceMiles, estimateBlockMinutes, localToUtc, minutesBetween, tzOffsetMinutes, utcToLocal } from "@/lib/flights/geo";

const JFK = { lat: 40.6413, lon: -73.7781 };
const LAX = { lat: 33.9416, lon: -118.4085 };
const LHR = { lat: 51.47, lon: -0.4543 };

describe("geo", () => {
  it("computes great-circle distance", () => {
    const d = distanceMiles(JFK, LAX);
    expect(d).toBeGreaterThan(2440);
    expect(d).toBeLessThan(2490);
    const t = distanceMiles(JFK, LHR);
    expect(t).toBeGreaterThan(3420);
    expect(t).toBeLessThan(3480);
  });

  it("converts local wall time to UTC and back, respecting DST", () => {
    // 07:45 in New York during EDT (UTC-4)
    const utc = localToUtc("2026-10-12T07:45", "America/New_York");
    expect(new Date(utc).toISOString()).toBe("2026-10-12T11:45:00.000Z");
    expect(utcToLocal(utc, "America/New_York")).toBe("2026-10-12T07:45");
    expect(utcToLocal(utc, "America/Los_Angeles")).toBe("2026-10-12T04:45");
    // Winter (EST, UTC-5)
    const utcWinter = localToUtc("2026-01-15T07:45", "America/New_York");
    expect(new Date(utcWinter).toISOString()).toBe("2026-01-15T12:45:00.000Z");
    // Arizona has no DST
    expect(tzOffsetMinutes(utc, "America/Phoenix")).toBe(-420);
    expect(tzOffsetMinutes(utcWinter, "America/Phoenix")).toBe(-420);
  });

  it("handles midnight formatting as 00 not 24", () => {
    const utc = localToUtc("2026-10-12T00:10", "America/Chicago");
    expect(utcToLocal(utc, "America/Chicago")).toBe("2026-10-12T00:10");
  });

  it("computes elapsed minutes across zones and day offsets", () => {
    // Depart JFK 21:30 EDT, arrive LHR 09:40 BST next day = 7h10m
    expect(minutesBetween("2026-10-12T21:30", "America/New_York", "2026-10-13T09:40", "Europe/London")).toBe(430);
    expect(dayOffset("2026-10-12T21:30", "2026-10-13T09:40")).toBe(1);
    expect(dayOffset("2026-12-31T23:30", "2027-01-01T01:00")).toBe(1);
  });

  it("estimates plausible block times", () => {
    const transcon = estimateBlockMinutes(2475, 260); // westbound
    expect(transcon).toBeGreaterThanOrEqual(330);
    expect(transcon).toBeLessThanOrEqual(380);
    const east = estimateBlockMinutes(2475, 80);
    expect(east).toBeLessThan(transcon);
    const short = estimateBlockMinutes(400);
    expect(short).toBeGreaterThanOrEqual(75);
    expect(short).toBeLessThanOrEqual(95);
  });
});
