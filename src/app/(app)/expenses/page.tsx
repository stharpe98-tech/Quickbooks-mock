import Link from "next/link";
import { format } from "date-fns";
import { listExpenses } from "@/lib/db/expenses";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { DeleteExpenseButton } from "./DeleteExpenseButton";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await listExpenses();
  const total = expenses.reduce((sum, e) => sum + e.amount_cents, 0);

  return (
    <>
      <PageHeader
        title="Expenses"
        description={`${expenses.length} expense${expenses.length === 1 ? "" : "s"} · total ${formatMoney(total)}`}
        actions={
          <Link href="/expenses/new">
            <Button>+ New expense</Button>
          </Link>
        }
      />

      {expenses.length === 0 ? (
        <EmptyState title="No expenses logged yet." hint="Track money going out to see your net." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Date</TH>
              <TH>Vendor</TH>
              <TH>Category</TH>
              <TH className="text-right">Amount</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {expenses.map((e) => (
              <TR key={e.id}>
                <TD className="text-slate-600">
                  {format(new Date(e.expense_date), "MMM d, yyyy")}
                </TD>
                <TD className="font-medium text-slate-900">{e.vendor}</TD>
                <TD className="text-slate-600">{e.category ?? "—"}</TD>
                <TD className="text-right tabular-nums">{formatMoney(e.amount_cents)}</TD>
                <TD className="text-right">
                  <DeleteExpenseButton id={e.id} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
