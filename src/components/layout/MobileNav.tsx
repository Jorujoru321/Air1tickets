"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { PRIMARY_NAV } from "./nav";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-field)] text-navy-900 hover:bg-slate-100"
      >
        <Menu className="h-6 w-6" aria-hidden />
      </button>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Site menu" id="mobile-menu">
          <button type="button" className="absolute inset-0 bg-navy-950/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[min(22rem,90vw)] flex-col bg-white shadow-float">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-field)] hover:bg-slate-100">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <ul className="space-y-0.5">
                {PRIMARY_NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-base font-medium text-navy-900 hover:bg-slate-100">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/booking" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-base font-medium text-navy-900 hover:bg-slate-100">
                    Manage booking
                  </Link>
                </li>
              </ul>
              <div className="mt-4 space-y-2 border-t border-slate-100 px-3 pt-4">
                <Button href="/account/login" variant="outline" full onClick={() => setOpen(false)}>
                  Sign in
                </Button>
                <Button href="/account/register" variant="secondary" full onClick={() => setOpen(false)}>
                  Create account
                </Button>
              </div>
            </nav>
            <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600">
              <a href={`tel:${site.supportPhone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 font-semibold text-navy-900">
                <Phone className="h-4 w-4 text-ocean-600" aria-hidden /> {site.supportPhone}
              </a>
              <p className="mt-1 text-xs text-slate-500">24/7 US-based support</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
