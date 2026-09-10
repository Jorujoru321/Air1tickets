import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { WhatsAppIcon } from "@/components/leads/ChatButtons";
import { LeadStatusSelect } from "@/components/leads/LeadStatusSelect";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminUser } from "@/lib/leads/admin";
import { listFareLocks } from "@/lib/leads/service";
import { lockExpired } from "@/lib/leads/reference";
import { getAirport } from "@/data/airports";
import { getAirline } from "@/data/airlines";
import { formatDateShort, formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Leads · Admin", robots: { index: false, follow: false } };

function whatsappTo(phone: string, text: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default async function LeadsAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/admin/leads");
  if (!isAdminUser(user)) {
    return (
      <div className="container-page py-16">
        <Alert tone="warning" title="Not authorized" className="max-w-xl">
          Your account ({user.email}) is not an admin. Add it to <code className="font-mono">ADMIN_EMAILS</code> in the environment settings, or set the account role to admin.
        </Alert>
      </div>
    );
  }
  const leads = await listFareLocks(300);
  const open = leads.filter((l) => l.status === "new" || l.status === "contacted" || l.status === "quoted").length;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">Admin</p>
          <h1 className="mt-1 text-2xl sm:text-3xl">Fare locks &amp; leads</h1>
          <p className="mt-1 text-sm text-slate-600">
            {leads.length} lead{leads.length === 1 ? "" : "s"} · {open} open. New locks are also emailed to the leads inbox.
          </p>
        </div>
        <Button href="/api/admin/leads/export" variant="outline" leftIcon={<Download className="h-4 w-4" aria-hidden />}>
          Export CSV
        </Button>
      </div>

      {leads.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          No fare locks yet. When a traveler locks a fare it appears here instantly.{" "}
          <Link href="/flights" className="font-semibold text-ocean-700 hover:underline">
            Try it from the search page
          </Link>
          .
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[64rem] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Lead
                </th>
                <th scope="col" className="px-4 py-3">
                  Traveler
                </th>
                <th scope="col" className="px-4 py-3">
                  Trip
                </th>
                <th scope="col" className="px-4 py-3">
                  Locked
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="relative px-4 py-3">
                  <span className="sr-only">Contact</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {leads.map((l) => {
                const o = getAirport(l.origin);
                const d = getAirport(l.destination);
                const airline = getAirline(l.airline ?? "")?.name ?? l.airline ?? "";
                const expired = lockExpired(l.expiresAt);
                const pax = l.adults + l.children + l.infants;
                return (
                  <tr key={l.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-mono font-bold tracking-wider text-navy-900">{l.reference}</p>
                      <p className="text-xs text-slate-500">
                        {formatDateShort(l.createdAt)} · via {l.source}
                      </p>
                      <p className="text-xs capitalize text-slate-500">prefers {l.channel}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy-900">{l.name}</p>
                      <p className="text-xs text-slate-600">{l.phone}</p>
                      <p className="text-xs text-slate-600">{l.email}</p>
                      {l.notes && <p className="mt-1 max-w-xs text-xs italic text-slate-500">&ldquo;{l.notes}&rdquo;</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy-900">
                        {o?.city ?? l.origin} ({l.origin}) → {d?.city ?? l.destination} ({l.destination})
                      </p>
                      <p className="text-xs text-slate-600">
                        {formatDateShort(l.departDate)}
                        {l.returnDate ? ` – ${formatDateShort(l.returnDate)}` : " · one way"} · {pax} pax · {l.cabin.replace("_", " ")}
                      </p>
                      <p className="text-xs text-slate-600">{airline}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold tabular-nums text-navy-900">{formatMoney(l.lockedPrice)}</p>
                      <p className={expired ? "text-xs font-semibold text-danger-600" : "text-xs text-slate-600"}>{expired ? "expired" : `until ${formatDateShort(l.expiresAt)}`}</p>
                    </td>
                    <td className="px-4 py-3">
                      <LeadStatusSelect id={l.id} status={l.status} reference={l.reference} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <a href={whatsappTo(l.phone, `Hi ${l.name.split(" ")[0]}, this is Air1 Tickets about your fare lock ${l.reference} (${l.origin} → ${l.destination}).`)} target="_blank" rel="noopener" aria-label={`WhatsApp ${l.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#25d366] text-[#062b16] hover:bg-[#1fbf5b]">
                          <WhatsAppIcon className="h-4 w-4" />
                        </a>
                        <a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`} aria-label={`Call ${l.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-navy-900 hover:bg-slate-50">
                          <Phone className="h-4 w-4" aria-hidden />
                        </a>
                        <a href={`mailto:${l.email}?subject=${encodeURIComponent(`Your fare lock ${l.reference}`)}`} aria-label={`Email ${l.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-navy-900 hover:bg-slate-50">
                          <Mail className="h-4 w-4" aria-hidden />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
