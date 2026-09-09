"use client";

import * as React from "react";
import { getAirline } from "@/data/airlines";
import { hasAirlineLogoFile } from "@/data/airline-logos";
import { cn } from "@/lib/utils";

/**
 * Airline identifier: shows /airlines/{IATA}.svg when the file is registered in
 * src/data/airline-logos.ts (drop real logos in /public/airlines), otherwise a
 * generated mark in the brand colour with the IATA code. Always includes the
 * airline name for screen readers.
 */
export function AirlineLogo({ iata, size = 36, className }: { iata: string; size?: number; className?: string }) {
  const [failed, setFailed] = React.useState(false);
  const airline = getAirline(iata);
  const name = airline?.name ?? iata;
  const color = airline?.color ?? "#12244a";
  if (!failed && hasAirlineLogoFile(iata)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/airlines/${iata}.svg`}
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
      className={cn("inline-flex shrink-0 select-none items-center justify-center rounded-lg font-display font-extrabold text-white", className)}
      style={{ width: size, height: size, background: color, fontSize: Math.max(10, Math.round(size * 0.36)), letterSpacing: "0.02em" }}
    >
      {iata}
    </span>
  );
}
