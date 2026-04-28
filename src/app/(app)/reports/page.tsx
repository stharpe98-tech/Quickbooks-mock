import Link from "next/link";
import { ArrowDownRight, BarChart3, FileBarChart, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

const REPORTS = [
  {
    href: "/reports/profit-loss",
    title: "Profit & Loss",
    description: "Income vs expenses for any month, broken down by category.",
    gradient: "bg-gradient-to-br from-emerald-400 to-teal-600",
    icon: FileBarChart,
  },
  {
    href: "/reports/spending",
    title: "Spending Trend",
    description: "Last 12 months of spending, stacked by category.",
    gradient: "bg-gradient-to-br from-rose-400 to-rose-600",
    icon: TrendingUp,
  },
];

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="What's happening with your money over time."
        section="reports"
        icon={BarChart3}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <Link key={r.href} href={r.href}>
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md ${r.gradient}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{r.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{r.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
        <Card className="border-dashed bg-slate-50/40">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
              <ArrowDownRight className="h-6 w-6" />
            </span>
            <div>
              <p className="text-base font-semibold text-slate-700">More reports coming</p>
              <p className="mt-1 text-sm text-slate-500">
                Net Worth Over Time, Budget Progress, Habit Completion. Soon.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
