import { formatMoney } from "@/lib/money";
import type { CategorySlice } from "@/lib/db/dashboard";

const PALETTE = [
  "#f43f5e", // rose
  "#f59e0b", // amber
  "#10b981", // emerald
  "#0ea5e9", // sky
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#6366f1", // indigo
];

export function CategoryBreakdown({ data }: { data: CategorySlice[] }) {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">No spending yet this month.</p>;
  }

  const total = data.reduce((s, d) => s + d.total_cents, 0);
  const top = data.slice(0, 6);

  return (
    <div className="space-y-3">
      {top.map((slice, i) => {
        const pct = total > 0 ? (slice.total_cents / total) * 100 : 0;
        const color = PALETTE[i % PALETTE.length];
        return (
          <div key={slice.category_id ?? slice.name + i}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{slice.name}</span>
              <span className="tabular-nums text-slate-600">{formatMoney(slice.total_cents)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
      {data.length > top.length && (
        <p className="pt-1 text-center text-xs text-slate-400">
          +{data.length - top.length} more
        </p>
      )}
    </div>
  );
}
