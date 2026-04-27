import Link from "next/link";
import { listCustomers } from "@/lib/db/customers";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { InvoiceForm } from "./InvoiceForm";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const customers = await listCustomers();

  if (customers.length === 0) {
    return (
      <>
        <PageHeader title="New invoice" />
        <Card>
          <p className="text-sm text-slate-700">
            You need a customer before you can create an invoice.
          </p>
          <div className="mt-4">
            <Link href="/customers/new">
              <Button>Create your first customer</Button>
            </Link>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="New invoice" description="Bill a customer." />
      <Card>
        <InvoiceForm customers={customers.map((c) => ({ id: c.id, name: c.name }))} />
      </Card>
    </>
  );
}
