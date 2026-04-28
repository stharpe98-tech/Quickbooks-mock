import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isTellerConfigured } from "@/lib/teller";
import { syncTransactionsForEnrollment, type TellerEnrollment } from "@/lib/db/teller";

export const runtime = "nodejs";

/** Manual sync for a single Teller enrollment.  Body: { enrollment_id: uuid } */
export async function POST(request: NextRequest) {
  if (!(await isTellerConfigured())) {
    return NextResponse.json({ error: "Teller is not configured." }, { status: 501 });
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { enrollment_id?: string };
  if (!body.enrollment_id) {
    return NextResponse.json({ error: "Missing enrollment_id" }, { status: 400 });
  }

  // RLS scopes the lookup to the current user.
  const { data: row, error } = await supabase
    .from("teller_enrollments")
    .select("*")
    .eq("id", body.enrollment_id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });

  try {
    const result = await syncTransactionsForEnrollment(row as TellerEnrollment);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
