"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { taskSchema } from "@/lib/schemas";
import { createTask, deleteTask, setTaskCompleted } from "@/lib/db/tasks";

type FormState = { error: string | null };

export async function createTaskAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes"),
    due_at: formData.get("due_at"),
    priority: formData.get("priority") ?? 0,
    project_id: formData.get("project_id"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await createTask({
      title: parsed.data.title,
      notes: parsed.data.notes,
      due_at: parsed.data.due_at,
      priority: parsed.data.priority,
      project_id: parsed.data.project_id,
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks");
}

export async function toggleTaskCompletedAction(id: string, completed: boolean): Promise<void> {
  await setTaskCompleted(id, completed);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(id: string): Promise<void> {
  await deleteTask(id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
