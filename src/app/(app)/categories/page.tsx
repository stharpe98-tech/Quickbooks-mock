import { ArrowDownCircle, ArrowUpCircle, Tags } from "lucide-react";
import { listCategories } from "@/lib/db/categories";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/Table";
import { CategoryForm } from "./CategoryForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";
import { SeedCategoriesButton } from "./SeedCategoriesButton";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [income, expense] = await Promise.all([
    listCategories("income"),
    listCategories("expense"),
  ]);
  const allEmpty = income.length === 0 && expense.length === 0;

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organize income and expenses for cleaner reports."
        section="categories"
        icon={Tags}
        actions={allEmpty ? <SeedCategoriesButton /> : undefined}
      />

      {allEmpty ? (
        <EmptyState
          title="No categories yet."
          hint="Click 'Seed defaults' to add a starter set, or create your own below."
          icon={Tags}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
              <ArrowUpCircle className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Income categories
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {income.length === 0 ? (
              <li className="py-3 text-sm text-slate-500">None yet.</li>
            ) : (
              income.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-medium text-slate-900">{c.name}</span>
                  <DeleteCategoryButton id={c.id} name={c.name} />
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <CategoryForm kind="income" />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 text-white">
              <ArrowDownCircle className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Expense categories
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {expense.length === 0 ? (
              <li className="py-3 text-sm text-slate-500">None yet.</li>
            ) : (
              expense.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-medium text-slate-900">{c.name}</span>
                  <DeleteCategoryButton id={c.id} name={c.name} />
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <CategoryForm kind="expense" />
          </div>
        </Card>
      </div>
    </>
  );
}
