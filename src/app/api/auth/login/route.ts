import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth/users";
import { createSession } from "@/lib/auth/session";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Enter your password").max(128),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const rl = rateLimit(`login:${clientIp(req)}:${parsed.data.email}`, { limit: 10, windowMs: 15 * 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfterSec);
  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  await createSession(user);
  return NextResponse.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
}
