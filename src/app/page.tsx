import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Cheap Flights & Airline Tickets — Compare 500+ Airlines",
  description: "Search and book cheap flights from every US airport. Compare 500+ airlines, see the true total price, and get 24/7 US-based support from Air1 Tickets.",
  path: "/",
  rawTitle: false,
});

export default function HomePage() {
  return (
    <div className="container-page py-16">
      <h1 className="text-4xl">Air1 Tickets</h1>
      <p className="mt-4 text-slate-600">Home page under construction.</p>
    </div>
  );
}
