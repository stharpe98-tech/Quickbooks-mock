import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { formatMoney } from "@/lib/money";
import type { InvoiceWithDetails } from "@/lib/db/types";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  brandStrip: {
    height: 6,
    marginBottom: 24,
    backgroundColor: "#7c3aed",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  brand: {
    fontSize: 20,
    fontWeight: 700,
    color: "#7c3aed",
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 700,
    textAlign: "right",
  },
  invoiceMeta: {
    marginTop: 4,
    fontSize: 9,
    color: "#64748b",
    textAlign: "right",
  },
  detailGrid: {
    flexDirection: "row",
    marginBottom: 28,
    gap: 24,
  },
  detailBlock: { flex: 1 },
  detailLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailValue: { fontSize: 11, fontWeight: 700 },
  detailValueSmall: { fontSize: 10, color: "#475569", marginTop: 1 },
  table: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 16,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  th: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 8,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  td: { paddingVertical: 8, paddingHorizontal: 10, fontSize: 10 },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colUnit: { flex: 1.4, textAlign: "right" },
  colTotal: { flex: 1.4, textAlign: "right" },
  totalsBlock: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalCard: {
    width: 220,
    padding: 12,
    backgroundColor: "#7c3aed",
    color: "#ffffff",
    borderRadius: 4,
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: "#ddd6fe",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  totalValue: { fontSize: 22, fontWeight: 700, marginTop: 2, color: "#ffffff" },
  notesBlock: {
    marginTop: 28,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#7c3aed",
    borderRadius: 2,
  },
  notesLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  notes: { fontSize: 10, color: "#334155", lineHeight: 1.4 },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
  },
  status: {
    alignSelf: "flex-end",
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});

const statusColors: Record<string, { bg: string; fg: string }> = {
  draft: { bg: "#f1f5f9", fg: "#475569" },
  sent: { bg: "#fef3c7", fg: "#92400e" },
  paid: { bg: "#d1fae5", fg: "#065f46" },
};

export function InvoiceDocument({ invoice }: { invoice: InvoiceWithDetails }) {
  const status = statusColors[invoice.status] ?? statusColors.draft;
  const issued = format(new Date(invoice.issue_date), "MMM d, yyyy");
  const due = invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "—";

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.brandStrip} />

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>QuickBooks Mock</Text>
            <Text style={styles.brandSub}>Bookkeeping for the rest of us</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.invoiceMeta}>#{invoice.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={[styles.status, { backgroundColor: status.bg, color: status.fg }]}>
              {invoice.status}
            </Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Bill to</Text>
            <Text style={styles.detailValue}>{invoice.customer?.name ?? "—"}</Text>
            {invoice.customer?.email && (
              <Text style={styles.detailValueSmall}>{invoice.customer.email}</Text>
            )}
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Issued</Text>
            <Text style={styles.detailValue}>{issued}</Text>
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Due</Text>
            <Text style={styles.detailValue}>{due}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colUnit]}>Unit</Text>
            <Text style={[styles.th, styles.colTotal]}>Total</Text>
          </View>
          {invoice.line_items.map((li, idx) => {
            const isLast = idx === invoice.line_items.length - 1;
            return (
              <View key={li.id} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <Text style={[styles.td, styles.colDesc]}>{li.description}</Text>
                <Text style={[styles.td, styles.colQty]}>{li.quantity}</Text>
                <Text style={[styles.td, styles.colUnit]}>{formatMoney(li.unit_price_cents)}</Text>
                <Text style={[styles.td, styles.colTotal]}>
                  {formatMoney(li.line_total_cents)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total due</Text>
            <Text style={styles.totalValue}>{formatMoney(invoice.total_cents)}</Text>
          </View>
        </View>

        {invoice.notes && (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notes}>{invoice.notes}</Text>
          </View>
        )}

        <Text style={styles.footer} fixed>
          Generated by QuickBooks Mock · {format(new Date(), "MMM d, yyyy")}
        </Text>
      </Page>
    </Document>
  );
}
