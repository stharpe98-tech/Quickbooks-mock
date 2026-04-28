"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { CheckCircle2, CircleDashed, ListFilter, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InvoiceStatus } from "@/lib/db/types";

type Option = { value: InvoiceStatus | "all"; label: string; icon: LucideIcon };

const OPTIONS: Option[] = [
  { value: "all", label: "All", icon: ListFilter },
  { value: "draft", label: "Draft", icon: CircleDashed },
  { value: "sent", label: "Sent", icon: Send },
  { value: "paid", label: "Paid", icon: CheckCircle2 },
];

const activeStyles: Record<Option["value"], string> = {
  all: "bg-slate-900 text-white shadow",
  draft: "bg-slate-700 text-white shadow",
  sent: "bg-amber-500 text-white shadow",
  paid: "bg-emerald-500 text-white shadow",
};

export function StatusFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const current = (params.get("status") ?? "all") as Option["value"];
  const [isPending, startTransition] = useTransition();

  function setStatus(next: Option["value"]) {
    const sp = new URLSearchParams(params.toString());
    if (next === "all") sp.delete("status");
    else sp.set("status", next);
    const qs = sp.toString();
    startTransition(() => {
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    });
  }

  return (
    <div
      role="tablist"
      aria-label="Filter by status"
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
            onClick={() => setStatus(opt.value)}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? activeStyles[opt.value]
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
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
