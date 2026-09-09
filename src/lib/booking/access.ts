import "server-only";
import type { Booking } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { hasBookingAccess } from "@/lib/auth/session";

/** A booking is viewable by its owner account, by the contact email's account, or with a guest access cookie. */
export async function canAccessBooking(booking: Booking): Promise<boolean> {
  if (await hasBookingAccess(booking.reference)) return true;
  const user = await getCurrentUser();
  if (!user) return false;
  return booking.userId === user.id || booking.contactEmail === user.email.toLowerCase();
}
