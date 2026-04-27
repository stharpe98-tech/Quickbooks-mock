import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, FileText } from "lucide-react";
import { getInvoice } from "@/lib/db/invoices";
import { formatMoney } from "@/lib/money";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { InvoiceStatusForm } from "./InvoiceStatusForm";
import { DeleteInvoiceButton } from "./DeleteInvoiceButton";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id);
  if (!invoice) notFound();

  return (
    <>
      <PageHeader
        title={`Invoice · ${format(new Date(invoice.issue_date), "MMM d, yyyy")}`}
        description={invoice.customer?.name ?? "Customer removed"}
        section="invoices"
        icon={FileText}
        actions={
          <Link href="/invoices">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Line items
            </h2>
            <StatusBadge status={invoice.status} />
          </div>

          <Table>
            <THead>
              <TR>
                <TH>Description</TH>
                <TH className="text-right">Qty</TH>
                <TH className="text-right">Unit</TH>
                <TH className="text-right">Total</TH>
              </TR>
            </THead>
            <TBody>
              {invoice.line_items.map((li) => (
                <TR key={li.id}>
                  <TD className="whitespace-normal">{li.description}</TD>
                  <TD className="text-right tabular-nums">{li.quantity}</TD>
                  <TD className="text-right tabular-nums">{formatMoney(li.unit_price_cents)}</TD>
                  <TD className="text-right tabular-nums font-medium">
                    {formatMoney(li.line_total_cents)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>

          <div className="mt-6 flex justify-end">
            <div className="rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 px-6 py-4 text-white shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Total
              </p>
              <p className="text-2xl font-bold tabular-nums sm:text-3xl">
                {formatMoney(invoice.total_cents)}
              </p>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notes
              </p>
              {invoice.notes}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Details
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Customer</dt>
                <dd className="text-slate-900">
                  {invoice.customer ? (
                    <Link
                      href={`/customers/${invoice.customer.id}`}
                      className="text-sky-700 hover:underline"
                    >
                      {invoice.customer.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Issued</dt>
                <dd className="text-slate-900">
                  {format(new Date(invoice.issue_date), "MMM d, yyyy")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Due</dt>
                <dd className="text-slate-900">
                  {invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "—"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Status
            </h2>
            <InvoiceStatusForm id={invoice.id} status={invoice.status} />
            <div className="mt-6 border-t border-slate-200 pt-4">
              <DeleteInvoiceButton id={invoice.id} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
