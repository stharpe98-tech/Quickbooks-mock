import Link from "next/link";
import { listCustomers } from "@/lib/db/customers";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <>
      <PageHeader
        title="Customers"
        description="People and businesses you bill."
        actions={
          <Link href="/customers/new">
            <Button>+ New customer</Button>
          </Link>
        }
      />

      {customers.length === 0 ? (
        <EmptyState title="No customers yet." hint="Create your first customer to start invoicing." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Phone</TH>
            </TR>
          </THead>
          <TBody>
            {customers.map((c) => (
              <TR key={c.id}>
                <TD>
                  <Link href={`/customers/${c.id}`} className="font-medium text-indigo-700 hover:underline">
                    {c.name}
                  </Link>
                </TD>
                <TD className="text-slate-600">{c.email ?? "—"}</TD>
                <TD className="text-slate-600">{c.phone ?? "—"}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
