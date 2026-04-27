import Link from "next/link";
import { format } from "date-fns";
import { listInvoices } from "@/lib/db/invoices";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await listInvoices();

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Bills you've sent to customers."
        actions={
          <Link href="/invoices/new">
            <Button>+ New invoice</Button>
          </Link>
        }
      />

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet."
          hint="Create your first invoice to start tracking income."
        />
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
                    className="font-medium text-indigo-700 hover:underline"
                  >
                    {format(new Date(inv.issue_date), "MMM d, yyyy")}
                  </Link>
                </TD>
                <TD className="text-slate-700">{inv.customer?.name ?? "—"}</TD>
                <TD>
                  <StatusBadge status={inv.status} />
                </TD>
                <TD className="text-right tabular-nums">{formatMoney(inv.total_cents)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
