import { describe, expect, it } from "vitest";
import {
  campaignName,
  formatCountdown,
  offerFor,
  offerMessageLine,
  promo,
  promoWindowMs,
  referralSource,
} from "@/lib/promo/offer";

/**
 * The offer only appears for traffic that actually came from a paid ad. That
 * boundary is the whole honesty of the mechanic: an organic visitor must never
 * be told they came from an ad they never clicked.
 */
describe("referralSource", () => {
  it("recognises a Meta click ID", () => {
    expect(referralSource("?fbclid=IwAR0abc123")).toBe("meta");
  });

  it("recognises Meta utm tags without a click ID", () => {
    expect(referralSource("?utm_source=facebook&utm_medium=paid")).toBe("meta");
    expect(referralSource("?utm_source=instagram")).toBe("meta");
    expect(referralSource("?utm_source=ig")).toBe("meta");
  });

  it("recognises Google and TikTok clicks", () => {
    expect(referralSource("?gclid=abc")).toBe("google");
    expect(referralSource("?gbraid=abc")).toBe("google");
    expect(referralSource("?utm_source=google&utm_medium=cpc")).toBe("google");
    expect(referralSource("?ttclid=abc")).toBe("tiktok");
  });

  it("recognises email campaigns", () => {
    expect(referralSource("?utm_medium=email")).toBe("email");
  });

  it("returns null for organic and direct traffic", () => {
    expect(referralSource("")).toBeNull();
    expect(referralSource("?from=JFK&to=LAX")).toBeNull();
    expect(referralSource("?utm_source=bing&utm_medium=organic")).toBeNull();
  });

  it("maps an explicit ?offer= code back to its channel", () => {
    expect(referralSource(`?offer=${promo.codes.meta}`)).toBe("meta");
    expect(referralSource(`?offer=${promo.codes.meta.toLowerCase()}`)).toBe(
      "meta",
    );
  });

  it("treats an unknown ?offer= code as a direct claim rather than ignoring it", () => {
    expect(referralSource("?offer=SOMETHINGELSE")).toBe("direct");
  });

  it("tolerates a search string with or without the leading question mark", () => {
    expect(referralSource("fbclid=abc")).toBe("meta");
  });
});

describe("campaignName", () => {
  it("reads utm_campaign when the ad passes one", () => {
    expect(campaignName("?fbclid=a&utm_campaign=summer-miami")).toBe(
      "summer-miami",
    );
  });

  it("is null when absent or blank", () => {
    expect(campaignName("?fbclid=a")).toBeNull();
    expect(campaignName("?utm_campaign=")).toBeNull();
  });
});

describe("offerFor", () => {
  it("gives each channel its own code so leads are attributable", () => {
    expect(offerFor("meta").code).toBe(promo.codes.meta);
    expect(offerFor("google").code).toBe(promo.codes.google);
    expect(offerFor("meta").code).not.toBe(offerFor("google").code);
  });

  it("qualifies the discount claim with 'up to'", () => {
    // A flat "50% off" is a promise about every trip and is not substantiable.
    expect(offerFor("meta").headline.toLowerCase()).toContain("up to");
  });

  it("puts the code in the message the agent receives", () => {
    expect(offerMessageLine(offerFor("meta"))).toContain(promo.codes.meta);
  });
});

describe("formatCountdown", () => {
  it("formats hours, minutes and seconds zero-padded", () => {
    expect(formatCountdown(3661_000)).toBe("01:01:01");
    expect(formatCountdown(59_000)).toBe("00:00:59");
  });

  it("returns null once the window has closed, so the bar can say so", () => {
    expect(formatCountdown(0)).toBeNull();
    expect(formatCountdown(-5000)).toBeNull();
  });
});

describe("promo window", () => {
  it("is a positive span derived from the configured hours", () => {
    expect(promoWindowMs).toBe(promo.hours * 60 * 60 * 1000);
    expect(promoWindowMs).toBeGreaterThan(0);
  });
});
