"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { expenseSchema } from "@/lib/schemas";
import { parseDollars } from "@/lib/money";
import { createExpense, deleteExpense } from "@/lib/db/expenses";

type FormState = { error: string | null };

export async function createExpenseAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = expenseSchema.safeParse({
    expense_date: formData.get("expense_date"),
    vendor: formData.get("vendor"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const cents = parseDollars(parsed.data.amount);
  if (cents === null) return { error: "Invalid amount" };

  try {
    await createExpense({
      expense_date: parsed.data.expense_date,
      vendor: parsed.data.vendor,
      amount_cents: cents,
      category: parsed.data.category,
      notes: parsed.data.notes,
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  redirect("/expenses");
}

export async function deleteExpenseAction(id: string): Promise<void> {
  await deleteExpense(id);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
