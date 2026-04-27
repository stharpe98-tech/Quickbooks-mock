import Link from "next/link";
import { format } from "date-fns";
import { Plus, Receipt, ReceiptText, SearchX } from "lucide-react";
import { listExpenses } from "@/lib/db/expenses";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { ExportCsvButton } from "@/components/ui/ExportCsvButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { accents } from "@/lib/theme";
import { DeleteExpenseButton } from "./DeleteExpenseButton";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? "";
  const expenses = await listExpenses(query);
  const total = expenses.reduce((sum, e) => sum + e.amount_cents, 0);

  return (
    <>
      <PageHeader
        title="Expenses"
        description={`${expenses.length} expense${expenses.length === 1 ? "" : "s"} · total ${formatMoney(total)}`}
        section="expenses"
        icon={Receipt}
        actions={
          <>
            <ExportCsvButton href="/api/expenses/csv" forwardParams={["q"]} />
            <Link href="/expenses/new">
              <Button>
                <Plus className="h-4 w-4" />
                New expense
              </Button>
            </Link>
          </>
        }
      />

      <SearchBar placeholder="Search by vendor, category, or notes…" />

      {expenses.length === 0 ? (
        query ? (
          <EmptyState
            title={`No expenses match "${query}".`}
            hint="Try a different search term."
            icon={SearchX}
          />
        ) : (
          <EmptyState
            title="No expenses logged yet."
            hint="Track money going out to see your net."
            icon={ReceiptText}
            gradient={accents.expenses.gradient}
          />
        )
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
                <TD>
                  {e.category ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                      {e.category}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TD>
                <TD className="text-right tabular-nums font-semibold text-slate-900">
                  {formatMoney(e.amount_cents)}
                </TD>
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
