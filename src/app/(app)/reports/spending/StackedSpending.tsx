import { formatMoney } from "@/lib/money";
import type { SpendingByMonth } from "@/lib/db/reports";

const PALETTE = [
  "#f43f5e", "#f59e0b", "#10b981", "#0ea5e9", "#8b5cf6",
  "#ec4899", "#14b8a6", "#6366f1", "#84cc16", "#06b6d4",
  "#a855f7", "#22c55e",
];

const HEIGHT = 220;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 28;
const PLOT = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

export function StackedSpending({
  months,
  categories,
}: {
  months: SpendingByMonth[];
  categories: { id: string; name: string; total_cents: number }[];
}) {
  const max = Math.max(1, ...months.map((m) => m.total_cents));
  const TOP_N = 8;
  const top = categories.slice(0, TOP_N);
  const restIds = new Set(categories.slice(TOP_N).map((c) => c.id));

  const allZero = months.every((m) => m.total_cents === 0);
  const colorOf = (id: string) => {
    const i = top.findIndex((c) => c.id === id);
    return i === -1 ? "#94a3b8" /* slate-400 = "Other" */ : PALETTE[i % PALETTE.length];
  };

  const barWidth = 24;
  const groupGap = 8;
  const totalWidth = months.length * (barWidth + groupGap);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-xs">
        {top.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5 text-slate-600">
            <span className="block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colorOf(c.id) }} />
            {c.name}
          </span>
        ))}
        {restIds.size > 0 && (
          <span className="inline-flex items-center gap-1.5 text-slate-600">
            <span className="block h-2.5 w-2.5 rounded-sm bg-slate-400" />
            Other ({restIds.size})
          </span>
        )}
      </div>

      <div className="relative">
        {allZero && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Nothing to chart yet.
          </p>
        )}

        <svg
          viewBox={`0 0 ${totalWidth} ${HEIGHT}`}
          width="100%"
          height={HEIGHT}
          role="img"
          aria-label="Spending stacked by category, last 12 months"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <line
            x1={0}
            x2={totalWidth}
            y1={HEIGHT - PADDING_BOTTOM}
            y2={HEIGHT - PADDING_BOTTOM}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          {months.map((m, i) => {
            const x = i * (barWidth + groupGap);
            // Stack: top categories first, then "Other".
            let yCursor = HEIGHT - PADDING_BOTTOM;
            const segments: { color: string; y: number; height: number; name: string; cents: number }[] = [];
            for (const c of top) {
              const cents = m.byCategory[c.id]?.total_cents ?? 0;
              if (cents === 0) continue;
              const h = (cents / max) * PLOT;
              yCursor -= h;
              segments.push({
                color: colorOf(c.id),
                y: yCursor,
                height: h,
                name: c.name,
                cents,
              });
            }
            // "Other"
            let otherCents = 0;
            for (const id of Object.keys(m.byCategory)) {
              if (restIds.has(id)) otherCents += m.byCategory[id]?.total_cents ?? 0;
            }
            if (otherCents > 0) {
              const h = (otherCents / max) * PLOT;
              yCursor -= h;
              segments.push({
                color: "#94a3b8",
                y: yCursor,
                height: h,
                name: "Other",
                cents: otherCents,
              });
            }

            return (
              <g key={m.month}>
                {segments.map((s, idx) => (
                  <rect
                    key={idx}
                    x={x}
                    y={s.y}
                    width={barWidth}
                    height={s.height}
                    fill={s.color}
                    rx={2}
                  >
                    <title>{`${m.label}: ${s.name} ${formatMoney(s.cents)}`}</title>
                  </rect>
                ))}
                <text
                  x={x + barWidth / 2}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className="fill-slate-500"
                  style={{ fontSize: "11px" }}
                >
                  {m.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
