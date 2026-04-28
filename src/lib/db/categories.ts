import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Category, CategoryKind } from "./types";

export async function listCategories(kind?: CategoryKind): Promise<Category[]> {
  const supabase = createClient();
  let q = supabase
    .from("categories")
    .select("*")
    .eq("archived", false)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(input: {
  kind: CategoryKind;
  name: string;
  color?: string;
  icon?: string;
}): Promise<Category> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      kind: input.kind,
      name: input.name,
      color: input.color ?? null,
      icon: input.icon ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

const DEFAULT_INCOME = ["Salary", "Freelance", "Gift", "Refund", "Other"];
const DEFAULT_EXPENSE = [
  "Groceries",
  "Restaurants",
  "Gas",
  "Rent",
  "Utilities",
  "Internet",
  "Phone",
  "Subscriptions",
  "Entertainment",
  "Shopping",
  "Health",
  "Insurance",
  "Travel",
  "Transportation",
  "Other",
];

/**
 * Idempotently seed default categories for a given user. Works with either
 * a user-scoped client or a service-role client (the latter for cron / sync
 * paths that don't have auth context).
 */
export async function seedDefaultCategoriesForUser(
  userId: string,
  sb: SupabaseClient,
): Promise<{ created: number }> {
  const { data: existing } = await sb
    .from("categories")
    .select("kind, name")
    .eq("user_id", userId);

  const have = new Set((existing ?? []).map((c) => `${c.kind}:${c.name}`));
  const rows: Array<{ user_id: string; kind: string; name: string; sort_order: number }> = [];

  DEFAULT_INCOME.forEach((name, i) => {
    if (!have.has(`income:${name}`)) {
      rows.push({ user_id: userId, kind: "income", name, sort_order: i });
    }
  });
  DEFAULT_EXPENSE.forEach((name, i) => {
    if (!have.has(`expense:${name}`)) {
      rows.push({ user_id: userId, kind: "expense", name, sort_order: i });
    }
  });

  if (rows.length === 0) return { created: 0 };

  const { error } = await sb.from("categories").insert(rows);
  if (error) throw error;
  return { created: rows.length };
}

/** UI entry-point: seed defaults for the currently signed-in user. */
export async function seedDefaultCategories(): Promise<{ created: number }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return seedDefaultCategoriesForUser(user.id, supabase);
}

/**
 * Build a (kind, name) → category_id map for a user. Used by sync paths to
 * resolve auto-categorized labels into actual category_ids.
 */
export async function getCategoryNameMap(
  userId: string,
  sb: SupabaseClient,
): Promise<Map<string, string>> {
  const { data } = await sb
    .from("categories")
    .select("id, kind, name")
    .eq("user_id", userId)
    .eq("archived", false);
  const map = new Map<string, string>();
  for (const c of (data ?? []) as Array<{ id: string; kind: string; name: string }>) {
    map.set(`${c.kind}:${c.name}`, c.id);
  }
  return map;
}

