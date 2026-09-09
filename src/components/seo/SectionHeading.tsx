import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  id,
  title,
  description,
  link,
  as: Tag = "h2",
  className,
}: {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  link?: { href: string; label: string };
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-3xl">
        <Tag id={id} className={cn("scroll-mt-24", Tag === "h2" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl")}>
          {title}
        </Tag>
        {description && <p className="mt-1 text-slate-600">{description}</p>}
      </div>
      {link && (
        <Link href={link.href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-ocean-700 hover:underline">
          {link.label} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
