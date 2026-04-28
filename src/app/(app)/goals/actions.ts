"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { goalSchema, goalProgressSchema } from "@/lib/schemas";
import {
  createGoal,
  deleteGoal,
  setGoalCompleted,
  updateGoalProgress,
} from "@/lib/db/goals";

type FormState = { error: string | null };

export async function createGoalAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = goalSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    kind: formData.get("kind") ?? "milestone",
    target_value: formData.get("target_value"),
    unit: formData.get("unit"),
    target_date: formData.get("target_date"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await createGoal({
      name: parsed.data.name,
      description: parsed.data.description,
      kind: parsed.data.kind,
      target_value: parsed.data.target_value ? parseFloat(parsed.data.target_value) : undefined,
      unit: parsed.data.unit,
      target_date: parsed.data.target_date,
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  redirect("/goals");
}

export async function updateGoalProgressAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = goalProgressSchema.safeParse({
    current_value: formData.get("current_value"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid value" };

  try {
    await updateGoalProgress(id, parseFloat(parsed.data.current_value));
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/goals");
  revalidatePath(`/goals/${id}`);
  revalidatePath("/dashboard");
  return { error: null };
}

export async function toggleGoalCompletedAction(id: string, completed: boolean): Promise<void> {
  await setGoalCompleted(id, completed);
  revalidatePath("/goals");
  revalidatePath(`/goals/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteGoalAction(id: string): Promise<void> {
  await deleteGoal(id);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  redirect("/goals");
}
