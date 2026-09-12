"use client";

import * as React from "react";
import { Plane, Hotel, Ticket } from "lucide-react";
import { SearchForm } from "./SearchForm";
import { HotelSearchForm } from "./HotelSearchForm";
import { ActivitySearchForm } from "./ActivitySearchForm";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "activities", label: "Things to do", icon: Ticket },
] as const;
type TabId = (typeof TABS)[number]["id"];

/** Flights / Hotels / Things to do switcher above the hero search form. */
export function SearchTabs({ suggestions, initial = "flights", className }: { suggestions: string[]; initial?: TabId; className?: string }) {
  const [tab, setTab] = React.useState<TabId>(initial);
  return (
    <div className={className}>
      <div role="tablist" aria-label="What are you booking?" className="flex flex-wrap gap-1 rounded-t-2xl bg-white/10 p-1 backdrop-blur sm:w-fit">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn("inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition", active ? "bg-white text-navy-900 shadow-sm" : "text-white/85 hover:bg-white/10")}
            >
              <t.icon className="h-4 w-4" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>
      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "flights" && <SearchForm variant="hero" className="rounded-tl-none" />}
        {tab === "hotels" && <HotelSearchForm suggestions={suggestions} className="rounded-tl-none" />}
        {tab === "activities" && <ActivitySearchForm suggestions={suggestions} className="rounded-tl-none" />}
      </div>
    </div>
  );
}
