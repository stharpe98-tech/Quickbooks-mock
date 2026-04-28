import Link from "next/link";
import { addMonths, format, parse, subMonths } from "date-fns";
import { ArrowLeft, ChevronLeft, ChevronRight, FileBarChart } from "lucide-react";
import { getProfitLossReport } from "@/lib/db/reports";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Card, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

const MONTH_RE = /^\d{4}-\d{2}$/;

export default async function ProfitLossPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const monthIso = MONTH_RE.test(searchParams.month ?? "")
    ? (searchParams.month as string)
    : format(new Date(), "yyyy-MM");
  const monthDate = parse(monthIso, "yyyy-MM", new Date());
  const prevMonth = format(subMonths(monthDate, 1), "yyyy-MM");
  const nextMonth = format(addMonths(monthDate, 1), "yyyy-MM");

  const report = await getProfitLossReport(monthIso);
  const hasData = report.income_cents > 0 || report.expense_cents > 0;

  const netGradient =
    report.net_cents >= 0
      ? "bg-gradient-to-br from-emerald-400 to-teal-600"
      : "bg-gradient-to-br from-rose-400 to-rose-600";

  return (
    <>
      <PageHeader
        title="Profit & Loss"
        description={report.period_label}
        section="reports"
        icon={FileBarChart}
        actions={
          <>
            <Link href="/reports">
              <Button variant="secondary">
                <ArrowLeft className="h-4 w-4" />
                Reports
              </Button>
            </Link>
            <div className="flex gap-1">
              <Link href={`?month=${prevMonth}`}>
                <Button variant="secondary" size="sm" aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`?month=${nextMonth}`}>
                <Button variant="secondary" size="sm" aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Income"
          value={formatMoney(report.income_cents)}
          gradient="bg-gradient-to-br from-emerald-400 to-teal-600"
          icon={FileBarChart}
        />
        <StatCard
          label="Expenses"
          value={formatMoney(report.expense_cents)}
          gradient="bg-gradient-to-br from-rose-400 to-rose-600"
          icon={FileBarChart}
        />
        <StatCard
          label="Net"
          value={formatMoney(report.net_cents)}
          hint={report.net_cents >= 0 ? "Saved this month" : "Lost this month"}
          gradient={netGradient}
          icon={FileBarChart}
        />
      </div>

      {!hasData ? (
        <Card>
          <p className="text-sm text-slate-500">
            No income or expenses logged for {report.period_label}.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Income by category
            </h2>
            <CategoryList rows={report.income_by_category} total={report.income_cents} accent="emerald" />
          </Card>
          <Card>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Expenses by category
            </h2>
            <CategoryList rows={report.expense_by_category} total={report.expense_cents} accent="rose" />
          </Card>
        </div>
      )}
    </>
  );
}

function CategoryList({
  rows,
  total,
  accent,
}: {
  rows: { category_id: string | null; name: string; total_cents: number }[];
  total: number;
  accent: "emerald" | "rose";
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">Nothing here.</p>;
  }
  const barColor = accent === "emerald"
    ? "bg-gradient-to-r from-emerald-400 to-teal-600"
    : "bg-gradient-to-r from-rose-400 to-rose-600";

  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const pct = total > 0 ? (r.total_cents / total) * 100 : 0;
        return (
          <li key={(r.category_id ?? "x") + r.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{r.name}</span>
              <span className="tabular-nums text-slate-900">{formatMoney(r.total_cents)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
