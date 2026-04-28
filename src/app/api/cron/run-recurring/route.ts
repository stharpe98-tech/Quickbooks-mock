import { NextResponse, type NextRequest } from "next/server";
import { runDueRecurring } from "@/lib/db/recurring";
import { syncAllPlaidItems } from "@/lib/db/plaid";
import { syncAllTellerEnrollments } from "@/lib/db/teller";
import { getAnyAppSettings } from "@/lib/db/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron entry-point. Runs daily, materializes income/expense rows
 * from each due recurring transaction, and pulls fresh Plaid transactions.
 *
 * Auth: env var CRON_SECRET takes precedence; falls back to the cron_secret
 * stored on the in-app settings row. Calls with no configured secret are
 * accepted (useful for local development).
 */
export async function GET(request: NextRequest) {
  const envSecret = process.env.CRON_SECRET;
  const settings = envSecret ? null : await getAnyAppSettings();
  const secret = envSecret ?? settings?.cron_secret ?? null;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  try {
    const recurring = await runDueRecurring();
    const plaid = await syncAllPlaidItems();
    const teller = await syncAllTellerEnrollments();
    return NextResponse.json({
      ok: true,
      recurring,
      plaid,
      teller,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
