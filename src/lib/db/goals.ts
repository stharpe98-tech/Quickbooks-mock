import { createClient } from "@/lib/supabase/server";
import type { Goal } from "./types";

export async function listGoals(includeCompleted = true): Promise<Goal[]> {
  const supabase = createClient();
  let q = supabase
    .from("goals")
    .select("*")
    .order("completed_at", { ascending: true, nullsFirst: true })
    .order("target_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (!includeCompleted) q = q.is("completed_at", null);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getGoal(id: string): Promise<Goal | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("goals").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createGoal(input: {
  name: string;
  description?: string;
  kind: "milestone" | "numeric";
  target_value?: number;
  unit?: string;
  target_date?: string;
}): Promise<Goal> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      name: input.name,
      description: input.description ?? null,
      kind: input.kind,
      target_value: input.target_value ?? null,
      unit: input.unit ?? null,
      target_date: input.target_date ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateGoalProgress(id: string, current_value: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("goals").update({ current_value }).eq("id", id);
  if (error) throw error;
}

export async function setGoalCompleted(id: string, completed: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("goals")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteGoal(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}
