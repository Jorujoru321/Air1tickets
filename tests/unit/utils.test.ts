import { describe, expect, it } from "vitest";
import { addDays, daysBetween, formatDuration, formatMoney, formatTime, parseDateOnly, slugify, toDateOnly } from "@/lib/utils";

describe("utils", () => {
  it("formats money in whole dollars by default", () => {
    expect(formatMoney(218.4)).toBe("$218");
    expect(formatMoney(218.4, { cents: true })).toBe("$218.40");
    expect(formatMoney(1234567)).toBe("$1,234,567");
  });

  it("formats durations", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(335)).toBe("5h 35m");
  });

  it("formats local times in 12-hour US style", () => {
    expect(formatTime("2026-10-12T07:45")).toBe("7:45 AM");
    expect(formatTime("2026-10-12T00:05")).toBe("12:05 AM");
    expect(formatTime("2026-10-12T12:00")).toBe("12:00 PM");
    expect(formatTime("2026-10-12T23:59")).toBe("11:59 PM");
  });

  it("handles date-only strings without timezone drift", () => {
    const d = parseDateOnly("2026-03-01");
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(1);
    expect(toDateOnly(d)).toBe("2026-03-01");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(daysBetween("2026-10-01", "2026-10-15")).toBe(14);
  });

  it("slugifies", () => {
    expect(slugify("New York")).toBe("new-york");
    expect(slugify("São Paulo")).toBe("sao-paulo");
    expect(slugify("Dallas/Fort Worth")).toBe("dallas-fort-worth");
    expect(slugify("Washington, D.C.")).toBe("washington-d-c");
  });
});
