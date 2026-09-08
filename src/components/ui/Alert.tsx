import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const styles = {
  info: { box: "border-ocean-200 bg-ocean-50 text-ocean-900", Icon: Info },
  success: { box: "border-success-500/30 bg-success-50 text-success-700", Icon: CheckCircle2 },
  warning: { box: "border-warning-500/30 bg-warning-50 text-warning-700", Icon: AlertTriangle },
  danger: { box: "border-danger-500/30 bg-danger-50 text-danger-700", Icon: XCircle },
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: keyof typeof styles;
  title?: string;
}

export function Alert({ tone = "info", title, className, children, ...props }: AlertProps) {
  const { box, Icon } = styles[tone];
  return (
    <div role={tone === "danger" || tone === "warning" ? "alert" : "status"} className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", box, className)} {...props}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && "mt-0.5")}>{children}</div>
      </div>
    </div>
  );
}
