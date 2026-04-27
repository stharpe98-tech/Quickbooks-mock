import { formatMoney } from "@/lib/money";
import type { StatusBreakdown } from "@/lib/db/dashboard";

const SIZE = 180;
const STROKE = 28;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Slice = {
  key: "draft" | "sent" | "paid";
  label: string;
  value: number;
  color: string;
  swatch: string;
};

export function StatusDonut({ data }: { data: StatusBreakdown }) {
  const slices: Slice[] = [
    {
      key: "paid",
      label: "Paid",
      value: data.paid.count,
      color: "#10b981",
      swatch: "bg-emerald-500",
    },
    {
      key: "sent",
      label: "Sent",
      value: data.sent.count,
      color: "#f59e0b",
      swatch: "bg-amber-500",
    },
    {
      key: "draft",
      label: "Draft",
      value: data.draft.count,
      color: "#94a3b8",
      swatch: "bg-slate-400",
    },
  ];

  const total = data.total_count;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Invoice status breakdown"
        className="shrink-0"
      >
        {/* Track ring */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={STROKE}
        />
        {total > 0 &&
          slices.map((slice) => {
            if (slice.value === 0) return null;
            const fraction = slice.value / total;
            const length = CIRCUMFERENCE * fraction;
            const dashArray = `${length} ${CIRCUMFERENCE - length}`;
            const dashOffset = -offset;
            offset += length;
            return (
              <circle
                key={slice.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={STROKE}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              >
                <title>{`${slice.label}: ${slice.value}`}</title>
              </circle>
            );
          })}
        <text
          x={SIZE / 2}
          y={SIZE / 2 - 4}
          textAnchor="middle"
          className="fill-slate-900"
          style={{ fontSize: "26px", fontWeight: 700 }}
        >
          {total}
        </text>
        <text
          x={SIZE / 2}
          y={SIZE / 2 + 16}
          textAnchor="middle"
          className="fill-slate-500"
          style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          Invoices
        </text>
      </svg>

      <ul className="w-full space-y-2">
        {slices.map((slice) => (
          <li key={slice.key} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2.5">
              <span className={`block h-3 w-3 rounded-sm ${slice.swatch}`} aria-hidden />
              <span className="font-medium text-slate-700">{slice.label}</span>
            </div>
            <div className="text-right tabular-nums">
              <span className="font-semibold text-slate-900">{slice.value}</span>
              <span className="ml-2 text-xs text-slate-500">
                {formatMoney(data[slice.key].total_cents)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
