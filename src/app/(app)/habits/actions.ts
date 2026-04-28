"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { habitSchema } from "@/lib/schemas";
import { adjustEntry, createHabit, deleteHabit } from "@/lib/db/habits";

type FormState = { error: string | null };

export async function createHabitAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = habitSchema.safeParse({
    name: formData.get("name"),
    frequency: formData.get("frequency") ?? "daily",
    target_per_period: formData.get("target_per_period") ?? 1,
    color: formData.get("color"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await createHabit(parsed.data);
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  redirect("/habits");
}

export async function adjustHabitEntryAction(
  habitId: string,
  date: string,
  delta: number,
): Promise<void> {
  await adjustEntry(habitId, date, delta);
  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function deleteHabitAction(id: string): Promise<void> {
  await deleteHabit(id);
  revalidatePath("/habits");
  revalidatePath("/dashboard");
}
