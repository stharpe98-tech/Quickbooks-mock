import { Wallet } from "lucide-react";
import { listAccounts, getNetWorthCents } from "@/lib/db/accounts";
import { formatMoney } from "@/lib/money";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { accents } from "@/lib/theme";
import { AccountForm } from "./AccountForm";
import { DeleteAccountButton } from "./DeleteAccountButton";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit card",
  cash: "Cash",
  investment: "Investment",
  loan: "Loan",
  other: "Other",
};

const LIABILITY_KINDS = new Set(["credit_card", "loan"]);

export default async function AccountsPage() {
  const [accounts, net] = await Promise.all([listAccounts(), getNetWorthCents()]);

  return (
    <>
      <PageHeader
        title="Accounts"
        description="Track balances to see your net worth."
        section="accounts"
        icon={Wallet}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 p-5 text-white shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Assets</p>
          <p className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">{formatMoney(net.assets)}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 p-5 text-white shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Liabilities</p>
          <p className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">{formatMoney(net.liabilities)}</p>
        </div>
        <div
          className={`rounded-xl p-5 text-white shadow-md ${
            net.net >= 0
              ? "bg-gradient-to-br from-indigo-500 to-violet-600"
              : "bg-gradient-to-br from-rose-500 to-rose-700"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Net worth</p>
          <p className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">{formatMoney(net.net)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Your accounts
          </h2>
          {accounts.length === 0 ? (
            <EmptyState
              title="No accounts yet."
              hint="Add your checking, savings, or credit card to track net worth."
              icon={Wallet}
              gradient={accents.accounts.gradient}
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Kind</TH>
                  <TH className="text-right">Balance</TH>
                  <TH />
                </TR>
              </THead>
              <TBody>
                {accounts.map((a) => (
                  <TR key={a.id}>
                    <TD className="font-medium text-slate-900">{a.name}</TD>
                    <TD className="text-slate-600">{KIND_LABELS[a.kind] ?? a.kind}</TD>
                    <TD
                      className={`text-right tabular-nums font-semibold ${
                        LIABILITY_KINDS.has(a.kind) ? "text-rose-700" : "text-slate-900"
                      }`}
                    >
                      {LIABILITY_KINDS.has(a.kind) ? "−" : ""}
                      {formatMoney(a.balance_cents)}
                    </TD>
                    <TD className="text-right">
                      <DeleteAccountButton id={a.id} name={a.name} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </div>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Add an account
          </h2>
          <AccountForm />
        </Card>
      </div>
    </>
  );
}
