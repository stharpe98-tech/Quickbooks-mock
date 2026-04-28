import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  setDate,
  setDay,
} from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { RecurringTransaction, RecurringWithRefs } from "./types";

export async function listRecurring(activeOnly = false): Promise<RecurringWithRefs[]> {
  const supabase = createClient();
  let q = supabase
    .from("recurring_transactions")
    .select("*, category:categories(id, name, color), account:accounts(id, name)")
    .order("active", { ascending: false })
    .order("next_run_date", { ascending: true });
  if (activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as RecurringWithRefs[];
}

export async function getRecurring(id: string): Promise<RecurringWithRefs | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recurring_transactions")
    .select("*, category:categories(id, name, color), account:accounts(id, name)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as RecurringWithRefs | null;
}

export type RecurringInput = {
  name: string;
  kind: "income" | "expense";
  amount_cents: number;
  category_id?: string;
  account_id?: string;
  frequency: "weekly" | "monthly" | "yearly";
  day_of_month?: number;
  day_of_week?: number;
  start_date: string;
  notes?: string;
};

export async function createRecurring(input: RecurringInput): Promise<RecurringTransaction> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const next = computeNextRun(input.start_date, input);

  const { data, error } = await supabase
    .from("recurring_transactions")
    .insert({
      user_id: user.id,
      name: input.name,
      kind: input.kind,
      amount_cents: input.amount_cents,
      category_id: input.category_id ?? null,
      account_id: input.account_id ?? null,
      frequency: input.frequency,
      day_of_month: input.day_of_month ?? null,
      day_of_week: input.day_of_week ?? null,
      start_date: input.start_date,
      next_run_date: next,
      notes: input.notes ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function setRecurringActive(id: string, active: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("recurring_transactions").update({ active }).eq("id", id);
  if (error) throw error;
}

export async function deleteRecurring(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Compute the first run date >= `from` for the given recurrence config.
 * For weekly: pick the next occurrence of day_of_week (defaulting to start_date's weekday).
 * For monthly: pick the next occurrence of day_of_month (clamped to month length).
 * For yearly: anniversary of start_date.
 */
export function computeNextRun(
  from: string,
  cfg: { frequency: "weekly" | "monthly" | "yearly"; day_of_month?: number; day_of_week?: number; start_date: string },
): string {
  const fromDate = new Date(`${from}T00:00:00`);
  const startDate = new Date(`${cfg.start_date}T00:00:00`);

  if (cfg.frequency === "weekly") {
    const dow = cfg.day_of_week ?? startDate.getDay();
    let candidate = setDay(fromDate, dow, { weekStartsOn: 0 });
    if (candidate < fromDate) candidate = addWeeks(candidate, 1);
    return format(candidate, "yyyy-MM-dd");
  }

  if (cfg.frequency === "monthly") {
    const dom = cfg.day_of_month ?? startDate.getDate();
    let candidate = setDate(fromDate, Math.min(dom, daysInMonth(fromDate)));
    if (candidate < fromDate) {
      const next = addMonths(fromDate, 1);
      candidate = setDate(next, Math.min(dom, daysInMonth(next)));
    }
    return format(candidate, "yyyy-MM-dd");
  }

  // yearly
  let candidate = new Date(fromDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  if (candidate < fromDate) candidate = new Date(fromDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
  return format(candidate, "yyyy-MM-dd");
}

function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function advance(date: string, freq: "weekly" | "monthly" | "yearly"): string {
  const d = new Date(`${date}T00:00:00`);
  const next = freq === "weekly" ? addWeeks(d, 1) : freq === "monthly" ? addMonths(d, 1) : addYears(d, 1);
  return format(next, "yyyy-MM-dd");
}

/**
 * Cron entry-point. Uses the service-role key (bypasses RLS) to find every
 * active recurring whose next_run_date <= today, materialize income/expense
 * rows for each missed period, and roll next_run_date forward.
 */
export async function runDueRecurring(today = format(new Date(), "yyyy-MM-dd")): Promise<{ created: number }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createServiceClient(url, key, { auth: { persistSession: false } });

  const { data: due, error } = await sb
    .from("recurring_transactions")
    .select("*")
    .eq("active", true)
    .lte("next_run_date", today);
  if (error) throw error;

  let created = 0;
  for (const r of (due ?? []) as RecurringTransaction[]) {
    let cursor = r.next_run_date;
    // Cap at 24 to avoid runaway loops if a very old start date sneaks in.
    for (let i = 0; i < 24 && cursor <= today; i++) {
      const table = r.kind === "income" ? "income" : "expenses";
      const row =
        r.kind === "income"
          ? {
              user_id: r.user_id,
              date: cursor,
              source: r.name,
              amount_cents: r.amount_cents,
              category_id: r.category_id,
              account_id: r.account_id,
              notes: r.notes,
            }
          : {
              user_id: r.user_id,
              date: cursor,
              vendor: r.name,
              amount_cents: r.amount_cents,
              category_id: r.category_id,
              account_id: r.account_id,
              notes: r.notes,
            };
      const { error: insErr } = await sb.from(table).insert(row);
      if (insErr) throw insErr;
      created++;
      cursor = advance(cursor, r.frequency);
    }
    await sb
      .from("recurring_transactions")
      .update({ next_run_date: cursor, last_run_date: today })
      .eq("id", r.id);
  }
  return { created };
}

// keep addDays referenced so tree-shake doesn't complain in case of future tweaks
void addDays;
