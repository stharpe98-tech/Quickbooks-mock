import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { listCategories } from "@/lib/db/categories";
import { listAccounts } from "@/lib/db/accounts";
import { RecurringForm } from "./RecurringForm";

export const dynamic = "force-dynamic";

export default async function NewRecurringPage() {
  const [incomeCats, expenseCats, accounts] = await Promise.all([
    listCategories("income"),
    listCategories("expense"),
    listAccounts(),
  ]);

  return (
    <>
      <PageHeader
        title="New recurring"
        description="Schedule something that repeats."
        section="recurring"
        icon={RefreshCw}
      />
      <Card>
        <RecurringForm
          incomeCategories={incomeCats.map((c) => ({ id: c.id, name: c.name }))}
          expenseCategories={expenseCats.map((c) => ({ id: c.id, name: c.name }))}
          accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
        />
      </Card>
    </>
  );
}
