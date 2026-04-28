"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { recurringSchema } from "@/lib/schemas";
import { parseDollars } from "@/lib/money";
import {
  createRecurring,
  deleteRecurring,
  setRecurringActive,
} from "@/lib/db/recurring";

type FormState = { error: string | null };

export async function createRecurringAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = recurringSchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    amount: formData.get("amount"),
    category_id: formData.get("category_id"),
    account_id: formData.get("account_id"),
    frequency: formData.get("frequency"),
    day_of_month: formData.get("day_of_month"),
    day_of_week: formData.get("day_of_week"),
    start_date: formData.get("start_date"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const cents = parseDollars(parsed.data.amount);
  if (cents === null) return { error: "Invalid amount" };

  try {
    await createRecurring({
      name: parsed.data.name,
      kind: parsed.data.kind,
      amount_cents: cents,
      category_id: parsed.data.category_id,
      account_id: parsed.data.account_id,
      frequency: parsed.data.frequency,
      day_of_month: parsed.data.day_of_month ? parseInt(parsed.data.day_of_month, 10) : undefined,
      day_of_week: parsed.data.day_of_week ? parseInt(parsed.data.day_of_week, 10) : undefined,
      start_date: parsed.data.start_date,
      notes: parsed.data.notes,
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/recurring");
  revalidatePath("/dashboard");
  redirect("/recurring");
}

export async function toggleRecurringActiveAction(id: string, active: boolean): Promise<void> {
  await setRecurringActive(id, active);
  revalidatePath("/recurring");
}

export async function deleteRecurringAction(id: string): Promise<void> {
  await deleteRecurring(id);
  revalidatePath("/recurring");
  revalidatePath("/dashboard");
}
