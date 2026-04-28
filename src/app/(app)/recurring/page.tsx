import Link from "next/link";
import { format } from "date-fns";
import { Plus, RefreshCw, Sparkles } from "lucide-react";
import { listRecurring } from "@/lib/db/recurring";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { ToggleActiveButton } from "./ToggleActiveButton";
import { DeleteRecurringButton } from "./DeleteRecurringButton";

export const dynamic = "force-dynamic";

const FREQ_LABEL: Record<string, string> = { weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" };

export default async function RecurringPage() {
  const items = await listRecurring();
  const active = items.filter((r) => r.active);
  const monthlyIncome = active
    .filter((r) => r.kind === "income" && r.frequency === "monthly")
    .reduce((s, r) => s + r.amount_cents, 0);
  const monthlyExpense = active
    .filter((r) => r.kind === "expense" && r.frequency === "monthly")
    .reduce((s, r) => s + r.amount_cents, 0);

  return (
    <>
      <PageHeader
        title="Recurring"
        description={
          items.length === 0
            ? "Auto-create monthly bills, paychecks, subscriptions."
            : `${active.length} active · ${formatMoney(monthlyIncome - monthlyExpense)} net per month`
        }
        section="recurring"
        icon={RefreshCw}
        actions={
          <Link href="/recurring/new">
            <Button>
              <Plus className="h-4 w-4" />
              New recurring
            </Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="Nothing scheduled."
          hint="Add rent, Netflix, your paycheck — they'll auto-post on schedule."
          icon={Sparkles}
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Kind</TH>
              <TH>Frequency</TH>
              <TH>Next run</TH>
              <TH className="text-right">Amount</TH>
              <TH />
              <TH />
            </TR>
          </THead>
          <TBody>
            {items.map((r) => (
              <TR key={r.id} className={r.active ? "" : "opacity-50"}>
                <TD className="font-medium text-slate-900">{r.name}</TD>
                <TD>
                  {r.kind === "income" ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">
                      Income
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800 ring-1 ring-inset ring-rose-200">
                      Expense
                    </span>
                  )}
                </TD>
                <TD className="text-slate-600">{FREQ_LABEL[r.frequency]}</TD>
                <TD className="text-slate-600">{format(new Date(r.next_run_date), "MMM d, yyyy")}</TD>
                <TD className={`text-right tabular-nums font-semibold ${r.kind === "income" ? "text-emerald-700" : "text-rose-700"}`}>
                  {r.kind === "income" ? "+" : "−"}
                  {formatMoney(r.amount_cents)}
                </TD>
                <TD className="text-right">
                  <ToggleActiveButton id={r.id} active={r.active} />
                </TD>
                <TD className="text-right">
                  <DeleteRecurringButton id={r.id} name={r.name} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
