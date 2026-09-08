"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, description, className, id, ...props }, ref) {
  const reactId = React.useId();
  const inputId = id ?? `cb-${reactId}`;
  return (
    <label htmlFor={inputId} className={cn("flex cursor-pointer items-start gap-3 text-sm text-slate-700", className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-md border-slate-300 text-ocean-600 accent-ocean-600 focus:ring-ocean-500"
        {...props}
      />
      <span>
        <span className="font-medium text-navy-900">{label}</span>
        {description && <span className="mt-0.5 block text-slate-500">{description}</span>}
      </span>
    </label>
  );
});
