import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      {...props}
      className={clsx(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative" | "warn";
}) {
  const toneClass = {
    default: "text-slate-900",
    positive: "text-emerald-600",
    negative: "text-red-600",
    warn: "text-amber-600",
  }[tone];

  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={clsx("mt-2 text-2xl font-semibold tabular-nums sm:text-3xl", toneClass)}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}
