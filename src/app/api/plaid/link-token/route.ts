import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLinkToken } from "@/lib/db/plaid";
import { isPlaidConfigured } from "@/lib/plaid";

export const runtime = "nodejs";

export async function POST() {
  if (!isPlaidConfigured()) {
    return NextResponse.json({ error: "Plaid is not configured." }, { status: 501 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const link_token = await createLinkToken(user.id);
    return NextResponse.json({ link_token });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
