import { NextResponse, type NextRequest } from "next/server";
import { runDueRecurring } from "@/lib/db/recurring";
import { syncAllPlaidItems } from "@/lib/db/plaid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron entry-point. Runs daily, materializes income/expense rows
 * from each due recurring transaction, and pulls fresh Plaid transactions.
 *
 * Vercel sends `Authorization: Bearer ${CRON_SECRET}` if you set the
 * `CRON_SECRET` env var on the project. We accept calls either with no
 * secret configured or with the matching bearer.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  try {
    const recurring = await runDueRecurring();
    const plaid = await syncAllPlaidItems();
    return NextResponse.json({
      ok: true,
      recurring,
      plaid,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
