import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enrollTeller } from "@/lib/db/teller";
import { isTellerConfigured } from "@/lib/teller";

export const runtime = "nodejs";

/**
 * Receives the Teller Connect onSuccess payload and persists the enrollment.
 * Body: {
 *   accessToken: string;
 *   enrollment: { id: string; institution?: { id, name } };
 * }
 */
export async function POST(request: NextRequest) {
  if (!(await isTellerConfigured())) {
    return NextResponse.json({ error: "Teller is not configured." }, { status: 501 });
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    accessToken?: string;
    enrollment?: {
      id?: string;
      institution?: { id?: string; name?: string };
    };
  };

  if (!body.accessToken || !body.enrollment?.id) {
    return NextResponse.json(
      { error: "Missing accessToken or enrollment.id" },
      { status: 400 },
    );
  }

  try {
    const enrollment = await enrollTeller({
      accessToken: body.accessToken,
      enrollmentId: body.enrollment.id,
      institutionId: body.enrollment.institution?.id,
      institutionName: body.enrollment.institution?.name,
      userId: user.id,
    });
    return NextResponse.json({
      enrollment: {
        id: enrollment.id,
        institution_name: enrollment.institution_name,
        enrollment_id: enrollment.enrollment_id,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
