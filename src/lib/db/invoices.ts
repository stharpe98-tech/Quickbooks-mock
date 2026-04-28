import { createClient } from "@/lib/supabase/server";
import type {
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  InvoiceWithCustomer,
  InvoiceWithDetails,
} from "./types";

export async function listInvoices(
  query?: string,
  status?: InvoiceStatus,
): Promise<InvoiceWithCustomer[]> {
  const supabase = createClient();
  let q = supabase
    .from("invoices")
    .select("*, customer:customers(id, name)")
    .order("created_at", { ascending: false });

  if (status) q = q.eq("status", status);

  const trimmed = query?.trim();
  if (trimmed) {
    const escaped = trimmed.replace(/[(),]/g, " ");
    // Find any customer whose name matches, then accept invoices whose customer is one of
    // those OR whose notes/status text matches directly.
    const { data: matchingCustomers } = await supabase
      .from("customers")
      .select("id")
      .ilike("name", `%${escaped}%`);
    const idList = (matchingCustomers ?? []).map((c) => c.id);

    const orParts = [`notes.ilike.%${escaped}%`, `status.ilike.%${escaped}%`];
    if (idList.length > 0) orParts.push(`customer_id.in.(${idList.join(",")})`);
    q = q.or(orParts.join(","));
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as InvoiceWithCustomer[];
}

export async function getInvoice(id: string): Promise<InvoiceWithDetails | null> {
  const supabase = createClient();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, customer:customers(id, name, email)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!invoice) return null;

  const { data: line_items, error: liError } = await supabase
    .from("invoice_line_items")
    .select("*")
    .eq("invoice_id", id)
    .order("position", { ascending: true });
  if (liError) throw liError;

  return { ...(invoice as Invoice & { customer: InvoiceWithDetails["customer"] }), line_items: line_items ?? [] };
}

export type CreateInvoiceInput = {
  customer_id: string;
  issue_date: string;
  due_date?: string;
  status: InvoiceStatus;
  notes?: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price_cents: number;
  }>;
};

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      customer_id: input.customer_id,
      issue_date: input.issue_date,
      due_date: input.due_date ?? null,
      status: input.status,
      notes: input.notes ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;

  const lineRows = input.line_items.map((li, idx) => ({
    invoice_id: invoice.id,
    user_id: user.id,
    description: li.description,
    quantity: li.quantity,
    unit_price_cents: li.unit_price_cents,
    position: idx,
  }));

  const { error: liError } = await supabase.from("invoice_line_items").insert(lineRows);
  if (liError) {
    await supabase.from("invoices").delete().eq("id", invoice.id);
    throw liError;
  }

  // Trigger has recomputed total — re-read so caller sees the latest.
  const { data: refreshed } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoice.id)
    .single();
  return (refreshed ?? invoice) as Invoice;
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteInvoice(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
}

export async function listInvoicesForCustomer(customerId: string): Promise<Invoice[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Invoice[];
}

export type { InvoiceLineItem };
