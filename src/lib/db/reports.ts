import {
  startOfMonth,
  endOfMonth,
  format,
  subMonths,
  parse,
} from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { AccountKind } from "./types";

export type CategoryTotal = {
  category_id: string | null;
  name: string;
  total_cents: number;
};

export type ProfitLossReport = {
  period_label: string; // e.g. "April 2026"
  start: string;
  end: string;
  income_cents: number;
  expense_cents: number;
  net_cents: number;
  income_by_category: CategoryTotal[];
  expense_by_category: CategoryTotal[];
};

export async function getProfitLossReport(monthIso?: string): Promise<ProfitLossReport> {
  const supabase = createClient();
  const monthDate = monthIso ? parse(monthIso, "yyyy-MM", new Date()) : new Date();
  const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
  const end = format(endOfMonth(monthDate), "yyyy-MM-dd");

  const [incRes, expRes] = await Promise.all([
    supabase
      .from("income")
      .select("amount_cents, category:categories(id, name)")
      .gte("date", start)
      .lte("date", end),
    supabase
      .from("expenses")
      .select("amount_cents, category:categories(id, name)")
      .gte("date", start)
      .lte("date", end),
  ]);
  if (incRes.error) throw incRes.error;
  if (expRes.error) throw expRes.error;

  type Row = {
    amount_cents: number | null;
    category: { id: string; name: string } | { id: string; name: string }[] | null;
  };
  function rollUp(rows: Row[]): CategoryTotal[] {
    const map = new Map<string, CategoryTotal>();
    for (const row of rows) {
      const cat = Array.isArray(row.category) ? row.category[0] ?? null : row.category;
      const id = cat?.id ?? "uncategorized";
      const name = cat?.name ?? "Uncategorized";
      const slice = map.get(id) ?? { category_id: cat?.id ?? null, name, total_cents: 0 };
      slice.total_cents += row.amount_cents ?? 0;
      map.set(id, slice);
    }
    return Array.from(map.values()).sort((a, b) => b.total_cents - a.total_cents);
  }

  const incomeByCat = rollUp((incRes.data ?? []) as Row[]);
  const expenseByCat = rollUp((expRes.data ?? []) as Row[]);
  const incomeTotal = incomeByCat.reduce((s, r) => s + r.total_cents, 0);
  const expenseTotal = expenseByCat.reduce((s, r) => s + r.total_cents, 0);

  return {
    period_label: format(monthDate, "MMMM yyyy"),
    start,
    end,
    income_cents: incomeTotal,
    expense_cents: expenseTotal,
    net_cents: incomeTotal - expenseTotal,
    income_by_category: incomeByCat,
    expense_by_category: expenseByCat,
  };
}

export type SpendingByMonth = {
  month: string;       // "2026-04-01"
  label: string;       // "Apr"
  byCategory: Record<string, { name: string; total_cents: number }>;
  total_cents: number;
};

/** 12-month spending breakdown, organized for stacking. */
export async function getSpendingTrend(months = 12): Promise<{
  months: SpendingByMonth[];
  categories: { id: string; name: string; total_cents: number }[];
}> {
  const supabase = createClient();
  const now = new Date();
  const startDate = startOfMonth(subMonths(now, months - 1));
  const startIso = format(startDate, "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("expenses")
    .select("date, amount_cents, category:categories(id, name)")
    .gte("date", startIso);
  if (error) throw error;

  const byMonth = new Map<string, SpendingByMonth>();
  for (let i = 0; i < months; i++) {
    const d = startOfMonth(subMonths(now, months - 1 - i));
    const key = format(d, "yyyy-MM-dd");
    byMonth.set(key, { month: key, label: format(d, "MMM"), byCategory: {}, total_cents: 0 });
  }

  type Row = {
    date: string;
    amount_cents: number | null;
    category: { id: string; name: string } | { id: string; name: string }[] | null;
  };
  const catTotals = new Map<string, { id: string; name: string; total_cents: number }>();

  for (const row of (data ?? []) as Row[]) {
    const cat = Array.isArray(row.category) ? row.category[0] ?? null : row.category;
    const catId = cat?.id ?? "uncategorized";
    const catName = cat?.name ?? "Uncategorized";

    const monthKey = format(startOfMonth(new Date(row.date)), "yyyy-MM-dd");
    const bucket = byMonth.get(monthKey);
    if (!bucket) continue;

    bucket.total_cents += row.amount_cents ?? 0;
    const slot = bucket.byCategory[catId] ?? { name: catName, total_cents: 0 };
    slot.total_cents += row.amount_cents ?? 0;
    bucket.byCategory[catId] = slot;

    const cumul = catTotals.get(catId) ?? { id: catId, name: catName, total_cents: 0 };
    cumul.total_cents += row.amount_cents ?? 0;
    catTotals.set(catId, cumul);
  }

  return {
    months: Array.from(byMonth.values()),
    categories: Array.from(catTotals.values()).sort((a, b) => b.total_cents - a.total_cents),
  };
}

// ─── Balance Sheet ───────────────────────────────────────────────────────

export type BalanceSheetAccountRow = {
  id: string;
  name: string;
  kind: AccountKind;
  balance_cents: number;
};

export type BalanceSheetGroup = {
  kind: AccountKind;
  label: string;
  total_cents: number;
  rows: BalanceSheetAccountRow[];
};

export type BalanceSheet = {
  as_of: string;
  assets_cents: number;
  liabilities_cents: number;
  net_worth_cents: number;
  asset_groups: BalanceSheetGroup[];
  liability_groups: BalanceSheetGroup[];
};

const KIND_LABEL: Record<AccountKind, string> = {
  checking: "Checking",
  savings: "Savings",
  cash: "Cash",
  investment: "Investments",
  other: "Other",
  credit_card: "Credit cards",
  loan: "Loans",
};

const ASSET_KINDS: AccountKind[] = ["checking", "savings", "cash", "investment", "other"];
const LIABILITY_KINDS: AccountKind[] = ["credit_card", "loan"];

export async function getBalanceSheet(): Promise<BalanceSheet> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("id, name, kind, balance_cents")
    .eq("archived", false)
    .order("name", { ascending: true });
  if (error) throw error;

  const rows = (data ?? []) as BalanceSheetAccountRow[];
  const groupOf = (kinds: AccountKind[]): BalanceSheetGroup[] =>
    kinds
      .map((kind) => {
        const groupRows = rows.filter((r) => r.kind === kind);
        const total = groupRows.reduce((s, r) => s + (r.balance_cents ?? 0), 0);
        return {
          kind,
          label: KIND_LABEL[kind],
          total_cents: total,
          rows: groupRows,
        };
      })
      .filter((g) => g.rows.length > 0);

  const asset_groups = groupOf(ASSET_KINDS);
  const liability_groups = groupOf(LIABILITY_KINDS);
  const assets_cents = asset_groups.reduce((s, g) => s + g.total_cents, 0);
  const liabilities_cents = liability_groups.reduce((s, g) => s + g.total_cents, 0);

  return {
    as_of: format(new Date(), "yyyy-MM-dd"),
    assets_cents,
    liabilities_cents,
    net_worth_cents: assets_cents - liabilities_cents,
    asset_groups,
    liability_groups,
  };
}
