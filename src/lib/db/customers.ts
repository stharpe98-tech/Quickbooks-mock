import { createClient } from "@/lib/supabase/server";
import type { Customer } from "./types";

export async function listCustomers(): Promise<Customer[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCustomer(input: {
  name: string;
  email?: string;
  phone?: string;
}): Promise<Customer> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("customers")
    .insert({
      user_id: user.id,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomer(
  id: string,
  input: { name: string; email?: string; phone?: string },
): Promise<Customer> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .update({
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}
