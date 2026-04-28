import { startOfMonth, subMonths, format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getNetWorthCents } from "./accounts";
import type { ExpenseWithRefs, IncomeWithRefs, Task } from "./types";

export type MoneySummary = {
  income_cents: number;        // current month
  expense_cents: number;       // current month
  net_cents: number;
  net_worth_cents: number;
  recent_income: IncomeWithRefs[];
  recent_expenses: ExpenseWithRefs[];
};

export type TaskSummary = {
  open_count: number;
  due_today_count: number;
  overdue_count: number;
  upcoming: Task[];
};

export type MonthlyBucket = {
  /** First-of-month ISO date, e.g. "2026-04-01" — sortable + stable. */
  month: string;
  /** Short label for axis, e.g. "Apr". */
  label: string;
  income_cents: number;
  expense_cents: number;
};

export type CategorySlice = {
  category_id: string | null;
  name: string;
  color: string | null;
  total_cents: number;
};

export async function getMoneySummary(): Promise<MoneySummary> {
  const supabase = createClient();
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const [incomeRes, expenseRes, recentIncomeRes, recentExpenseRes, netWorth] =
    await Promise.all([
      supabase.from("income").select("amount_cents").gte("date", monthStart),
      supabase.from("expenses").select("amount_cents").gte("date", monthStart),
      supabase
        .from("income")
        .select("*, category:categories(id, name, color), account:accounts(id, name)")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("expenses")
        .select("*, category:categories(id, name, color), account:accounts(id, name)")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5),
      getNetWorthCents(),
    ]);

  if (incomeRes.error) throw incomeRes.error;
  if (expenseRes.error) throw expenseRes.error;
  if (recentIncomeRes.error) throw recentIncomeRes.error;
  if (recentExpenseRes.error) throw recentExpenseRes.error;

  const income = (incomeRes.data ?? []).reduce((s, r) => s + (r.amount_cents ?? 0), 0);
  const expense = (expenseRes.data ?? []).reduce((s, r) => s + (r.amount_cents ?? 0), 0);

  return {
    income_cents: income,
    expense_cents: expense,
    net_cents: income - expense,
    net_worth_cents: netWorth.net,
    recent_income: (recentIncomeRes.data ?? []) as IncomeWithRefs[],
    recent_expenses: (recentExpenseRes.data ?? []) as ExpenseWithRefs[],
  };
}

export async function getTaskSummary(): Promise<TaskSummary> {
  const supabase = createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const [openRes, dueTodayRes, overdueRes, upcomingRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .is("completed_at", null),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .is("completed_at", null)
      .eq("due_at", today),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .is("completed_at", null)
      .lt("due_at", today),
    supabase
      .from("tasks")
      .select("*")
      .is("completed_at", null)
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("priority", { ascending: false })
      .limit(5),
  ]);

  if (openRes.error) throw openRes.error;
  if (dueTodayRes.error) throw dueTodayRes.error;
  if (overdueRes.error) throw overdueRes.error;
  if (upcomingRes.error) throw upcomingRes.error;

  return {
    open_count: openRes.count ?? 0,
    due_today_count: dueTodayRes.count ?? 0,
    overdue_count: overdueRes.count ?? 0,
    upcoming: (upcomingRes.data ?? []) as Task[],
  };
}

export async function getMonthlyTotals(months = 6): Promise<MonthlyBucket[]> {
  const supabase = createClient();
  const now = new Date();
  const startDate = startOfMonth(subMonths(now, months - 1));
  const startIso = format(startDate, "yyyy-MM-dd");

  const [incRes, expRes] = await Promise.all([
    supabase.from("income").select("date, amount_cents").gte("date", startIso),
    supabase.from("expenses").select("date, amount_cents").gte("date", startIso),
  ]);
  if (incRes.error) throw incRes.error;
  if (expRes.error) throw expRes.error;

  const buckets = new Map<string, MonthlyBucket>();
  for (let i = 0; i < months; i++) {
    const d = startOfMonth(subMonths(now, months - 1 - i));
    const key = format(d, "yyyy-MM-dd");
    buckets.set(key, { month: key, label: format(d, "MMM"), income_cents: 0, expense_cents: 0 });
  }

  for (const row of incRes.data ?? []) {
    const key = format(startOfMonth(new Date(row.date)), "yyyy-MM-dd");
    const b = buckets.get(key);
    if (b) b.income_cents += row.amount_cents ?? 0;
  }
  for (const row of expRes.data ?? []) {
    const key = format(startOfMonth(new Date(row.date)), "yyyy-MM-dd");
    const b = buckets.get(key);
    if (b) b.expense_cents += row.amount_cents ?? 0;
  }

  return Array.from(buckets.values());
}

/** Spending breakdown by category for the current month. */
export async function getMonthlySpendingByCategory(): Promise<CategorySlice[]> {
  const supabase = createClient();
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("expenses")
    .select("amount_cents, category:categories(id, name, color)")
    .gte("date", monthStart);
  if (error) throw error;

  type Row = {
    amount_cents: number | null;
    category:
      | { id: string; name: string; color: string | null }
      | { id: string; name: string; color: string | null }[]
      | null;
  };
  const byCat = new Map<string, CategorySlice>();
  for (const row of (data ?? []) as Row[]) {
    const cat = Array.isArray(row.category) ? row.category[0] ?? null : row.category;
    const key = cat?.id ?? "uncategorized";
    const name = cat?.name ?? "Uncategorized";
    const color = cat?.color ?? null;
    const slice = byCat.get(key) ?? { category_id: cat?.id ?? null, name, color, total_cents: 0 };
    slice.total_cents += row.amount_cents ?? 0;
    byCat.set(key, slice);
  }
  return Array.from(byCat.values()).sort((a, b) => b.total_cents - a.total_cents);
}
