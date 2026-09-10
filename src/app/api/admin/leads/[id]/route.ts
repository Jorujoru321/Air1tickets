import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminUser } from "@/lib/leads/admin";
import { LEAD_STATUSES, updateFareLockStatus } from "@/lib/leads/service";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ status: z.enum(LEAD_STATUSES as [string, ...string[]]) });

/** PATCH /api/admin/leads/:id — move a lead through new → contacted → quoted → won/lost. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!isAdminUser(user)) return NextResponse.json({ error: "Not authorized" }, { status: user ? 403 : 401 });
  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const lock = await updateFareLockStatus(id, parsed.data.status as (typeof LEAD_STATUSES)[number]);
  if (!lock) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json({ ok: true, status: lock.status });
}
