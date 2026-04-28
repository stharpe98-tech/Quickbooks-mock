import { createClient as createServiceClient } from "@supabase/supabase-js";
import {
  getPlaidClient,
  isPlaidConfigured,
  PLAID_COUNTRY_CODES,
  PLAID_PRODUCTS,
} from "@/lib/plaid";
import { createClient } from "@/lib/supabase/server";

export type PlaidItem = {
  id: string;
  user_id: string;
  access_token: string;
  item_id: string;
  institution_id: string | null;
  institution_name: string | null;
  last_sync_cursor: string | null;
  last_synced_at: string | null;
  created_at: string;
};

export type PlaidItemSummary = Omit<PlaidItem, "access_token">;

function service() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function listPlaidItems(): Promise<PlaidItemSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("plaid_items")
    .select("id, user_id, item_id, institution_id, institution_name, last_sync_cursor, last_synced_at, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PlaidItemSummary[];
}

export async function deletePlaidItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("plaid_items").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Create a Plaid Link token. Called by /api/plaid/link-token.
 * The user_id must be the current Supabase user.
 */
export async function createLinkToken(userId: string): Promise<string> {
  if (!(await isPlaidConfigured())) throw new Error("Plaid not configured");
  const client = await getPlaidClient();
  const res = await client.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: "Daybook",
    products: PLAID_PRODUCTS,
    country_codes: PLAID_COUNTRY_CODES,
    language: "en",
  });
  return res.data.link_token;
}

/**
 * Exchange a Link public_token for a long-lived access_token, store the item,
 * and seed our `accounts` table from the institution's accounts.
 */
export async function exchangePublicToken(publicToken: string, userId: string): Promise<PlaidItem> {
  const client = await getPlaidClient();
  const exchange = await client.itemPublicTokenExchange({ public_token: publicToken });
  const accessToken = exchange.data.access_token;
  const itemId = exchange.data.item_id;

  // Pull institution info for nice display.
  let institutionName: string | null = null;
  let institutionId: string | null = null;
  try {
    const itemRes = await client.itemGet({ access_token: accessToken });
    institutionId = itemRes.data.item.institution_id ?? null;
    if (institutionId) {
      const inst = await client.institutionsGetById({
        institution_id: institutionId,
        country_codes: PLAID_COUNTRY_CODES,
      });
      institutionName = inst.data.institution.name;
    }
  } catch {
    // Best-effort; not fatal.
  }

  const sb = service();
  const { data: item, error } = await sb
    .from("plaid_items")
    .insert({
      user_id: userId,
      access_token: accessToken,
      item_id: itemId,
      institution_id: institutionId,
      institution_name: institutionName,
    })
    .select("*")
    .single();
  if (error) throw error;

  // Seed accounts (no-op if they already exist via plaid_account_id unique idx).
  await syncAccountsForItem(item as PlaidItem);

  // Initial transactions sync.
  await syncTransactionsForItem(item as PlaidItem);

  return item as PlaidItem;
}

const ACCOUNT_KIND_MAP: Record<string, string> = {
  depository: "checking",
  credit: "credit_card",
  loan: "loan",
  investment: "investment",
  brokerage: "investment",
  other: "other",
};

const ACCOUNT_SUBTYPE_KIND_MAP: Record<string, string> = {
  checking: "checking",
  savings: "savings",
  cd: "savings",
  "money market": "savings",
  paypal: "cash",
  cash: "cash",
  "credit card": "credit_card",
  "line of credit": "loan",
  mortgage: "loan",
  student: "loan",
  auto: "loan",
};

export async function syncAccountsForItem(item: PlaidItem): Promise<void> {
  const client = await getPlaidClient();
  const sb = service();
  const res = await client.accountsGet({ access_token: item.access_token });

  for (const a of res.data.accounts) {
    const subtypeKind = a.subtype ? ACCOUNT_SUBTYPE_KIND_MAP[a.subtype] : undefined;
    const kind = subtypeKind ?? ACCOUNT_KIND_MAP[a.type] ?? "other";
    const isLiability = kind === "credit_card" || kind === "loan";
    const balance = a.balances.current ?? 0;
    const balanceCents = Math.round(Math.abs(balance) * 100);

    await sb.from("accounts").upsert(
      {
        user_id: item.user_id,
        plaid_account_id: a.account_id,
        plaid_item_id: item.id,
        name: a.name || a.official_name || "Account",
        kind,
        balance_cents: balanceCents,
        currency: a.balances.iso_currency_code || "USD",
      },
      { onConflict: "user_id,plaid_account_id", ignoreDuplicates: false },
    );

    // Suppress unused-var lint
    void isLiability;
  }
}

