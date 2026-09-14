"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { WhatsAppIcon } from "@/components/leads/ChatButtons";
import {
  buildMessage,
  describePlace,
  formatMoney,
  parseShorthand,
  TEMPLATE_LABELS,
  type TemplateId,
} from "@/lib/agent/quote";

/**
 * Shorthand in, finished WhatsApp message out.
 *
 * The point is the agent never retypes the fare wording, so every traveler
 * gets the same promise in the same words — which matters when the promise is
 * "this is the most you'll pay".
 */

const EXAMPLES = ["atl lhr 450", "ATL-LHR $1,299 delta oct3", "jfk lax 219 nonstop"];
const TEMPLATE_ORDER: TemplateId[] = ["quote", "lock", "followUp", "noFare"];

export function QuoteComposer() {
  const [shorthand, setShorthand] = React.useState("");
  const [name, setName] = React.useState("");
  const [template, setTemplate] = React.useState<TemplateId>("quote");
  const [copied, setCopied] = React.useState(false);
  /** Set once the agent edits the output, so re-parsing stops overwriting them. */
  const [edited, setEdited] = React.useState<string | null>(null);

  const parsed = React.useMemo(() => parseShorthand(shorthand), [shorthand]);
  const generated = React.useMemo(
    () => buildMessage(template, { ...parsed, name: name.trim() || undefined }),
    [template, parsed, name],
  );
  const message = edited ?? generated;

  // Changing the inputs means the agent wants the generated text back.
  React.useEffect(() => setEdited(null), [template, shorthand, name]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure origin, old browser): select it instead so
      // the agent can still copy by hand rather than getting nothing.
      document.querySelector<HTMLTextAreaElement>("#composer-output")?.select();
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <div>
          <label
            htmlFor="shorthand"
            className="block text-sm font-bold text-navy-950"
          >
            The trip, short
          </label>
          <input
            id="shorthand"
            value={shorthand}
            onChange={(e) => setShorthand(e.target.value)}
            placeholder="atl lhr 450"
            autoComplete="off"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-navy-900 outline-none focus-visible:border-ocean-500"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setShorthand(ex)}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-ocean-400 hover:text-ocean-700"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-bold text-navy-950">
            Their first name <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dana"
            autoComplete="off"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-navy-900 outline-none focus-visible:border-ocean-500"
          />
        </div>

        {/* What the parser understood, so a wrong airport is obvious before it sends. */}
        <dl className="rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Route</dt>
            <dd className="text-right font-semibold text-navy-900">
              {parsed.origin || parsed.destination
                ? `${describePlace(parsed.origin) || "?"} → ${describePlace(parsed.destination) || "?"}`
                : "not set"}
            </dd>
          </div>
          <div className="mt-1.5 flex justify-between gap-4">
            <dt className="text-slate-500">Fare</dt>
            <dd className="text-right font-semibold text-navy-900">
              {parsed.price !== undefined ? formatMoney(parsed.price) : "not set"}
            </dd>
          </div>
          {parsed.notes.length > 0 && (
            <div className="mt-1.5 flex justify-between gap-4">
              <dt className="text-slate-500">Added as-is</dt>
              <dd className="text-right font-semibold text-navy-900">
                {parsed.notes.join(" ")}
              </dd>
            </div>
          )}
        </dl>

        <div>
          <span className="block text-sm font-bold text-navy-950">Message</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {TEMPLATE_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={template === id}
                onClick={() => setTemplate(id)}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                  template === id
                    ? "bg-navy-950 text-white"
                    : "border border-slate-200 text-slate-700 hover:border-ocean-400"
                }`}
              >
                {TEMPLATE_LABELS[id]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label
          htmlFor="composer-output"
          className="block text-sm font-bold text-navy-950"
        >
          Ready to send{" "}
          <span className="font-normal text-slate-500">(edit freely)</span>
        </label>
        <textarea
          id="composer-output"
          value={message}
          onChange={(e) => setEdited(e.target.value)}
          rows={12}
          className="w-full resize-y rounded-xl border border-slate-300 p-4 font-mono text-sm leading-relaxed text-navy-900 outline-none focus-visible:border-ocean-500"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-navy-950 px-5 text-sm font-bold text-white transition hover:bg-navy-900"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy message"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-5 text-sm font-bold text-[#062b16] transition hover:bg-[#1fbf5b]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Open in WhatsApp
          </a>
        </div>
        <p className="text-xs text-slate-500">
          &ldquo;Open in WhatsApp&rdquo; lets you pick the chat. Copy is usually
          faster if you are already in the conversation.
        </p>
      </div>
    </div>
  );
}
