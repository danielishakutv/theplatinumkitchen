// Server-only: rendered to a PDF buffer inside the /invoice/[id]/pdf route
// handler. Never imported by a client component.
import "server-only";

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import { PAYMENT_METHOD_LABEL, type Order } from "@/modules/orders/types";

// react-pdf's built-in Helvetica has no ₦ glyph, so money is rendered with an
// "NGN" prefix instead of the naira sign.
function money(n: number): string {
  return `NGN ${n.toLocaleString("en-NG")}`;
}

function formatIssued(d: string): string {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(
    new Date(d),
  );
}

const COLOR = {
  ink: "#1c1917",
  soft: "#57534e",
  muted: "#78716c",
  line: "#e7e5e4",
  lineSoft: "#f5f5f4",
  emerald: "#047857",
  emeraldDark: "#065f46",
  amber: "#b45309",
  panel: "#fafaf9",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLOR.ink,
    lineHeight: 1.5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brand: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLOR.emerald,
  },
  brandSub: {
    fontSize: 8,
    color: COLOR.muted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  invoiceLabel: {
    fontSize: 8,
    color: COLOR.muted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    marginTop: 2,
  },
  invoiceIssued: {
    fontSize: 9,
    color: COLOR.muted,
    textAlign: "right",
    marginTop: 2,
  },
  stamp: {
    marginTop: 8,
    alignSelf: "flex-end",
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  stampText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  rule: {
    borderTopWidth: 1,
    borderTopColor: COLOR.line,
    borderTopStyle: "solid",
    marginTop: 20,
    marginBottom: 20,
  },
  partiesRow: {
    flexDirection: "row",
    gap: 32,
  },
  party: {
    flex: 1,
  },
  partyLabel: {
    fontSize: 8,
    color: COLOR.muted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  partyName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  partyLine: {
    fontSize: 9,
    color: COLOR.soft,
  },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
    borderBottomStyle: "solid",
    paddingBottom: 6,
    marginBottom: 4,
  },
  th: {
    fontSize: 8,
    color: COLOR.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "Helvetica-Bold",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.lineSoft,
    borderBottomStyle: "solid",
    paddingVertical: 8,
  },
  colItem: { flex: 1, paddingRight: 8 },
  colQty: { width: 40, textAlign: "right" },
  colUnit: { width: 80, textAlign: "right" },
  colAmount: { width: 90, textAlign: "right" },
  itemName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  itemMeta: {
    fontSize: 8,
    color: COLOR.muted,
    marginTop: 1,
  },
  itemNotes: {
    fontSize: 8,
    color: COLOR.muted,
    fontStyle: "italic",
    marginTop: 1,
  },
  cell: { fontSize: 10 },
  totals: {
    marginTop: 16,
    marginLeft: "auto",
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalLabel: { fontSize: 9, color: COLOR.muted },
  totalValue: { fontSize: 9 },
  grandRule: {
    borderTopWidth: 1,
    borderTopColor: COLOR.line,
    borderTopStyle: "solid",
    marginVertical: 6,
  },
  grandLabel: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  grandValue: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  footer: {
    position: "absolute",
    bottom: 36,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: COLOR.line,
    borderTopStyle: "solid",
    paddingTop: 12,
  },
  payBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  payBadgeText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footerNote: {
    fontSize: 8,
    color: COLOR.muted,
    textAlign: "right",
  },
});

export function InvoiceDocument({ order }: { order: Order }) {
  const isPaid = order.paymentStatus === "paid";
  const accent = isPaid ? COLOR.emerald : COLOR.amber;

  const addressLine = order.address
    ? `${order.address.street}, ${order.address.area}, ${order.address.city}, ${order.address.state}`
    : null;

  return (
    <Document
      title={`Invoice ${order.number}`}
      author="Platinum Kitchen"
      subject={`Invoice ${order.number}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>Platinum Kitchen</Text>
            <Text style={styles.brandSub}>Made the long way</Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{order.number}</Text>
            <Text style={styles.invoiceIssued}>
              Issued {formatIssued(order.createdAt)}
            </Text>
            <View style={[styles.stamp, { borderColor: accent }]}>
              <Text style={[styles.stampText, { color: accent }]}>
                {isPaid ? "Paid" : "Unpaid"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rule} />

        <View style={styles.partiesRow}>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>Platinum Kitchen Ltd.</Text>
            <Text style={styles.partyLine}>12 Aminu Kano Crescent</Text>
            <Text style={styles.partyLine}>Wuse 2, Abuja, FCT</Text>
            <Text style={styles.partyLine}>+234 800 000 0000</Text>
            <Text style={styles.partyLine}>hello@theplatinumkitchen.com</Text>
          </View>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Bill to</Text>
            <Text style={styles.partyName}>{order.customer.name}</Text>
            <Text style={styles.partyLine}>{order.customer.phone}</Text>
            {order.customer.email ? (
              <Text style={styles.partyLine}>{order.customer.email}</Text>
            ) : null}
            {addressLine ? (
              <Text style={styles.partyLine}>{addressLine}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.rule} />

        <View style={styles.tableHead}>
          <Text style={[styles.th, styles.colItem]}>Item</Text>
          <Text style={[styles.th, styles.colQty]}>Qty</Text>
          <Text style={[styles.th, styles.colUnit]}>Unit</Text>
          <Text style={[styles.th, styles.colAmount]}>Amount</Text>
        </View>

        {order.lines.map((line) => {
          const unit =
            line.unitPrice +
            line.addons.reduce((s, a) => s + a.priceDelta, 0);
          return (
            <View key={line.id} style={styles.row} wrap={false}>
              <View style={styles.colItem}>
                <Text style={styles.itemName}>{line.itemName}</Text>
                {line.addons.length > 0 ? (
                  <Text style={styles.itemMeta}>
                    {line.addons.map((a) => a.name).join(" / ")}
                  </Text>
                ) : null}
                {line.notes ? (
                  <Text style={styles.itemNotes}>&ldquo;{line.notes}&rdquo;</Text>
                ) : null}
              </View>
              <Text style={[styles.cell, styles.colQty]}>{line.quantity}</Text>
              <Text style={[styles.cell, styles.colUnit]}>{money(unit)}</Text>
              <Text style={[styles.cell, styles.colAmount]}>
                {money(unit * line.quantity)}
              </Text>
            </View>
          );
        })}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{money(order.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Service charge</Text>
            <Text style={styles.totalValue}>{money(order.serviceCharge)}</Text>
          </View>
          {order.deliveryFee > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery fee</Text>
              <Text style={styles.totalValue}>{money(order.deliveryFee)}</Text>
            </View>
          ) : null}
          <View style={styles.grandRule} />
          <View style={styles.totalRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>{money(order.total)}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.partyLabel}>Payment</Text>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>
              {PAYMENT_METHOD_LABEL[order.paymentMethod]}
            </Text>
            <View
              style={[
                styles.payBadge,
                { backgroundColor: isPaid ? "#d1fae5" : "#fef3c7" },
              ]}
            >
              <Text
                style={[
                  styles.payBadgeText,
                  { color: isPaid ? COLOR.emeraldDark : COLOR.amber },
                ]}
              >
                {order.paymentStatus}
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.footerNote}>
              Thank you for choosing Platinum Kitchen.
            </Text>
            <Text style={styles.footerNote}>
              Questions? hello@theplatinumkitchen.com
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
