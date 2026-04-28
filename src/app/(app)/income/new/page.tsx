import { ArrowUpCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { listCategories } from "@/lib/db/categories";
import { listAccounts } from "@/lib/db/accounts";
import { IncomeForm } from "./IncomeForm";

export const dynamic = "force-dynamic";

export default async function NewIncomePage() {
  const [categories, accounts] = await Promise.all([
    listCategories("income"),
    listAccounts(),
  ]);

  return (
    <>
      <PageHeader title="New income" description="Log money coming in." section="income" icon={ArrowUpCircle} />
      <Card>
        <IncomeForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
        />
      </Card>
    </>
  );
}
