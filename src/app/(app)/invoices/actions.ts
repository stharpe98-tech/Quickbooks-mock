"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { invoiceSchema, invoiceStatusSchema } from "@/lib/schemas";
import { parseDollars } from "@/lib/money";
import {
  createInvoice,
  deleteInvoice,
  updateInvoiceStatus,
} from "@/lib/db/invoices";

type FormState = { error: string | null };

export async function createInvoiceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  // Line items arrive as repeated fields: line_items.<i>.<key>
  const items: Array<{ description: string; quantity: string; unit_price: string }> = [];
  Array.from(formData.entries()).forEach(([key, value]) => {
    const m = key.match(/^line_items\.(\d+)\.(description|quantity|unit_price)$/);
    if (!m) return;
    const idx = parseInt(m[1], 10);
    items[idx] = items[idx] ?? { description: "", quantity: "", unit_price: "" };
    (items[idx] as Record<string, string>)[m[2]] = String(value ?? "");
  });
  const filtered = items.filter(Boolean);

  const parsed = invoiceSchema.safeParse({
    customer_id: formData.get("customer_id"),
    issue_date: formData.get("issue_date"),
    due_date: formData.get("due_date"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    line_items: filtered,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const lineItems: Array<{ description: string; quantity: number; unit_price_cents: number }> = [];
  for (const li of parsed.data.line_items) {
    const cents = parseDollars(li.unit_price);
    if (cents === null) return { error: "Invalid unit price" };
    const qty = parseFloat(li.quantity);
    if (Number.isNaN(qty) || qty <= 0) return { error: "Invalid quantity" };
    lineItems.push({ description: li.description, quantity: qty, unit_price_cents: cents });
  }

  let newId: string;
  try {
    const inv = await createInvoice({
      customer_id: parsed.data.customer_id,
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date,
      status: parsed.data.status,
      notes: parsed.data.notes,
      line_items: lineItems,
    });
    newId = inv.id;
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  redirect(`/invoices/${newId}`);
}

export async function updateInvoiceStatusAction(id: string, formData: FormData): Promise<void> {
  const parsed = invoiceStatusSchema.safeParse(formData.get("status"));
  if (!parsed.success) return;
  await updateInvoiceStatus(id, parsed.data);
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteInvoiceAction(id: string): Promise<void> {
  await deleteInvoice(id);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  redirect("/invoices");
}
