import { createClient } from "@/lib/supabase/server";
import type { Account, AccountKind } from "./types";

export async function listAccounts(): Promise<Account[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("archived", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createAccount(input: {
  name: string;
  kind: AccountKind;
  balance_cents: number;
  currency?: string;
}): Promise<Account> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      name: input.name,
      kind: input.kind,
      balance_cents: input.balance_cents,
      currency: input.currency ?? "USD",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAccount(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) throw error;
}

export async function getNetWorthCents(): Promise<{ assets: number; liabilities: number; net: number }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("kind, balance_cents")
    .eq("archived", false);
  if (error) throw error;

  let assets = 0;
  let liabilities = 0;
  for (const row of data ?? []) {
    const cents = row.balance_cents ?? 0;
    if (row.kind === "credit_card" || row.kind === "loan") {
      liabilities += cents;
    } else {
      assets += cents;
    }
  }
  return { assets, liabilities, net: assets - liabilities };
}
