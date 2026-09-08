"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Plane, User, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Me {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Client-side account state so the header can stay static/cacheable.
 * Fetches /api/auth/me once on mount.
 */
export function AccountMenu({ className }: { className?: string }) {
  const [me, setMe] = React.useState<Me | null | undefined>(undefined);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) setMe(d?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    setOpen(false);
    window.location.href = "/";
  }

  if (me === undefined) {
    return <div className={cn("h-10 w-24 rounded-[var(--radius-field)] bg-slate-100", className)} aria-hidden />;
  }

  if (!me) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button href="/account/login" variant="ghost" size="sm" leftIcon={<User className="h-4 w-4" aria-hidden />}>
          Sign in
        </Button>
        <Button href="/account/register" variant="secondary" size="sm">
          Create account
        </Button>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 items-center gap-2 rounded-[var(--radius-field)] px-3 text-sm font-semibold text-navy-900 hover:bg-slate-100"
      >
        <UserCircle2 className="h-5 w-5 text-ocean-600" aria-hidden />
        <span className="max-w-[9rem] truncate">{me.firstName}</span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-float">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-navy-900">
              {me.firstName} {me.lastName}
            </p>
            <p className="truncate text-xs text-slate-500">{me.email}</p>
          </div>
          <Link role="menuitem" href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
            <Plane className="h-4 w-4" aria-hidden /> My trips
          </Link>
          <button role="menuitem" type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
