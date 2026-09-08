import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-field)] font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500 select-none",
  {
    variants: {
      variant: {
        primary: "bg-sunrise-500 text-white shadow-sm hover:bg-sunrise-600 active:bg-sunrise-700",
        secondary: "bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950",
        outline: "border border-slate-300 bg-white text-navy-900 hover:border-navy-300 hover:bg-slate-50",
        ghost: "text-navy-900 hover:bg-slate-100",
        link: "text-ocean-700 underline-offset-4 hover:underline px-0 h-auto",
        danger: "bg-danger-600 text-white hover:bg-danger-700",
        white: "bg-white text-navy-900 shadow-sm hover:bg-slate-100",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
      full: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Common = VariantProps<typeof buttonVariants> & {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButton = Common & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = Common & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; prefetch?: boolean };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant, size, full, loading, leftIcon, rightIcon, className, children, ...rest } = props;
  const classes = cn(buttonVariants({ variant, size, full }), className);
  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </>
  );
  if ("href" in rest && rest.href !== undefined) {
    const { href, prefetch, ...anchor } = rest as ButtonAsLink;
    return (
      <Link href={href} prefetch={prefetch} className={classes} {...anchor}>
        {content}
      </Link>
    );
  }
  const { type = "button", disabled, ...button } = rest as ButtonAsButton;
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...button}>
      {content}
    </button>
  );
}
