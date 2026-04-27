import { startOfMonth, subMonths, format } from "date-fns";
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

export type MonthlyBucket = {
  /** First-of-month ISO date, e.g. "2026-04-01" — sortable + stable. */
  month: string;
  /** Short label for axis, e.g. "Apr". */
  label: string;
  income_cents: number;
  expense_cents: number;
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

/**
 * Returns the last `months` whole months of income (paid invoices, by issue_date)
 * and expenses (by expense_date), oldest first. Empty months return zeros.
 */
export async function getMonthlyTotals(months = 6): Promise<MonthlyBucket[]> {
  const supabase = createClient();
  const now = new Date();
  const startDate = startOfMonth(subMonths(now, months - 1));
  const startIso = format(startDate, "yyyy-MM-dd");

  const [paidInvoicesRes, expensesRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("issue_date, total_cents")
      .eq("status", "paid")
      .gte("issue_date", startIso),
    supabase
      .from("expenses")
      .select("expense_date, amount_cents")
      .gte("expense_date", startIso),
  ]);
  if (paidInvoicesRes.error) throw paidInvoicesRes.error;
  if (expensesRes.error) throw expensesRes.error;

  const buckets = new Map<string, MonthlyBucket>();
  for (let i = 0; i < months; i++) {
    const d = startOfMonth(subMonths(now, months - 1 - i));
    const key = format(d, "yyyy-MM-dd");
    buckets.set(key, {
      month: key,
      label: format(d, "MMM"),
      income_cents: 0,
      expense_cents: 0,
    });
  }

  for (const row of paidInvoicesRes.data ?? []) {
    const key = format(startOfMonth(new Date(row.issue_date)), "yyyy-MM-dd");
    const bucket = buckets.get(key);
    if (bucket) bucket.income_cents += row.total_cents ?? 0;
  }
  for (const row of expensesRes.data ?? []) {
    const key = format(startOfMonth(new Date(row.expense_date)), "yyyy-MM-dd");
    const bucket = buckets.get(key);
    if (bucket) bucket.expense_cents += row.amount_cents ?? 0;
  }

  return Array.from(buckets.values());
}
