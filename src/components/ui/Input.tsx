"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerClassName?: string;
}

export const inputClasses =
  "h-12 w-full rounded-[var(--radius-field)] border border-slate-300 bg-white px-3.5 text-[15px] text-navy-900 placeholder:text-slate-400 shadow-xs transition-colors focus:border-ocean-500 focus:outline-none focus:ring-3 focus:ring-ocean-500/20 disabled:bg-slate-50 disabled:text-slate-500 aria-[invalid=true]:border-danger-500 aria-[invalid=true]:focus:ring-danger-500/20";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, rightSlot, className, containerClassName, id, ...props },
  ref,
) {
  const reactId = React.useId();
  const inputId = id ?? `in-${reactId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-navy-900">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={cn(inputClasses, leftIcon && "pl-10", rightSlot && "pr-12", className)}
          {...props}
        />
        {rightSlot && <span className="absolute inset-y-0 right-3 flex items-center">{rightSlot}</span>}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-danger-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
