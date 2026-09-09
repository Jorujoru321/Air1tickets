import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/auth/users";
import { createSession } from "@/lib/auth/session";
import { passwordProblems } from "@/lib/auth/password";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(40),
  lastName: z.string().trim().min(1, "Last name is required").max(40),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(8, "Use at least 8 characters").max(128),
  phone: z.string().trim().max(25).optional().or(z.literal("")),
  newsletter: z.boolean().optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(`register:${clientIp(req)}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const { firstName, lastName, email, password, phone, newsletter } = parsed.data;
  const pw = passwordProblems(password);
  if (pw) return NextResponse.json({ error: pw }, { status: 400 });
  if (await findUserByEmail(email)) return NextResponse.json({ error: "An account with this email already exists. Try signing in." }, { status: 409 });
  const user = await createUser({ firstName, lastName, email, password, phone: phone || undefined, newsletter });
  await createSession(user);
  return NextResponse.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } }, { status: 201 });
}
