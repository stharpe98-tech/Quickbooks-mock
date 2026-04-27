import { renderToBuffer } from "@react-pdf/renderer";
import { format } from "date-fns";
import { NextResponse } from "next/server";
import { getInvoice } from "@/lib/db/invoices";
import { InvoiceDocument } from "@/lib/pdf/InvoiceDocument";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id);
  if (!invoice) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await renderToBuffer(<InvoiceDocument invoice={invoice} />);
  const filename = `invoice-${format(new Date(invoice.issue_date), "yyyy-MM-dd")}-${invoice.id.slice(0, 8)}.pdf`;

  // NextResponse wants BodyInit; wrap Node Buffer as a Uint8Array view.
  const body = new Uint8Array(buffer);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
