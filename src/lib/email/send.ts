import "server-only";
import type { Booking } from "@/lib/db/schema";
import { site } from "@/lib/site";
import { bookingConfirmationEmail } from "./templates";

interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function deliver(mail: Mail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `${site.name} <bookings@air1tickets.com>`;
  if (!key) {
    console.log(`\n[air1] email (not sent — RESEND_API_KEY missing)\n  to: ${mail.to}\n  subject: ${mail.subject}\n${mail.text.split("\n").map((l) => "  " + l).join("\n")}\n`);
    return;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const { error } = await resend.emails.send({ from, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text });
  if (error) throw new Error(error.message);
}

export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  const mail = bookingConfirmationEmail(booking);
  await deliver({ to: booking.contactEmail, ...mail });
}

export async function sendPlainEmail(to: string, subject: string, text: string): Promise<void> {
  await deliver({ to, subject, text, html: `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>` });
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}
