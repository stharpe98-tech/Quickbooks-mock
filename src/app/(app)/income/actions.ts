"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { incomeSchema } from "@/lib/schemas";
import { parseDollars } from "@/lib/money";
import { createIncome, deleteIncome } from "@/lib/db/income";

type FormState = { error: string | null };

export async function createIncomeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = incomeSchema.safeParse({
    date: formData.get("date"),
    source: formData.get("source"),
    amount: formData.get("amount"),
    category_id: formData.get("category_id"),
    account_id: formData.get("account_id"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const cents = parseDollars(parsed.data.amount);
  if (cents === null) return { error: "Invalid amount" };

  try {
    await createIncome({
      date: parsed.data.date,
      source: parsed.data.source,
      amount_cents: cents,
      category_id: parsed.data.category_id,
      account_id: parsed.data.account_id,
      notes: parsed.data.notes,
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/income");
  revalidatePath("/dashboard");
  redirect("/income");
}

export async function deleteIncomeAction(id: string): Promise<void> {
  await deleteIncome(id);
  revalidatePath("/income");
  revalidatePath("/dashboard");
}
