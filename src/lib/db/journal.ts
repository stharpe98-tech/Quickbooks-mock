import { format, startOfMonth, endOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { JournalEntry } from "./types";

export async function listJournalEntries(limit = 30): Promise<JournalEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listJournalForMonth(monthIso: string): Promise<JournalEntry[]> {
  const supabase = createClient();
  const monthDate = new Date(`${monthIso}-01T00:00:00`);
  const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
  const end = format(endOfMonth(monthDate), "yyyy-MM-dd");
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getJournalByDate(date: string): Promise<JournalEntry | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertJournal(input: {
  date: string;
  body: string;
  mood?: number | null;
}): Promise<JournalEntry> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("journal_entries")
    .upsert(
      {
        user_id: user.id,
        date: input.date,
        body: input.body,
        mood: input.mood ?? null,
      },
      { onConflict: "user_id,date" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteJournal(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("journal_entries").delete().eq("id", id);
  if (error) throw error;
}
