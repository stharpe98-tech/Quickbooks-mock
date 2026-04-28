import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Download,
  Landmark,
  Scale,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getBalanceSheet, type BalanceSheetGroup } from "@/lib/db/reports";
import { formatMoney } from "@/lib/money";
import type { AccountKind } from "@/lib/db/types";
import { Button } from "@/components/ui/Button";
import { Card, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

const KIND_ICON: Record<AccountKind, LucideIcon> = {
  checking: Banknote,
  savings: Landmark,
  cash: Wallet,
  investment: Landmark,
  other: Wallet,
  credit_card: CreditCard,
  loan: CreditCard,
};

export default async function BalanceSheetPage() {
  const sheet = await getBalanceSheet();
  const asOf = format(new Date(sheet.as_of), "MMMM d, yyyy");
  const hasAccounts = sheet.asset_groups.length + sheet.liability_groups.length > 0;
  const netGradient =
    sheet.net_worth_cents >= 0
      ? "bg-gradient-to-br from-emerald-400 to-teal-600"
      : "bg-gradient-to-br from-rose-400 to-rose-600";

  return (
    <>
      <PageHeader
        title="Balance Sheet"
        description={`As of ${asOf}`}
        section="reports"
        icon={Scale}
        actions={
          <>
            <Link href="/reports">
              <Button variant="secondary">
                <ArrowLeft className="h-4 w-4" />
                Reports
              </Button>
            </Link>
            <a href="/api/reports/balance-sheet/csv">
              <Button variant="secondary">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </a>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Assets"
          value={formatMoney(sheet.assets_cents)}
          gradient="bg-gradient-to-br from-emerald-400 to-teal-600"
          icon={Banknote}
        />
        <StatCard
          label="Liabilities"
          value={formatMoney(sheet.liabilities_cents)}
          gradient="bg-gradient-to-br from-rose-400 to-rose-600"
          icon={CreditCard}
        />
        <StatCard
          label="Net Worth"
          value={formatMoney(sheet.net_worth_cents)}
          hint={sheet.net_worth_cents >= 0 ? "Above water" : "Underwater"}
          gradient={netGradient}
          icon={Scale}
        />
      </div>

      {!hasAccounts ? (
        <Card>
          <p className="text-sm text-slate-500">
            No accounts yet. Add one in{" "}
            <Link href="/accounts" className="font-semibold text-indigo-600 hover:underline">
              Accounts
            </Link>{" "}
            or connect a bank in{" "}
            <Link href="/connections" className="font-semibold text-indigo-600 hover:underline">
              Connections
            </Link>
            .
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-slate-500">
              <span>Assets</span>
              <span className="tabular-nums text-emerald-700">
                {formatMoney(sheet.assets_cents)}
              </span>
            </h2>
            {sheet.asset_groups.length === 0 ? (
              <p className="text-sm text-slate-500">No assets.</p>
            ) : (
              <GroupList groups={sheet.asset_groups} accent="emerald" />
            )}
          </Card>
          <Card>
            <h2 className="mb-4 flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-slate-500">
              <span>Liabilities</span>
              <span className="tabular-nums text-rose-700">
                {formatMoney(sheet.liabilities_cents)}
              </span>
            </h2>
            {sheet.liability_groups.length === 0 ? (
              <p className="text-sm text-slate-500">No liabilities.</p>
            ) : (
              <GroupList groups={sheet.liability_groups} accent="rose" />
            )}
          </Card>
        </div>
      )}
    </>
  );
}

function GroupList({
  groups,
  accent,
}: {
  groups: BalanceSheetGroup[];
  accent: "emerald" | "rose";
}) {
  const totalLabelClass =
    accent === "emerald" ? "text-emerald-700" : "text-rose-700";
  return (
    <div className="space-y-5">
      {groups.map((g) => {
        const Icon = KIND_ICON[g.kind];
        return (
          <div key={g.kind}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Icon className="h-4 w-4 text-slate-400" />
                {g.label}
              </div>
              <span className={`text-sm font-semibold tabular-nums ${totalLabelClass}`}>
                {formatMoney(g.total_cents)}
              </span>
            </div>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/40">
              {g.rows.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span className="text-slate-700">{r.name}</span>
                  <span className="tabular-nums text-slate-900">
                    {formatMoney(r.balance_cents)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
