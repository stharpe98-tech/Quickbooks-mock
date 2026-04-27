import { NextResponse, type NextRequest } from "next/server";
import { listCustomers } from "@/lib/db/customers";
import { toCsv, csvFilename } from "@/lib/csv";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  const customers = await listCustomers(query);

  const rows: (string | number | null)[][] = [
    ["Name", "Email", "Phone", "Created"],
    ...customers.map((c) => [c.name, c.email, c.phone, c.created_at]),
  ];

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename("customers")}"`,
      "Cache-Control": "no-store",
    },
  });
}
