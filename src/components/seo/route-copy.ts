/**
 * Generated copy for route pages: tips and FAQs written from the facts in a
 * RouteInfo. Every sentence is conditional on real data so no two routes
 * read the same and nothing is claimed that the data doesn't support.
 */
import type { FAQ } from "@/data/types";
import type { RouteInfo } from "@/lib/flights/route-info";
import { formatDuration, formatMoney } from "@/lib/utils";
import { describeTimeDifference, formatMiles, joinNames } from "./seo-text";

function shortName(name: string): string {
  return name.replace(/ Air Lines$| Airlines$| Airways$/, "");
}

export function routeTips(info: RouteInfo): string[] {
  const { origin, destination } = info;
  const tips: string[] = [];
  const nonstopNames = info.nonstopAirlines.map((a) => shortName(a.name));

  if (info.nonstopAirlines.length >= 3) {
    tips.push(`${joinNames(nonstopNames.slice(0, 4))} all fly ${origin.iata} to ${destination.iata} nonstop, so compare the total with bags before picking the lowest base fare: the difference between a basic and a standard economy ticket is often less than one checked bag each way.`);
  } else if (info.nonstopAirlines.length > 0) {
    tips.push(`Only ${joinNames(nonstopNames)} ${info.nonstopAirlines.length === 1 ? "flies" : "fly"} this route nonstop, which keeps nonstop fares firm. A one-stop itinerary through ${info.connectingHubs.length ? joinNames(info.connectingHubs.slice(0, 2), "or") : "a hub"} is usually cheaper if you can spare the extra ${info.isDomestic ? "two to three" : "three to five"} hours.`);
  } else {
    tips.push(`There is no scheduled nonstop between ${origin.iata} and ${destination.iata}. Every itinerary connects${info.connectingHubs.length ? `, most often through ${joinNames(info.connectingHubs.slice(0, 3), "or")}` : ""}, so sort results by total travel time rather than price alone.`);
  }

  if (info.cheapestMonth && info.lowestFares.length > 1) {
    const priciest = info.lowestFares.reduce((a, b) => (b.price > a.price ? b : a));
    const gap = priciest.price - info.cheapestMonth.price;
    if (gap >= 20) {
      tips.push(`${info.cheapestMonth.label} is the cheapest month to fly over the next six months, with round trips from ${formatMoney(info.cheapestMonth.price)}; ${priciest.label} is the most expensive at ${formatMoney(priciest.price)} and up, a difference of ${formatMoney(gap)} per traveler.`);
    }
  }

  if (info.cheapestDayOfWeek && info.priciestDayOfWeek && info.weekdaySavingsPercent >= 5) {
    tips.push(`Departing on a ${info.cheapestDayOfWeek} averages ${info.weekdaySavingsPercent}% less than a ${info.priciestDayOfWeek} on this route. If your dates are flexible, shift the outbound by a day or two and check the calendar view before you book.`);
  }

  tips.push(info.advanceBookingTip);

  if (Math.abs(info.timeZoneDiffMinutes) >= 120) {
    const hours = Math.round(Math.abs(info.timeZoneDiffMinutes) / 60);
    tips.push(`${describeTimeDifference(info.timeZoneDiffMinutes, origin.city, destination.city)} ${info.timeZoneDiffMinutes < 0 ? `A morning departure lands in ${destination.city} with most of the day left; an evening flight arrives close to local dinner time.` : `Expect to lose ${hours} hours on the clock heading east, so an overnight or late-afternoon departure tends to arrive at a more usable hour.`}`);
  } else if (info.distanceMiles < 500) {
    tips.push(`At ${formatMiles(info.distanceMiles)} this is a short hop of ${formatDuration(info.typicalDurationMinutes)}, so an early-morning departure, which is usually the cheapest and most punctual of the day, costs you little sleep.`);
  }

  return tips.slice(0, 5);
}

export function routeFaqs(info: RouteInfo): FAQ[] {
  const { origin, destination } = info;
  const o = `${origin.city} (${origin.iata})`;
  const d = `${destination.city} (${destination.iata})`;
  const nonstopNames = info.nonstopAirlines.map((a) => a.name);
  const faqs: FAQ[] = [];

  faqs.push({
    question: `How long is the flight from ${origin.city} to ${destination.city}?`,
    answer: info.nonstopAirlines.length
      ? `A nonstop flight from ${o} to ${d} takes about ${formatDuration(info.typicalDurationMinutes)} gate to gate, covering ${formatMiles(info.distanceMiles)}. Connecting itineraries add the layover, typically ${info.isDomestic ? "1 to 3" : "2 to 5"} hours more in total.`
      : `There are no nonstop flights, so the trip from ${o} to ${d} takes ${formatDuration(info.typicalDurationMinutes)} of flying plus a layover, usually ${formatDuration(info.typicalDurationMinutes + (info.isDomestic ? 105 : 180))} or more door to door across ${formatMiles(info.distanceMiles)}.`,
  });

  faqs.push({
    question: `Which airlines fly nonstop from ${origin.iata} to ${destination.iata}?`,
    answer: info.nonstopAirlines.length
      ? `${joinNames(nonstopNames)} ${nonstopNames.length === 1 ? "operates" : "operate"} nonstop flights from ${o} to ${d}, with ${info.flightsPerDay} nonstop departure${info.flightsPerDay === 1 ? "" : "s"} a day between them.${info.connectingHubs.length ? ` One-stop options connect through ${joinNames(info.connectingHubs.slice(0, 3))}.` : ""}`
      : `No airline currently flies nonstop between ${o} and ${d}.${info.connectingHubs.length ? ` The most common connections are through ${joinNames(info.connectingHubs.slice(0, 3))}.` : " Itineraries on this route involve at least one connection."}`,
  });

  if (info.cheapestMonth) {
    faqs.push({
      question: `What is the cheapest month to fly from ${origin.city} to ${destination.city}?`,
      answer: `Over the next six months, ${info.cheapestMonth.label} has the lowest round-trip fares from ${o} to ${d}, starting at ${formatMoney(info.cheapestMonth.price)} per traveler including taxes and fees.${info.cheapestDayOfWeek ? ` Within any month, ${info.cheapestDayOfWeek} departures average the lowest prices.` : ""}`,
    });
  }

  faqs.push({
    question: `How far in advance should I book ${origin.city} to ${destination.city} flights?`,
    answer: `${info.advanceBookingTip} Air1 Tickets includes free cancellation within 24 hours of booking on every fare, so you can lock in a good price and keep looking.`,
  });

  faqs.push({
    question: `What is the time difference between ${origin.city} and ${destination.city}?`,
    answer: `${describeTimeDifference(info.timeZoneDiffMinutes, origin.city, destination.city)} ${origin.iata} is on ${origin.tz.replace(/_/g, " ")} time and ${destination.iata} on ${destination.tz.replace(/_/g, " ")} time. Departure and arrival times in search results are always shown in local time at each airport.`,
  });

  if (faqs.length < 5) {
    faqs.push({
      question: `Do I need a passport to fly from ${origin.city} to ${destination.city}?`,
      answer: info.isDomestic
        ? `No. ${o} to ${d} is a domestic US itinerary, so US citizens need a REAL ID-compliant driver's license or another TSA-accepted ID rather than a passport.`
        : `Yes. This is an international itinerary, so every traveler needs a passport valid for the trip, and some destinations require six months' validity beyond your return date. Check entry rules for ${destination.country} before you book.`,
    });
  }

  return faqs.slice(0, 5);
}
