import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
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
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  /** Tailwind classes for a colored gradient (e.g. accents.dashboard.gradient). */
  gradient: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, hint, gradient, icon: Icon }: StatCardProps) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-xl p-5 text-white shadow-md sm:p-6",
        gradient,
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{label}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
          {hint && <p className="mt-1 text-xs text-white/80">{hint}</p>}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" aria-hidden />
    </div>
  );
}
