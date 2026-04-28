import { createClient } from "@/lib/supabase/server";
import type { Expense } from "./types";

export async function listExpenses(query?: string): Promise<Expense[]> {
  const supabase = createClient();
  let q = supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });
  const trimmed = query?.trim();
  if (trimmed) {
    const escaped = trimmed.replace(/[(),]/g, " ");
    q = q.or(`vendor.ilike.%${escaped}%,category.ilike.%${escaped}%,notes.ilike.%${escaped}%`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createExpense(input: {
  expense_date: string;
  vendor: string;
  amount_cents: number;
  category?: string;
  notes?: string;
}): Promise<Expense> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      expense_date: input.expense_date,
      vendor: input.vendor,
      amount_cents: input.amount_cents,
      category: input.category ?? null,
      notes: input.notes ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}
