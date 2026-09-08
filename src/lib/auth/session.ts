import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SESSION_COOKIE = "air1_session";
const BOOKING_COOKIE = "air1_booking_access";
const SESSION_DAYS = 30;

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set (32+ random characters) in production");
    }
    return new TextEncoder().encode("air1-development-only-secret-change-me");
  }
  return new TextEncoder().encode(s);
}

export interface SessionPayload extends JWTPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: "customer" | "admin";
}

export async function signToken(payload: JWTPayload, expiresIn: string): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(expiresIn).sign(secret());
}

export async function verifyToken<T extends JWTPayload>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as T;
  } catch {
    return null;
  }
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function createSession(user: { id: string; email: string; firstName: string; lastName: string; role: "customer" | "admin" }) {
  const payload: JWTPayload = { sub: user.id, email: user.email, name: `${user.firstName} ${user.lastName}`.trim(), role: user.role };
  const token = await signToken(payload, `${SESSION_DAYS}d`);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_DAYS * 86_400 });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken<SessionPayload>(token);
  return payload?.sub ? payload : null;
}

/* ─────────── Guest access to specific bookings (manage booking) ─────────── */

interface BookingAccessPayload extends JWTPayload {
  refs: string[];
}

export async function grantBookingAccess(reference: string) {
  const store = await cookies();
  const existing = store.get(BOOKING_COOKIE)?.value;
  const current = existing ? ((await verifyToken<BookingAccessPayload>(existing))?.refs ?? []) : [];
  const refs = Array.from(new Set([...current, reference.toUpperCase()])).slice(-10);
  const token = await signToken({ refs }, "7d");
  store.set(BOOKING_COOKIE, token, { ...cookieOptions, maxAge: 7 * 86_400 });
}

export async function hasBookingAccess(reference: string): Promise<boolean> {
  const store = await cookies();
  const token = store.get(BOOKING_COOKIE)?.value;
  if (!token) return false;
  const payload = await verifyToken<BookingAccessPayload>(token);
  return Boolean(payload?.refs?.includes(reference.toUpperCase()));
}