/**
 * Pull added/modified/removed transactions via Plaid's incremental sync API
 * and apply them to our income / expenses tables, deduped by plaid_transaction_id.
 *
 * Plaid convention: positive amount = money OUT (expense). Negative = IN (income).
 */
export async function syncTransactionsForItem(item: PlaidItem): Promise<{
  added: number;
  modified: number;
  removed: number;
}> {
  const client = await getPlaidClient();
  const sb = service();

  let cursor: string | undefined = item.last_sync_cursor ?? undefined;
  let added = 0;
  let modified = 0;
  let removed = 0;
  let hasMore = true;

  // Build a lookup from plaid_account_id -> our accounts.id for this item.
  const { data: accountRows } = await sb
    .from("accounts")
    .select("id, plaid_account_id")
    .eq("plaid_item_id", item.id);
  const accountMap = new Map<string, string>();
  for (const r of accountRows ?? []) {
    if (r.plaid_account_id) accountMap.set(r.plaid_account_id, r.id);
  }

  while (hasMore) {
    const res = await client.transactionsSync({
      access_token: item.access_token,
      cursor,
    });
    const data = res.data;

    for (const t of data.added) {
      const isExpense = (t.amount ?? 0) >= 0;
      const cents = Math.round(Math.abs(t.amount ?? 0) * 100);
      const ourAccountId = accountMap.get(t.account_id) ?? null;

      const row =
        isExpense
          ? {
              user_id: item.user_id,
              date: t.date,
              vendor: t.merchant_name || t.name || "Transaction",
              amount_cents: cents,
              account_id: ourAccountId,
              plaid_transaction_id: t.transaction_id,
              notes: null as string | null,
            }
          : {
              user_id: item.user_id,
              date: t.date,
              source: t.merchant_name || t.name || "Deposit",
              amount_cents: cents,
              account_id: ourAccountId,
              plaid_transaction_id: t.transaction_id,
              notes: null as string | null,
            };
      const table = isExpense ? "expenses" : "income";
      const { error } = await sb.from(table).upsert(row, {
        onConflict: "user_id,plaid_transaction_id",
        ignoreDuplicates: true,
      });
      if (!error) added++;
    }

    for (const t of data.modified) {
      const isExpense = (t.amount ?? 0) >= 0;
      const cents = Math.round(Math.abs(t.amount ?? 0) * 100);
      const table = isExpense ? "expenses" : "income";
      const patch =
        isExpense
          ? { vendor: t.merchant_name || t.name || "Transaction", amount_cents: cents, date: t.date }
          : { source: t.merchant_name || t.name || "Deposit", amount_cents: cents, date: t.date };
      const { error } = await sb
        .from(table)
        .update(patch)
        .eq("user_id", item.user_id)
        .eq("plaid_transaction_id", t.transaction_id);
      if (!error) modified++;
    }

    for (const r of data.removed) {
      const tid = (r as { transaction_id?: string }).transaction_id;
      if (!tid) continue;
      // We don't know which table — try both.
      await sb.from("expenses").delete().eq("user_id", item.user_id).eq("plaid_transaction_id", tid);
      await sb.from("income").delete().eq("user_id", item.user_id).eq("plaid_transaction_id", tid);
      removed++;
    }

    cursor = data.next_cursor;
    hasMore = data.has_more;
  }

  await sb
    .from("plaid_items")
    .update({ last_sync_cursor: cursor, last_synced_at: new Date().toISOString() })
    .eq("id", item.id);

  // Refresh balances after pulling transactions.
  await syncAccountsForItem(item);

  return { added, modified, removed };
}

/** Cron entry-point: sync every Plaid item across every user. */
export async function syncAllPlaidItems(): Promise<{
  items: number;
  added: number;
  modified: number;
  removed: number;
}> {
  if (!(await isPlaidConfigured())) return { items: 0, added: 0, modified: 0, removed: 0 };
  const sb = service();
  const { data: items, error } = await sb.from("plaid_items").select("*");
  if (error) throw error;

  let added = 0;
  let modified = 0;
  let removed = 0;
  for (const item of (items ?? []) as PlaidItem[]) {
    try {
      const r = await syncTransactionsForItem(item);
      added += r.added;
      modified += r.modified;
      removed += r.removed;
    } catch {
      // Per-item failures shouldn't kill the whole cron.
    }
  }
  return { items: items?.length ?? 0, added, modified, removed };
}
