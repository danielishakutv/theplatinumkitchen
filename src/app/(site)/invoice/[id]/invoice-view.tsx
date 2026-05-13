"use client";

import Link from "next/link";
import { ArrowLeft, Printer, MessageCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
import type { Order } from "@/modules/orders";
import { formatNaira, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function InvoiceView({ order }: { order: Order }) {
  const isPaid = order.paymentStatus === "paid";

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const whatsappText = `Invoice ${order.number} from Platinum Kitchen — total ${formatNaira(order.total)}.`;

  return (
    <div className="bg-platinum-100/60 print:bg-white">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden">
        <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="ghost" size="sm" className="-ml-3 h-9 gap-1.5">
              <Link href={`/order/${order.id}`}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back to order
              </Link>
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-9 gap-1.5 rounded-full border-platinum-300"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-9 gap-1.5 rounded-full border-platinum-300"
              >
                <Download className="h-3.5 w-3.5" /> Save PDF
              </Button>
              <Button asChild size="sm" className="h-9 gap-1.5 rounded-full">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Share on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">
        <article
          className={cn(
            "relative overflow-hidden rounded-3xl border border-platinum-200 bg-white shadow-xl shadow-platinum-300/30 print:rounded-none print:border-0 print:shadow-none",
          )}
        >
          {/* Status stamp — large, rotated, decorative */}
          <Stamp status={order.paymentStatus} />

          {/* Header band */}
          <header className="relative border-b border-platinum-200 bg-gradient-to-br from-emerald-50/60 via-white to-platinum-50 px-8 pb-8 pt-10 sm:px-12 sm:pt-12 print:bg-white">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <BrandMark size="lg" />
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Invoice
                </p>
                <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
                  {order.number}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Issued {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  From
                </p>
                <p className="mt-2 font-display text-lg font-medium">Platinum Kitchen Ltd.</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                  12 Aminu Kano Crescent
                  <br />
                  Wuse 2, Abuja, FCT
                  <br />
                  +234 800 000 0000 · hello@theplatinumkitchen.com
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Bill to
                </p>
                <p className="mt-2 font-display text-lg font-medium">{order.customer.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                  {order.customer.phone}
                  {order.customer.email ? (
                    <>
                      <br />
                      {order.customer.email}
                    </>
                  ) : null}
                  {order.address ? (
                    <>
                      <br />
                      {order.address.street}, {order.address.area},{" "}
                      {order.address.city}, {order.address.state}
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          </header>

          {/* Lines */}
          <div className="px-8 py-8 sm:px-12">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-platinum-200 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="pb-3 text-left font-semibold">Item</th>
                  <th className="pb-3 text-right font-semibold">Qty</th>
                  <th className="pb-3 text-right font-semibold">Unit</th>
                  <th className="pb-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((line) => {
                  const unit = line.unitPrice + line.addons.reduce((s, a) => s + a.priceDelta, 0);
                  return (
                    <tr key={line.id} className="border-b border-platinum-100/80 align-top">
                      <td className="py-4 pr-4">
                        <p className="font-medium">{line.itemName}</p>
                        {line.addons.length > 0 ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {line.addons.map((a) => a.name).join(" · ")}
                          </p>
                        ) : null}
                        {line.notes ? (
                          <p className="mt-1 text-xs italic text-muted-foreground">
                            "{line.notes}"
                          </p>
                        ) : null}
                      </td>
                      <td className="py-4 text-right tabular-nums">{line.quantity}</td>
                      <td className="py-4 text-right tabular-nums">{formatNaira(unit)}</td>
                      <td className="py-4 text-right font-medium tabular-nums">
                        {formatNaira(unit * line.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="ml-auto mt-8 max-w-sm space-y-2 text-sm">
              <Row label="Subtotal" value={formatNaira(order.subtotal)} />
              <Row label="Service charge" value={formatNaira(order.serviceCharge)} />
              {order.deliveryFee > 0 ? (
                <Row label="Delivery fee" value={formatNaira(order.deliveryFee)} />
              ) : null}
              <div className="my-3 border-t border-platinum-200" />
              <Row label="Total" value={formatNaira(order.total)} emphasised />
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-platinum-200 bg-platinum-50/60 px-8 py-6 sm:px-12 print:bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Payment
                </p>
                <p className="mt-1 font-medium">
                  {order.paymentMethod === "cod" ? "Cash on Delivery" : "Paystack"}
                  <span
                    className={cn(
                      "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      isPaid
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {order.paymentStatus}
                  </span>
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Thank you for choosing Platinum Kitchen.</p>
                <p>Questions? hello@theplatinumkitchen.com</p>
              </div>
            </div>
          </footer>
        </article>

        <p className="mt-6 text-center text-xs text-muted-foreground print:hidden">
          Tip: use your browser's "Save as PDF" option in the print dialog for a downloadable copy.
        </p>
      </div>
    </div>
  );
}

function Stamp({ status }: { status: Order["paymentStatus"] }) {
  const isPaid = status === "paid";
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute right-8 top-32 z-10 select-none sm:right-12 sm:top-40",
      )}
    >
      <div
        className={cn(
          "rotate-[-14deg] rounded-md border-[3px] px-5 py-1.5 font-display text-3xl font-bold uppercase tracking-[0.18em] opacity-75 sm:px-7 sm:py-2 sm:text-4xl",
          isPaid
            ? "border-emerald-700 text-emerald-700"
            : "border-amber-700 text-amber-700",
        )}
        style={{
          textShadow: isPaid ? "0 0 0 currentColor" : undefined,
          boxShadow: "inset 0 0 0 1px currentColor",
        }}
      >
        {isPaid ? "Paid" : "Unpaid"}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  emphasised,
}: {
  label: string;
  value: string;
  emphasised?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          emphasised ? "font-display text-base text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          emphasised ? "font-display text-2xl font-semibold text-foreground" : "font-medium text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
