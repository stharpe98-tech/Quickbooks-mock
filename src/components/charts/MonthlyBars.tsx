import { formatMoney } from "@/lib/money";
import type { MonthlyBucket } from "@/lib/db/dashboard";

const HEIGHT = 180;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;
const PLOT_HEIGHT = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
const GROUP_GAP = 24;
const BAR_GAP = 4;
const BAR_WIDTH = 14;

export function MonthlyBars({ data }: { data: MonthlyBucket[] }) {
  const max = Math.max(
    1,
    ...data.flatMap((d) => [d.income_cents, d.expense_cents]),
  );

  const groupWidth = BAR_WIDTH * 2 + BAR_GAP;
  const totalWidth = data.length * groupWidth + (data.length - 1) * GROUP_GAP;

  const allZero = data.every((d) => d.income_cents === 0 && d.expense_cents === 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <span className="block h-2.5 w-2.5 rounded-sm bg-gradient-to-b from-emerald-400 to-teal-600" />
          Income
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <span className="block h-2.5 w-2.5 rounded-sm bg-gradient-to-b from-rose-400 to-rose-600" />
          Expenses
        </span>
      </div>

      <div className="relative">
        {allZero && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Nothing to chart yet — add some paid invoices and expenses.
          </p>
        )}

        <svg
          viewBox={`0 0 ${totalWidth} ${HEIGHT}`}
          width="100%"
          height={HEIGHT}
          role="img"
          aria-label="Income vs expenses by month"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="bar-income" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="bar-expense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Baseline */}
          <line
            x1={0}
            x2={totalWidth}
            y1={HEIGHT - PADDING_BOTTOM}
            y2={HEIGHT - PADDING_BOTTOM}
            stroke="#e2e8f0"
            strokeWidth={1}
          />

          {data.map((d, i) => {
            const x = i * (groupWidth + GROUP_GAP);
            const incomeH = (d.income_cents / max) * PLOT_HEIGHT;
            const expenseH = (d.expense_cents / max) * PLOT_HEIGHT;
            const baseY = HEIGHT - PADDING_BOTTOM;

            return (
              <g key={d.month}>
                <rect
                  x={x}
                  y={baseY - incomeH}
                  width={BAR_WIDTH}
                  height={incomeH}
                  rx={3}
                  fill="url(#bar-income)"
                >
                  <title>{`${d.label}: ${formatMoney(d.income_cents)} income`}</title>
                </rect>
                <rect
                  x={x + BAR_WIDTH + BAR_GAP}
                  y={baseY - expenseH}
                  width={BAR_WIDTH}
                  height={expenseH}
                  rx={3}
                  fill="url(#bar-expense)"
                >
                  <title>{`${d.label}: ${formatMoney(d.expense_cents)} expenses`}</title>
                </rect>
                <text
                  x={x + groupWidth / 2}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className="fill-slate-500"
                  style={{ fontSize: "11px" }}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
