import type { Metadata } from "next";
import { QuoteComposer } from "@/components/agent/QuoteComposer";

/**
 * The agent's own quoting tool. It is a public URL because the static export
 * has no auth, but it holds no customer data and does nothing but format text,
 * so the only cost of someone finding it is a shrug. Kept out of the index and
 * out of the sitemap so it never competes with a route page.
 */
export const metadata: Metadata = {
  title: "Quote composer",
  description: "Internal tool for writing WhatsApp quotes.",
  robots: { index: false, follow: false },
};

export default function AgentQuotePage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold text-navy-950">Quote composer</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Type the trip the short way. Pick the message. Copy it, or send it
        straight to WhatsApp.
      </p>
      <QuoteComposer />
    </div>
  );
}
