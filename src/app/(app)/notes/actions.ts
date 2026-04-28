"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { noteSchema } from "@/lib/schemas";
import { createNote, deleteNote, setNotePinned, updateNote } from "@/lib/db/notes";

type FormState = { error: string | null };

export async function createNoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = noteSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body") ?? "",
    tags: formData.get("tags"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  let id: string;
  try {
    const note = await createNote({
      title: parsed.data.title,
      body: parsed.data.body,
      tags: parsed.data.tags ?? undefined,
    });
    id = note.id;
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/notes");
  redirect(`/notes/${id}`);
}

export async function updateNoteAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = noteSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body") ?? "",
    tags: formData.get("tags"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await updateNote(id, {
      title: parsed.data.title,
      body: parsed.data.body,
      tags: parsed.data.tags ?? "",
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
  return { error: null };
}

export async function toggleNotePinnedAction(id: string, pinned: boolean): Promise<void> {
  await setNotePinned(id, pinned);
  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
}

export async function deleteNoteAction(id: string): Promise<void> {
  await deleteNote(id);
  revalidatePath("/notes");
  redirect("/notes");
}
