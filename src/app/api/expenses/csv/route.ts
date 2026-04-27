import { NextResponse, type NextRequest } from "next/server";
import { listExpenses } from "@/lib/db/expenses";
import { centsToDollars } from "@/lib/money";
import { toCsv, csvFilename } from "@/lib/csv";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  const expenses = await listExpenses(query);

  const rows: (string | number | null)[][] = [
    ["Date", "Vendor", "Category", "Amount (USD)", "Notes"],
    ...expenses.map((e) => [
      e.expense_date,
      e.vendor,
      e.category,
      centsToDollars(e.amount_cents).toFixed(2),
      e.notes,
    ]),
  ];

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename("expenses")}"`,
      "Cache-Control": "no-store",
    },
  });
}
