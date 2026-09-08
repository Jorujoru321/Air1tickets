import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    { user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
