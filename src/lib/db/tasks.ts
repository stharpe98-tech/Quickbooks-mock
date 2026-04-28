import { createClient } from "@/lib/supabase/server";
import type { Project, Task, TaskWithProject } from "./types";

export type TaskFilter = "open" | "today" | "overdue" | "completed" | "all";

export async function listTasks(filter: TaskFilter = "open"): Promise<TaskWithProject[]> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  let q = supabase
    .from("tasks")
    .select("*, project:projects(id, name, color)")
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  switch (filter) {
    case "open":
      q = q.is("completed_at", null);
      break;
    case "today":
      q = q.is("completed_at", null).eq("due_at", today);
      break;
    case "overdue":
      q = q.is("completed_at", null).lt("due_at", today);
      break;
    case "completed":
      q = q.not("completed_at", "is", null);
      break;
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as TaskWithProject[];
}

export async function createTask(input: {
  title: string;
  notes?: string;
  due_at?: string;
  priority?: number;
  project_id?: string;
}): Promise<Task> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: input.title,
      notes: input.notes ?? null,
      due_at: input.due_at ?? null,
      priority: input.priority ?? 0,
      project_id: input.project_id ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function setTaskCompleted(id: string, completed: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

// ─── Projects ────────────────────────────────────────────────────────────

export async function listProjects(): Promise<Project[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("archived", false)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createProject(input: {
  name: string;
  color?: string;
  icon?: string;
}): Promise<Project> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: input.name,
      color: input.color ?? null,
      icon: input.icon ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
