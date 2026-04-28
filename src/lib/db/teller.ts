import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isTellerConfigured, tellerFetch } from "@/lib/teller";
import { categorize } from "./categorize";
import { getCategoryNameMap, seedDefaultCategoriesForUser } from "./categories";

export type TellerEnrollment = {
  id: string;
  user_id: string;
  access_token: string;
  enrollment_id: string;
  institution_id: string | null;
  institution_name: string | null;
  last_synced_at: string | null;
  created_at: string;
};

export type TellerEnrollmentSummary = Omit<TellerEnrollment, "access_token">;

type TellerAccount = {
  id: string;
  enrollment_id: string;
  type: string;
  subtype: string;
  name: string;
  last_four?: string;
  currency?: string;
  institution?: { id: string; name: string };
  balance?: { available?: string; ledger?: string };
};

type TellerBalances = {
  account_id: string;
  available: string;
  ledger: string;
};

type TellerTransaction = {
  id: string;
  account_id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: string; // signed decimal string; Teller convention: + = inflow, - = outflow
  type?: string;
  details?: { counterparty?: { name?: string } };
};

function service() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function listTellerEnrollments(): Promise<TellerEnrollmentSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("teller_enrollments")
    .select("id, user_id, enrollment_id, institution_id, institution_name, last_synced_at, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TellerEnrollmentSummary[];
}

