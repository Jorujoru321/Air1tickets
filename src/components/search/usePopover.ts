"use client";

import * as React from "react";

/** Shared open/close behaviour for popovers: outside click + Escape close. */
export function usePopover<T extends HTMLElement = HTMLDivElement>() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, ref };
}

export const fieldButtonClass =
  "flex h-14 w-full items-center gap-2.5 rounded-[var(--radius-field)] border border-slate-300 bg-white px-3.5 text-left transition-colors hover:border-slate-400 focus:outline-none focus-visible:border-ocean-500 focus-visible:ring-3 focus-visible:ring-ocean-500/20 aria-[invalid=true]:border-danger-500";

export const fieldLabelClass = "block text-[11px] font-semibold uppercase tracking-wide text-slate-500";
