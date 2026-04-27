import Link from "next/link";
import { format } from "date-fns";
import { getDashboardSummary } from "@/lib/db/dashboard";
import { formatMoney } from "@/lib/money";
import { Card, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Table";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A snapshot of where things stand."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Income" value={formatMoney(summary.income_cents)} hint="Paid invoices" tone="positive" />
        <StatCard label="Expenses" value={formatMoney(summary.expense_cents)} tone="negative" />
        <StatCard
          label="Net"
          value={formatMoney(summary.net_cents)}
          tone={summary.net_cents >= 0 ? "positive" : "negative"}
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(summary.outstanding_cents)}
          hint="Draft + sent"
          tone="warn"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Recent invoices
            </h2>
            <Link href="/invoices" className="text-sm font-medium text-indigo-700 hover:underline">
              View all →
            </Link>
          </div>
          {summary.recent_invoices.length === 0 ? (
            <EmptyState title="No invoices yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {summary.recent_invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-indigo-700"
                    >
                      {inv.customer?.name ?? "—"}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {format(new Date(inv.issue_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={inv.status} />
                    <span className="text-sm font-medium tabular-nums">
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
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Recent expenses
            </h2>
            <Link href="/expenses" className="text-sm font-medium text-indigo-700 hover:underline">
              View all →
            </Link>
          </div>
          {summary.recent_expenses.length === 0 ? (
            <EmptyState title="No expenses yet." />
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
                  <span className="text-sm font-medium tabular-nums">
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
