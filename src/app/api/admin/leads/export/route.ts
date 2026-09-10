import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminUser } from "@/lib/leads/admin";
import { fareLocksToCsv, listFareLocks } from "@/lib/leads/service";

export const dynamic = "force-dynamic";

/** GET /api/admin/leads/export — every lead as CSV for spreadsheets or a CRM. */
export async function GET() {
  const user = await getCurrentUser();
  if (!isAdminUser(user)) return NextResponse.json({ error: "Not authorized" }, { status: user ? 403 : 401 });
  const rows = await listFareLocks(5000);
  return new NextResponse(fareLocksToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="air1-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
