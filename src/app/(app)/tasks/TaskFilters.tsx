"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { CalendarClock, CheckCircle2, Circle, Clock, ListFilter } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Option = { value: string; label: string; icon: LucideIcon };

const OPTIONS: Option[] = [
  { value: "open", label: "Open", icon: Circle },
  { value: "today", label: "Today", icon: CalendarClock },
  { value: "overdue", label: "Overdue", icon: Clock },
  { value: "completed", label: "Done", icon: CheckCircle2 },
  { value: "all", label: "All", icon: ListFilter },
];

const activeStyles: Record<string, string> = {
  open: "bg-violet-500 text-white shadow",
  today: "bg-amber-500 text-white shadow",
  overdue: "bg-rose-500 text-white shadow",
  completed: "bg-emerald-500 text-white shadow",
  all: "bg-slate-900 text-white shadow",
};

export function TaskFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("filter") ?? "open";
  const [isPending, startTransition] = useTransition();

  function setFilter(next: string) {
    const sp = new URLSearchParams(params.toString());
    if (next === "open") sp.delete("filter");
    else sp.set("filter", next);
    const qs = sp.toString();
    startTransition(() => {
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    });
  }

  return (
    <div
      role="tablist"
      aria-label="Filter tasks"
      className={clsx(
        "inline-flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm",
        isPending && "opacity-70",
      )}
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setFilter(opt.value)}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              active ? activeStyles[opt.value] : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
