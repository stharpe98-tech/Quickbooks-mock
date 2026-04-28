import { createClient } from "@/lib/supabase/server";
import type { Income, IncomeWithRefs } from "./types";

export async function listIncome(query?: string): Promise<IncomeWithRefs[]> {
  const supabase = createClient();
  let q = supabase
    .from("income")
    .select("*, category:categories(id, name, color), account:accounts(id, name)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const trimmed = query?.trim();
  if (trimmed) {
    const escaped = trimmed.replace(/[(),]/g, " ");
    q = q.or(`source.ilike.%${escaped}%,notes.ilike.%${escaped}%`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as IncomeWithRefs[];
}

export async function createIncome(input: {
  date: string;
  source: string;
  amount_cents: number;
  category_id?: string;
  account_id?: string;
  notes?: string;
}): Promise<Income> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("income")
    .insert({
      user_id: user.id,
      date: input.date,
      source: input.source,
      amount_cents: input.amount_cents,
      category_id: input.category_id ?? null,
      account_id: input.account_id ?? null,
      notes: input.notes ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteIncome(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("income").delete().eq("id", id);
  if (error) throw error;
}
