import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPlaidConfigured } from "@/lib/plaid";
import { syncTransactionsForItem, type PlaidItem } from "@/lib/db/plaid";

export const runtime = "nodejs";

/**
 * Manual sync trigger for a single Plaid item.
 * POST /api/plaid/sync  body: { item_id: string }   (UUID of plaid_items row)
 */
export async function POST(request: NextRequest) {
  if (!isPlaidConfigured()) {
    return NextResponse.json({ error: "Plaid is not configured." }, { status: 501 });
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { item_id?: string };
  if (!body.item_id) {
    return NextResponse.json({ error: "Missing item_id" }, { status: 400 });
  }

  // Pull the full item via the user's session (RLS enforces ownership).
  const { data: item, error } = await supabase
    .from("plaid_items")
    .select("*")
    .eq("id", body.item_id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  try {
    const result = await syncTransactionsForItem(item as PlaidItem);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
