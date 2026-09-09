import "server-only";
import { nanoid } from "nanoid";
import type { SearchParams } from "@/lib/flights/types";
import { getDb, schema } from "@/lib/db/client";

/** Fire-and-forget analytics row for a search. Never blocks or fails the request. */
export async function logSearch(params: SearchParams, resultCount: number, minPrice?: number): Promise<void> {
  try {
    const db = await getDb();
    await db.insert(schema.searchLog).values({
      id: `srch_${nanoid(14)}`,
      origin: params.origin,
      destination: params.destination,
      departDate: params.departDate,
      returnDate: params.returnDate ?? null,
      cabin: params.cabin,
      passengers: params.passengers.adults + params.passengers.children + params.passengers.infants,
      resultCount,
      minPrice: minPrice ?? null,
    });
  } catch (e) {
    console.warn("[air1] search log failed", (e as Error).message);
  }
}
