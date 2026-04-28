import { format, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { Habit, HabitEntry } from "./types";

export async function listHabits(): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("archived", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createHabit(input: {
  name: string;
  frequency: "daily" | "weekly";
  target_per_period?: number;
  color?: string;
  icon?: string;
}): Promise<Habit> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: user.id,
      name: input.name,
      frequency: input.frequency,
      target_per_period: input.target_per_period ?? 1,
      color: input.color ?? null,
      icon: input.icon ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteHabit(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) throw error;
}

/** Returns entries for all habits in the last `days` days (inclusive of today). */
export async function listRecentEntries(days = 90): Promise<HabitEntry[]> {
  const supabase = createClient();
  const start = format(subDays(new Date(), days - 1), "yyyy-MM-dd");
  const { data, error } = await supabase
    .from("habit_entries")
    .select("*")
    .gte("date", start)
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Add or remove a unit of progress for a habit on a date. */
export async function adjustEntry(
  habitId: string,
  date: string,
  delta: number,
): Promise<{ count: number }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("habit_entries")
    .select("id, count")
    .eq("habit_id", habitId)
    .eq("date", date)
    .maybeSingle();

  const nextCount = Math.max(0, (existing?.count ?? 0) + delta);

  if (existing && nextCount === 0) {
    const { error } = await supabase.from("habit_entries").delete().eq("id", existing.id);
    if (error) throw error;
    return { count: 0 };
  }

  if (existing) {
    const { error } = await supabase
      .from("habit_entries")
      .update({ count: nextCount })
      .eq("id", existing.id);
    if (error) throw error;
    return { count: nextCount };
  }

  if (nextCount === 0) return { count: 0 };

  const { error } = await supabase.from("habit_entries").insert({
    user_id: user.id,
    habit_id: habitId,
    date,
    count: nextCount,
  });
  if (error) throw error;
  return { count: nextCount };
}

/**
 * Compute current streak (consecutive days back from today, inclusive,
 * where count >= target). Daily habits only — weekly returns 0.
 */
export function computeStreak(
  habit: Habit,
  entriesByDate: Record<string, number>,
  today = new Date(),
): number {
  if (habit.frequency !== "daily") return 0;
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = format(subDays(today, i), "yyyy-MM-dd");
    const count = entriesByDate[d] ?? 0;
    if (count >= habit.target_per_period) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
