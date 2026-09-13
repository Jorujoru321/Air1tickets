"use client";

import * as React from "react";
import { getAirline } from "@/data/airlines";
import { hasAirlineLogoFile } from "@/data/airline-logos";
import { asset } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Relative luminance of a #rrggbb colour (WCAG). */
function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** White text where it reaches 4.5:1 on the brand colour, otherwise black (light brands like Spirit yellow). */
function markTextColor(background: string): string {
  return 1.05 / (luminance(background) + 0.05) >= 4.5 ? "#ffffff" : "#000000";
}

/**
 * Airline identifier: shows /airlines/{IATA}.svg when the file is registered in
 * src/data/airline-logos.ts (drop real logos in /public/airlines), otherwise a
 * generated mark in the brand colour with the IATA code. Always includes the
 * airline name for screen readers.
 */
export function AirlineLogo({
  iata,
  size = 36,
  className,
}: {
  iata: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const airline = getAirline(iata);
  const name = airline?.name ?? iata;
  const color = airline?.color ?? "#12244a";
  if (!failed && hasAirlineLogoFile(iata)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset(`/airlines/${iata}.svg`)}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={cn("shrink-0 rounded-lg object-contain", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-lg font-display font-extrabold",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: color,
        color: markTextColor(color),
        fontSize: Math.max(10, Math.round(size * 0.36)),
        letterSpacing: "0.02em",
      }}
    >
      {iata}
    </span>
  );
}
