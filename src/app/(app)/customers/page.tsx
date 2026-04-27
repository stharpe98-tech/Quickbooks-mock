import Link from "next/link";
import { Mail, Phone, Plus, UserPlus, Users } from "lucide-react";
import { listCustomers } from "@/lib/db/customers";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/Table";
import { accents } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <>
      <PageHeader
        title="Customers"
        description="People and businesses you bill."
        section="customers"
        icon={Users}
        actions={
          <Link href="/customers/new">
            <Button>
              <Plus className="h-4 w-4" />
              New customer
            </Button>
          </Link>
        }
      />

      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet."
          hint="Create your first customer to start invoicing."
          icon={UserPlus}
          gradient={accents.customers.gradient}
        />
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
                  <Link
                    href={`/customers/${c.id}`}
                    className="flex items-center gap-2 font-medium text-sky-700 hover:text-sky-900 hover:underline"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                    {c.name}
                  </Link>
                </TD>
                <TD className="text-slate-600">
                  {c.email ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {c.email}
                    </span>
                  ) : (
                    "—"
                  )}
                </TD>
                <TD className="text-slate-600">
                  {c.phone ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {c.phone}
                    </span>
                  ) : (
                    "—"
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
