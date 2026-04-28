import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, FileText, User } from "lucide-react";
import { getCustomer } from "@/lib/db/customers";
import { listInvoicesForCustomer } from "@/lib/db/invoices";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/money";
import { accents } from "@/lib/theme";
import { CustomerForm } from "../CustomerForm";
import { DeleteCustomerButton } from "./DeleteCustomerButton";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [customer, invoices] = await Promise.all([
    getCustomer(params.id),
    listInvoicesForCustomer(params.id),
  ]);
  if (!customer) notFound();

  return (
    <>
      <PageHeader
        title={customer.name}
        description={customer.email ?? customer.phone ?? "Customer details"}
        section="customers"
        icon={User}
        actions={
          <Link href="/customers">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Edit details
          </h2>
          <CustomerForm customer={customer} />
          <div className="mt-6 border-t border-slate-200 pt-4">
            <DeleteCustomerButton id={customer.id} />
          </div>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${accents.invoices.gradient}`}>
              <FileText className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Invoices
            </h2>
          </div>
          {invoices.length === 0 ? (
            <EmptyState title="No invoices for this customer yet." icon={FileText} gradient={accents.invoices.gradient} />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Issued</TH>
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
                        className="font-medium text-violet-700 hover:underline"
                      >
                        {format(new Date(inv.issue_date), "MMM d, yyyy")}
                      </Link>
                    </TD>
                    <TD>
                      <StatusBadge status={inv.status} />
                    </TD>
                    <TD className="text-right tabular-nums">{formatMoney(inv.total_cents)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
