import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  CheckSquare,
  Clock,
  LayoutDashboard,
  Plus,
  Scale,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  getMoneySummary,
  getMonthlyTotals,
  getMonthlySpendingByCategory,
  getTaskSummary,
} from "@/lib/db/dashboard";
import { formatMoney } from "@/lib/money";
import { Card, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Table";
import { PriorityBadge } from "@/components/ui/Badge";
import { MonthlyBars } from "@/components/charts/MonthlyBars";
import { CategoryBreakdown } from "@/components/charts/CategoryBreakdown";
import { accents } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [money, monthly, byCategory, tasks] = await Promise.all([
    getMoneySummary(),
    getMonthlyTotals(6),
    getMonthlySpendingByCategory(),
    getTaskSummary(),
  ]);

  const monthLabel = format(new Date(), "MMMM");
  const netGradient =
    money.net_cents >= 0
      ? "bg-gradient-to-br from-emerald-400 to-teal-600"
      : "bg-gradient-to-br from-rose-400 to-rose-600";
  const netWorthGradient =
    money.net_worth_cents >= 0
      ? "bg-gradient-to-br from-indigo-500 to-violet-600"
      : "bg-gradient-to-br from-rose-500 to-rose-700";
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Snapshot for ${monthLabel}.`}
        section="dashboard"
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={`${monthLabel} income`}
          value={formatMoney(money.income_cents)}
          gradient="bg-gradient-to-br from-emerald-400 to-teal-600"
          icon={ArrowUpRight}
        />
        <StatCard
          label={`${monthLabel} expenses`}
          value={formatMoney(money.expense_cents)}
          gradient="bg-gradient-to-br from-rose-400 to-rose-600"
          icon={ArrowDownRight}
        />
        <StatCard
          label={`${monthLabel} net`}
          value={formatMoney(money.net_cents)}
          hint={money.net_cents >= 0 ? "In the black" : "In the red"}
          gradient={netGradient}
          icon={Scale}
        />
        <StatCard
          label="Net worth"
          value={formatMoney(money.net_worth_cents)}
          hint="Across your accounts"
          gradient={netWorthGradient}
          icon={Wallet}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <BarChart3 className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Last 6 months
              </h2>
            </div>
            <p className="text-xs text-slate-500">Income vs expenses</p>
          </div>
          <MonthlyBars data={monthly} />
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 text-white">
              <ArrowDownRight className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {monthLabel} by category
            </h2>
          </div>
          <CategoryBreakdown data={byCategory} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${accents.tasks.gradient}`}>
                <CheckSquare className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Tasks
              </h2>
            </div>
            <Link href="/tasks">
              <Button variant="secondary" size="sm">
                View all
              </Button>
            </Link>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-violet-50 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-violet-700">Open</p>
              <p className="text-xl font-bold text-violet-900">{tasks.open_count}</p>
            </div>
            <div className="rounded-lg bg-amber-50 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Today</p>
              <p className="text-xl font-bold text-amber-900">{tasks.due_today_count}</p>
            </div>
            <div className="rounded-lg bg-rose-50 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-rose-700">Overdue</p>
              <p className="text-xl font-bold text-rose-900">{tasks.overdue_count}</p>
            </div>
          </div>

          {tasks.upcoming.length === 0 ? (
            <EmptyState
              title="Nothing on the list."
              hint="Add a task to get started."
              icon={Sparkles}
              gradient={accents.tasks.gradient}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {tasks.upcoming.map((t) => {
                const overdue = t.due_at && t.due_at < todayIso;
                return (
                  <li key={t.id} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{t.title}</p>
                      <p className="text-xs text-slate-500">
                        {t.due_at ? (
                          <span className={overdue ? "text-rose-700" : ""}>
                            <CalendarClock className="mr-1 inline h-3 w-3" />
                            {format(new Date(t.due_at), "MMM d, yyyy")}
                            {overdue ? " · overdue" : ""}
                          </span>
                        ) : (
                          "No due date"
                        )}
                      </p>
                    </div>
                    {t.priority > 0 && <PriorityBadge priority={t.priority} />}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4 flex justify-end">
            <Link href="/tasks/new">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                New task
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${accents.income.gradient}`}>
                <Clock className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Recent activity
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Income
              </p>
              {money.recent_income.length === 0 ? (
                <p className="text-sm text-slate-500">No income yet this month.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {money.recent_income.slice(0, 3).map((r) => (
                    <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="truncate text-slate-700">{r.source}</span>
                      <span className="font-semibold tabular-nums text-emerald-700">
                        +{formatMoney(r.amount_cents)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Expenses
              </p>
              {money.recent_expenses.length === 0 ? (
                <p className="text-sm text-slate-500">No expenses yet this month.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {money.recent_expenses.slice(0, 3).map((r) => (
                    <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="truncate text-slate-700">{r.vendor}</span>
                      <span className="font-semibold tabular-nums text-rose-700">
                        −{formatMoney(r.amount_cents)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
