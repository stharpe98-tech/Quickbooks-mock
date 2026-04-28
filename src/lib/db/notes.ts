import { createClient } from "@/lib/supabase/server";
import type { Note } from "./types";

export async function listNotes(query?: string): Promise<Note[]> {
  const supabase = createClient();
  let q = supabase
    .from("notes")
    .select("*")
    .eq("archived", false)
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  const trimmed = query?.trim();
  if (trimmed) {
    const escaped = trimmed.replace(/[(),]/g, " ");
    q = q.or(`title.ilike.%${escaped}%,body.ilike.%${escaped}%`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getNote(id: string): Promise<Note | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("notes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

function parseTags(input?: string | null): string[] {
  if (!input) return [];
  return input
    .split(/[,\n]/)
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 20);
}

export async function createNote(input: {
  title?: string;
  body: string;
  tags?: string;
}): Promise<Note> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: input.title?.trim() || null,
      body: input.body,
      tags: parseTags(input.tags),
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateNote(
  id: string,
  input: { title?: string; body?: string; tags?: string },
): Promise<Note> {
  const supabase = createClient();
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim() || null;
  if (input.body !== undefined) patch.body = input.body;
  if (input.tags !== undefined) patch.tags = parseTags(input.tags);

  const { data, error } = await supabase
    .from("notes")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function setNotePinned(id: string, pinned: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("notes").update({ pinned }).eq("id", id);
  if (error) throw error;
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}
