import type { CabinClass, PassengerCounts } from "@/lib/flights/types";
import { getAirport } from "@/data/airports";
import { site } from "@/lib/site";
import { formatDateLong } from "@/lib/utils";

/**
 * The WhatsApp messages travelers send us. Every search on the site turns into
 * one of these: the traveler taps "Search", WhatsApp opens with the whole
 * request already typed out, and an agent replies with a last-minute deal.
 *
 * Keep them plain text, one detail per line, and always end with the question
 * that starts the conversation.
 */

const CABIN_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  premium_economy: "Premium economy",
  business: "Business",
  first: "First",
};

function travelersLine(p: PassengerCounts): string {
  const parts = [`${p.adults} adult${p.adults === 1 ? "" : "s"}`];
  if (p.children) parts.push(`${p.children} child${p.children === 1 ? "" : "ren"}`);
  if (p.infants) parts.push(`${p.infants} infant${p.infants === 1 ? "" : "s"}`);
  return parts.join(", ");
}

function place(iata: string): string {
  const a = getAirport(iata);
  return a ? `${a.city} (${a.iata})` : iata;
}

function lines(...items: (string | false | null | undefined)[]): string {
  return items.filter(Boolean).join("\n");
}

export interface FlightRequest {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string | null;
  passengers: PassengerCounts;
  cabin: CabinClass;
  directOnly?: boolean;
  /** Optional free-text note from the traveler. */
  notes?: string;
}

export function flightRequestText(r: FlightRequest): string {
  return lines(
    `Hi ${site.name}! I'd like a quote for this flight:`,
    ``,
    `✈️ From: ${place(r.origin)}`,
    `🛬 To: ${place(r.destination)}`,
    `📅 Depart: ${formatDateLong(r.departDate)}`,
    r.returnDate ? `📅 Return: ${formatDateLong(r.returnDate)}` : `↪️ Trip: One way`,
    `👤 Travelers: ${travelersLine(r.passengers)}`,
    `💺 Cabin: ${CABIN_LABELS[r.cabin]}`,
    r.directOnly && `🚫 Nonstop flights only`,
    r.notes && `📝 Notes: ${r.notes}`,
    ``,
    `What's your best price?`,
  );
}

export interface HotelRequest {
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  /** e.g. "4 star", "Any". */
  stars?: string;
  notes?: string;
}

export function hotelRequestText(r: HotelRequest): string {
  return lines(
    `Hi ${site.name}! I'd like a quote for a hotel:`,
    ``,
    `🏨 Where: ${r.destination}`,
    `📅 Check in: ${formatDateLong(r.checkIn)}`,
    `📅 Check out: ${formatDateLong(r.checkOut)}`,
    `🛏️ Rooms: ${r.rooms}`,
    `👤 Guests: ${r.adults} adult${r.adults === 1 ? "" : "s"}${r.children ? `, ${r.children} child${r.children === 1 ? "" : "ren"}` : ""}`,
    r.stars && r.stars !== "Any" && `⭐ Preferred rating: ${r.stars}`,
    r.notes && `📝 Notes: ${r.notes}`,
    ``,
    `What's your best price?`,
  );
}

export interface ActivityRequest {
  destination: string;
  date: string;
  travelers: number;
  category?: string;
  notes?: string;
}

export function activityRequestText(r: ActivityRequest): string {
  return lines(
    `Hi ${site.name}! I'd like a quote for things to do:`,
    ``,
    `📍 Where: ${r.destination}`,
    `📅 Date: ${formatDateLong(r.date)}`,
    `👤 Travelers: ${r.travelers}`,
    r.category && r.category !== "Anything" && `🎟️ Looking for: ${r.category}`,
    r.notes && `📝 Notes: ${r.notes}`,
    ``,
    `What do you recommend, and what's the price?`,
  );
}