export async function deleteTellerEnrollment(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("teller_enrollments").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Persist a fresh Teller enrollment, then seed accounts + transactions.
 * Called from /api/teller/enroll after Teller Connect succeeds.
 */
export async function enrollTeller(input: {
  accessToken: string;
  enrollmentId: string;
  institutionId?: string;
  institutionName?: string;
  userId: string;
}): Promise<TellerEnrollment> {
  if (!(await isTellerConfigured())) throw new Error("Teller not configured");

  const sb = service();
  const { data: row, error } = await sb
    .from("teller_enrollments")
    .upsert(
      {
        user_id: input.userId,
        access_token: input.accessToken,
        enrollment_id: input.enrollmentId,
        institution_id: input.institutionId ?? null,
        institution_name: input.institutionName ?? null,
      },
      { onConflict: "user_id,enrollment_id" },
    )
    .select("*")
    .single();
  if (error) throw error;

  const enrollment = row as TellerEnrollment;
  await syncAccountsForEnrollment(enrollment);
  await syncTransactionsForEnrollment(enrollment);
  return enrollment;
}

const ACCOUNT_TYPE_MAP: Record<string, string> = {
  depository: "checking",
  credit: "credit_card",
  loan: "loan",
};

const ACCOUNT_SUBTYPE_MAP: Record<string, string> = {
  checking: "checking",
  savings: "savings",
  money_market: "savings",
  certificate_of_deposit: "savings",
  credit_card: "credit_card",
  line_of_credit: "loan",
  mortgage: "loan",
  student: "loan",
  auto: "loan",
};

/** Resolve our internal account.kind from Teller's type/subtype. */
function mapKind(t: TellerAccount): string {
  const sub = ACCOUNT_SUBTYPE_MAP[t.subtype];
  if (sub) return sub;
  return ACCOUNT_TYPE_MAP[t.type] ?? "other";
}

function dollarsToCents(s: string | undefined): number {
  if (!s) return 0;
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return 0;
  return Math.round(Math.abs(n) * 100);
}

export async function syncAccountsForEnrollment(enrollment: TellerEnrollment): Promise<void> {
  const accounts = await tellerFetch<TellerAccount[]>("/accounts", enrollment.access_token);
  const sb = service();

  for (const a of accounts) {
    let balanceCents = 0;
    try {
      const bal = await tellerFetch<TellerBalances>(
        `/accounts/${a.id}/balances`,
        enrollment.access_token,
      );
      balanceCents = dollarsToCents(bal.ledger ?? bal.available);
    } catch {
      // Best-effort; not fatal.
    }

    const row = {
      user_id: enrollment.user_id,
      teller_account_id: a.id,
      teller_enrollment_id: enrollment.id,
      name: a.name || a.institution?.name || "Account",
      kind: mapKind(a),
      balance_cents: balanceCents,
      currency: a.currency ?? "USD",
    };

    // The (user_id, teller_account_id) uniqueness is enforced by a *partial*
    // unique index, which PostgREST's on_conflict can't target. Do a manual
    // SELECT-then-INSERT/UPDATE instead.
    const { data: existing, error: selErr } = await sb
      .from("accounts")
      .select("id")
      .eq("user_id", enrollment.user_id)
      .eq("teller_account_id", a.id)
      .maybeSingle();
    if (selErr) throw new Error(`account lookup failed: ${selErr.message}`);

    if (existing) {
      const { error } = await sb.from("accounts").update(row).eq("id", existing.id);
      if (error) throw new Error(`account update failed: ${error.message}`);
    } else {
      const { error } = await sb.from("accounts").insert(row);
      if (error) throw new Error(`account insert failed: ${error.message}`);
    }
  }
}

/**
 * Pull transactions for every account on an enrollment.
 * Teller convention: positive amount = money IN (income), negative = money OUT (expense).
 * Dedup by teller_transaction_id.
 */
export async function syncTransactionsForEnrollment(
  enrollment: TellerEnrollment,
): Promise<{ added: number }> {
  const sb = service();

  // Make sure default categories exist for this user so auto-categorization
  // has somewhere to land. No-op if they're already there.
  await seedDefaultCategoriesForUser(enrollment.user_id, sb);
  const categoryMap = await getCategoryNameMap(enrollment.user_id, sb);

  // Map teller_account_id → our internal accounts.id for this enrollment.
  const { data: accountRows } = await sb
    .from("accounts")
    .select("id, teller_account_id")
    .eq("teller_enrollment_id", enrollment.id);
  const accountMap = new Map<string, string>();
  for (const r of accountRows ?? []) {
    if (r.teller_account_id) accountMap.set(r.teller_account_id, r.id);
  }

  let added = 0;
  for (const tellerAccountId of Array.from(accountMap.keys())) {
    const txs = await tellerFetch<TellerTransaction[]>(
      `/accounts/${tellerAccountId}/transactions?count=200`,
      enrollment.access_token,
    );

    // Pre-fetch existing teller_transaction_ids for this user so we can dedup
    // without relying on PostgREST on_conflict (the unique index is partial).
    const txIds = txs.map((t) => t.id);
    const existingIds = new Set<string>();
    if (txIds.length > 0) {
      const [incExisting, expExisting] = await Promise.all([
        sb
          .from("income")
          .select("teller_transaction_id")
          .eq("user_id", enrollment.user_id)
          .in("teller_transaction_id", txIds),
        sb
          .from("expenses")
          .select("teller_transaction_id")
          .eq("user_id", enrollment.user_id)
          .in("teller_transaction_id", txIds),
      ]);
      for (const r of incExisting.data ?? []) {
        if (r.teller_transaction_id) existingIds.add(r.teller_transaction_id);
      }
      for (const r of expExisting.data ?? []) {
        if (r.teller_transaction_id) existingIds.add(r.teller_transaction_id);
      }
    }

    for (const t of txs) {
      if (existingIds.has(t.id)) continue;
      const amt = parseFloat(t.amount);
      if (!Number.isFinite(amt)) continue;
      const isIncome = amt > 0;
      const cents = Math.round(Math.abs(amt) * 100);
      const ourAccountId = accountMap.get(t.account_id) ?? null;
      const label =
        t.details?.counterparty?.name?.trim() ||
        t.description?.trim() ||
        (isIncome ? "Deposit" : "Transaction");

      // Auto-categorize: match the label against keyword rules and resolve
      // to one of the user's category_ids (if a matching category exists).
      const kind = isIncome ? "income" : "expense";
      const categoryName = categorize(label, kind);
      const categoryId = categoryName
        ? categoryMap.get(`${kind}:${categoryName}`) ?? null
        : null;

      const row = isIncome
        ? {
            user_id: enrollment.user_id,
            date: t.date,
            source: label,
            amount_cents: cents,
            account_id: ourAccountId,
            category_id: categoryId,
            teller_transaction_id: t.id,
            notes: null as string | null,
          }
        : {
            user_id: enrollment.user_id,
            date: t.date,
            vendor: label,
            amount_cents: cents,
            account_id: ourAccountId,
            category_id: categoryId,
            teller_transaction_id: t.id,
            notes: null as string | null,
          };
      const table = isIncome ? "income" : "expenses";
      const { error } = await sb.from(table).insert(row);
      if (error) {
        // 23505 = unique_violation: a concurrent sync inserted it; ignore.
        if (error.code !== "23505") {
          throw new Error(`${table} insert failed: ${error.message}`);
        }
      } else {
        added++;
      }
    }
  }

  await sb
    .from("teller_enrollments")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", enrollment.id);

  // Refresh balances.
  await syncAccountsForEnrollment(enrollment);

  return { added };
}

/** Cron entry-point: sync every Teller enrollment across every user. */
export async function syncAllTellerEnrollments(): Promise<{
  enrollments: number;
  added: number;
}> {
  if (!(await isTellerConfigured())) return { enrollments: 0, added: 0 };
  const sb = service();
  const { data: rows, error } = await sb.from("teller_enrollments").select("*");
  if (error) throw error;

  let added = 0;
  for (const row of (rows ?? []) as TellerEnrollment[]) {
    try {
      const r = await syncTransactionsForEnrollment(row);
      added += r.added;
    } catch {
      // Per-enrollment failures shouldn't kill the whole cron.
    }
  }
  return { enrollments: rows?.length ?? 0, added };
}
