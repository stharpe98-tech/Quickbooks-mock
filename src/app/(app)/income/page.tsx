import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpCircle, Plus, Sparkles } from "lucide-react";
import { listIncome } from "@/lib/db/income";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { accents } from "@/lib/theme";
import { DeleteIncomeButton } from "./DeleteIncomeButton";

export const dynamic = "force-dynamic";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? "";
  const items = await listIncome(query);
  const total = items.reduce((s, r) => s + r.amount_cents, 0);

  return (
    <>
      <PageHeader
        title="Income"
        description={`${items.length} entr${items.length === 1 ? "y" : "ies"} · ${formatMoney(total)}`}
        section="income"
        icon={ArrowUpCircle}
        actions={
          <Link href="/income/new">
            <Button>
              <Plus className="h-4 w-4" />
              New income
            </Button>
          </Link>
        }
      />

      <SearchBar placeholder="Search by source or notes…" />

      {items.length === 0 ? (
        <EmptyState
          title={query ? `No income matches "${query}".` : "No income logged yet."}
          hint={query ? "Try a different search." : "Log a paycheck, side gig, or refund."}
          icon={Sparkles}
          gradient={accents.income.gradient}
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Date</TH>
              <TH>Source</TH>
              <TH>Category</TH>
              <TH>Account</TH>
              <TH className="text-right">Amount</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {items.map((r) => (
              <TR key={r.id}>
                <TD className="text-slate-600">{format(new Date(r.date), "MMM d, yyyy")}</TD>
                <TD className="font-medium text-slate-900">{r.source}</TD>
                <TD>
                  {r.category ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">
                      {r.category.name}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TD>
                <TD className="text-slate-600">{r.account?.name ?? "—"}</TD>
                <TD className="text-right tabular-nums font-semibold text-emerald-700">
                  +{formatMoney(r.amount_cents)}
                </TD>
                <TD className="text-right">
                  <DeleteIncomeButton id={r.id} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
