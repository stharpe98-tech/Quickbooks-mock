import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { getSpendingTrend } from "@/lib/db/reports";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StackedSpending } from "./StackedSpending";

export const dynamic = "force-dynamic";

export default async function SpendingTrendPage() {
  const data = await getSpendingTrend(12);
  const grandTotal = data.categories.reduce((s, c) => s + c.total_cents, 0);
  const monthlyAvg = grandTotal > 0 ? Math.round(grandTotal / 12) : 0;

  return (
    <>
      <PageHeader
        title="Spending Trend"
        description="Last 12 months · stacked by category"
        section="reports"
        icon={TrendingUp}
        actions={
          <Link href="/reports">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Reports
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">12-month total</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{formatMoney(grandTotal)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Monthly average</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{formatMoney(monthlyAvg)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Categories</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{data.categories.length}</p>
        </Card>
      </div>

      <Card>
        <StackedSpending months={data.months} categories={data.categories} />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Top categories (12 months)
        </h2>
        <ul className="space-y-3">
          {data.categories.slice(0, 12).map((c) => {
            const pct = grandTotal > 0 ? (c.total_cents / grandTotal) * 100 : 0;
            return (
              <li key={c.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <span className="tabular-nums text-slate-900">
                    {formatMoney(c.total_cents)}{" "}
                    <span className="text-xs text-slate-400">({pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
