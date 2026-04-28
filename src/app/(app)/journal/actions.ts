"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { journalSchema } from "@/lib/schemas";
import { deleteJournal, upsertJournal } from "@/lib/db/journal";

type FormState = { error: string | null };

export async function upsertJournalAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = journalSchema.safeParse({
    date: formData.get("date"),
    body: formData.get("body") ?? "",
    mood: formData.get("mood") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await upsertJournal({
      date: parsed.data.date,
      body: parsed.data.body,
      mood: parsed.data.mood ? parseInt(parsed.data.mood, 10) : null,
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/journal");
  revalidatePath(`/journal/${parsed.data.date}`);
  return { error: null };
}

export async function deleteJournalAction(id: string): Promise<void> {
  await deleteJournal(id);
  revalidatePath("/journal");
  redirect("/journal");
}
