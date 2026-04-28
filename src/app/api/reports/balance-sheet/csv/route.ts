import { NextResponse } from "next/server";
import { getBalanceSheet } from "@/lib/db/reports";
import { centsToDollars } from "@/lib/money";
import { toCsv, csvFilename } from "@/lib/csv";

export const runtime = "nodejs";

export async function GET() {
  const sheet = await getBalanceSheet();
  const fmt = (cents: number) => centsToDollars(cents).toFixed(2);

  const rows: (string | number | null)[][] = [
    [`Balance Sheet`],
    [`As of`, sheet.as_of],
    [],
    ["Section", "Group", "Account", "Balance (USD)"],
  ];
  for (const g of sheet.asset_groups) {
    for (const r of g.rows) {
      rows.push(["Assets", g.label, r.name, fmt(r.balance_cents)]);
    }
    rows.push(["Assets", g.label, `${g.label} subtotal`, fmt(g.total_cents)]);
  }
  rows.push([]);
  for (const g of sheet.liability_groups) {
    for (const r of g.rows) {
      rows.push(["Liabilities", g.label, r.name, fmt(r.balance_cents)]);
    }
    rows.push(["Liabilities", g.label, `${g.label} subtotal`, fmt(g.total_cents)]);
  }
  rows.push([]);
  rows.push(["Totals", "", "Total assets", fmt(sheet.assets_cents)]);
  rows.push(["Totals", "", "Total liabilities", fmt(sheet.liabilities_cents)]);
  rows.push(["Totals", "", "Net worth", fmt(sheet.net_worth_cents)]);

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename("balance-sheet")}"`,
      "Cache-Control": "no-store",
    },
  });
}
