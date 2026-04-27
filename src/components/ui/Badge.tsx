import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { CircleDashed, Send, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import type { InvoiceStatus } from "@/lib/db/types";

const statusStyles: Record<InvoiceStatus, { className: string; icon: LucideIcon }> = {
  draft: {
    className: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
    icon: CircleDashed,
  },
  sent: {
    className: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200",
    icon: Send,
  },
  paid: {
    className: "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200",
    icon: CheckCircle2,
  },
};

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { className, icon: Icon } = statusStyles[status];
  return (
    <Badge className={className}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}
