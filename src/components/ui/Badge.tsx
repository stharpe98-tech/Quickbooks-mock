import { clsx } from "clsx";
import type { ReactNode } from "react";

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

export function PriorityBadge({ priority }: { priority: number }) {
  const styles =
    priority >= 3
      ? "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-200"
      : priority === 2
      ? "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200"
      : priority === 1
      ? "bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-200"
      : "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
  const label = priority >= 3 ? "Urgent" : priority === 2 ? "High" : priority === 1 ? "Med" : "Low";
  return <Badge className={styles}>{label}</Badge>;
}
