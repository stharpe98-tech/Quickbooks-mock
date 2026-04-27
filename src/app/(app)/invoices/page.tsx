import Link from "next/link";
import { format } from "date-fns";
import { FileText, Plus, FilePlus2, SearchX } from "lucide-react";
import { listInvoices } from "@/lib/db/invoices";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { accents } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? "";
  const invoices = await listInvoices(query);

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Bills you've sent to customers."
        section="invoices"
        icon={FileText}
        actions={
          <Link href="/invoices/new">
            <Button>
              <Plus className="h-4 w-4" />
              New invoice
            </Button>
          </Link>
        }
      />

      <SearchBar placeholder="Search by customer, status, or notes…" />

      {invoices.length === 0 ? (
        query ? (
          <EmptyState
            title={`No invoices match "${query}".`}
            hint="Try a different search term."
            icon={SearchX}
          />
        ) : (
          <EmptyState
            title="No invoices yet."
            hint="Create your first invoice to start tracking income."
            icon={FilePlus2}
            gradient={accents.invoices.gradient}
          />
        )
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Issued</TH>
              <TH>Customer</TH>
              <TH>Status</TH>
              <TH className="text-right">Total</TH>
            </TR>
          </THead>
          <TBody>
            {invoices.map((inv) => (
              <TR key={inv.id}>
                <TD>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="font-medium text-violet-700 hover:text-violet-900 hover:underline"
                  >
                    {format(new Date(inv.issue_date), "MMM d, yyyy")}
                  </Link>
                </TD>
                <TD className="text-slate-700">{inv.customer?.name ?? "—"}</TD>
                <TD>
                  <StatusBadge status={inv.status} />
                </TD>
                <TD className="text-right tabular-nums font-semibold text-slate-900">
                  {formatMoney(inv.total_cents)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
