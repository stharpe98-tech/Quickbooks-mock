import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangePublicToken } from "@/lib/db/plaid";
import { isPlaidConfigured } from "@/lib/plaid";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!(await isPlaidConfigured())) {
    return NextResponse.json({ error: "Plaid is not configured." }, { status: 501 });
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { public_token?: string };
  if (!body.public_token) {
    return NextResponse.json({ error: "Missing public_token" }, { status: 400 });
  }

  try {
    const item = await exchangePublicToken(body.public_token, user.id);
    return NextResponse.json({
      item: {
        id: item.id,
        institution_name: item.institution_name,
        item_id: item.item_id,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
