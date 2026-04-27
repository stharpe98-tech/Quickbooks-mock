import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  FileText,
  LayoutDashboard,
  Receipt,
  Scale,
  Sparkles,
} from "lucide-react";
import { getDashboardSummary } from "@/lib/db/dashboard";
import { formatMoney } from "@/lib/money";
import { Card, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Table";
import { accents } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const netGradient =
    summary.net_cents >= 0
      ? "bg-gradient-to-br from-emerald-400 to-teal-600"
      : "bg-gradient-to-br from-rose-400 to-rose-600";

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A snapshot of where things stand."
        section="dashboard"
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Income"
          value={formatMoney(summary.income_cents)}
          hint="Paid invoices"
          gradient="bg-gradient-to-br from-emerald-400 to-teal-600"
          icon={ArrowUpRight}
        />
        <StatCard
          label="Expenses"
          value={formatMoney(summary.expense_cents)}
          hint="Money out"
          gradient="bg-gradient-to-br from-rose-400 to-rose-600"
          icon={ArrowDownRight}
        />
        <StatCard
          label="Net"
          value={formatMoney(summary.net_cents)}
          hint={summary.net_cents >= 0 ? "In the black" : "In the red"}
          gradient={netGradient}
          icon={Scale}
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(summary.outstanding_cents)}
          hint="Draft + sent"
          gradient="bg-gradient-to-br from-amber-400 to-orange-600"
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${accents.invoices.gradient}`}>
                <FileText className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Recent invoices
              </h2>
            </div>
            <Link
              href="/invoices"
              className="text-sm font-medium text-violet-700 hover:text-violet-900 hover:underline"
            >
              View all →
            </Link>
          </div>
          {summary.recent_invoices.length === 0 ? (
            <EmptyState
              title="No invoices yet."
              hint="Create one to start tracking income."
              icon={Sparkles}
              gradient={accents.invoices.gradient}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {summary.recent_invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-violet-700"
                    >
                      {inv.customer?.name ?? "—"}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {format(new Date(inv.issue_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={inv.status} />
                    <span className="text-sm font-semibold tabular-nums text-slate-900">
                      {formatMoney(inv.total_cents)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${accents.expenses.gradient}`}>
                <Receipt className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Recent expenses
              </h2>
            </div>
            <Link
              href="/expenses"
              className="text-sm font-medium text-amber-700 hover:text-amber-900 hover:underline"
            >
              View all →
            </Link>
          </div>
          {summary.recent_expenses.length === 0 ? (
            <EmptyState
              title="No expenses yet."
              hint="Log one to see your net."
              icon={Sparkles}
              gradient={accents.expenses.gradient}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {summary.recent_expenses.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{e.vendor}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(e.expense_date), "MMM d, yyyy")}
                      {e.category ? ` · ${e.category}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-slate-900">
                    {formatMoney(e.amount_cents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
