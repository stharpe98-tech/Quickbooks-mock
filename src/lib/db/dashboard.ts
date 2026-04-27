import { createClient } from "@/lib/supabase/server";
import type { Expense, InvoiceWithCustomer } from "./types";

export type DashboardSummary = {
  income_cents: number;
  expense_cents: number;
  net_cents: number;
  outstanding_cents: number;
  recent_invoices: InvoiceWithCustomer[];
  recent_expenses: Expense[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = createClient();

  const [paidInvoicesRes, outstandingRes, expensesRes, recentInvoicesRes, recentExpensesRes] =
    await Promise.all([
      supabase.from("invoices").select("total_cents").eq("status", "paid"),
      supabase.from("invoices").select("total_cents").in("status", ["draft", "sent"]),
      supabase.from("expenses").select("amount_cents"),
      supabase
        .from("invoices")
        .select("*, customer:customers(id, name)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  if (paidInvoicesRes.error) throw paidInvoicesRes.error;
  if (outstandingRes.error) throw outstandingRes.error;
  if (expensesRes.error) throw expensesRes.error;
  if (recentInvoicesRes.error) throw recentInvoicesRes.error;
  if (recentExpensesRes.error) throw recentExpensesRes.error;

  const income = (paidInvoicesRes.data ?? []).reduce(
    (sum, row) => sum + (row.total_cents ?? 0),
    0,
  );
  const outstanding = (outstandingRes.data ?? []).reduce(
    (sum, row) => sum + (row.total_cents ?? 0),
    0,
  );
  const expenses = (expensesRes.data ?? []).reduce(
    (sum, row) => sum + (row.amount_cents ?? 0),
    0,
  );

  return {
    income_cents: income,
    expense_cents: expenses,
    net_cents: income - expenses,
    outstanding_cents: outstanding,
    recent_invoices: (recentInvoicesRes.data ?? []) as InvoiceWithCustomer[],
    recent_expenses: (recentExpensesRes.data ?? []) as Expense[],
  };
}
