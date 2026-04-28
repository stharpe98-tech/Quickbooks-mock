import { NextResponse, type NextRequest } from "next/server";
import { listInvoices } from "@/lib/db/invoices";
import type { InvoiceStatus } from "@/lib/db/types";
import { centsToDollars } from "@/lib/money";
import { toCsv, csvFilename } from "@/lib/csv";

export const runtime = "nodejs";

const VALID_STATUSES: InvoiceStatus[] = ["draft", "sent", "paid"];

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  const rawStatus = request.nextUrl.searchParams.get("status");
  const status = VALID_STATUSES.includes(rawStatus as InvoiceStatus)
    ? (rawStatus as InvoiceStatus)
    : undefined;

  const invoices = await listInvoices(query, status);

  const rows: (string | number | null)[][] = [
    ["Issue date", "Due date", "Customer", "Status", "Total (USD)", "Notes"],
    ...invoices.map((inv) => [
      inv.issue_date,
      inv.due_date,
      inv.customer?.name ?? null,
      inv.status,
      centsToDollars(inv.total_cents).toFixed(2),
      inv.notes,
    ]),
  ];

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename("invoices")}"`,
      "Cache-Control": "no-store",
    },
  });
}
