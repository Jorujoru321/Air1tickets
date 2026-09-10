import type { Metadata } from "next";
import { Checkout } from "@/components/booking/Checkout";
import { Button } from "@/components/ui/Button";
import { getFareOptions, getFlightProvider } from "@/lib/flights/provider";
import { decodeOfferId } from "@/lib/flights/mock/engine";
import { buildSearchUrl } from "@/lib/flights/search-params";
import { extrasPricingFor } from "@/lib/booking/pricing";
import { getCurrentUser } from "@/lib/auth/current-user";
import { stripeEnabled } from "@/lib/payments/stripe";
import { redirect } from "next/navigation";
import { isLeadMode } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Complete your booking",
  robots: { index: false, follow: false },
};

function searchUrlFor(offerId: string): string {
  const decoded = decodeOfferId(offerId);
  return decoded ? buildSearchUrl(decoded.params) : "/flights";
}

export default async function BookPage({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId: raw } = await params;
  // In lead mode the site never takes payment: fares are locked, not booked.
  if (isLeadMode) redirect(`/lock/${raw}`);
  const offerId = decodeURIComponent(raw);
  const provider = getFlightProvider();
  const offer = await provider.getOffer(offerId);
  const searchUrl = searchUrlFor(offerId);

  if (!offer) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <h1 className="text-2xl">This fare is no longer available</h1>
          <p className="mt-3 text-slate-600">The airline has withdrawn this price or the seats have sold out. You have not been charged. Search again to see current fares — similar options are usually available.</p>
          <Button href={searchUrl} className="mt-6" size="lg">
            See current fares
          </Button>
        </div>
      </div>
    );
  }

  const [fareOptions, user] = await Promise.all([getFareOptions(offerId), getCurrentUser()]);
  const pricing = extrasPricingFor(offer);
  const stripeKey = stripeEnabled() ? (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null) : null;

  return (
    <div className="bg-slate-50">
      <div className="container-page py-8">
        <Checkout
          offer={offer}
          fareOptions={fareOptions.length ? fareOptions : [offer]}
          pricing={pricing}
          stripePublishableKey={stripeKey}
          user={user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } : null}
          searchUrl={searchUrl}
        />
      </div>
    </div>
  );
}
