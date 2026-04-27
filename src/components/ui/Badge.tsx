import { clsx } from "clsx";
import type { ReactNode } from "react";
import type { InvoiceStatus } from "@/lib/db/types";

const statusStyles: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
};

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge className={statusStyles[status]}>{status}</Badge>;
}
