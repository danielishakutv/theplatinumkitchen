import Link from "next/link";
import { ArrowUpRight, Download, Plus, Search, Receipt } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listOrders } from "@/modules/orders";
import { can } from "@/modules/users";
import { formatNaira, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const session = await auth();
  const user = session!.user;
  const orders = await listOrders(user, { limit: 500 });
  const paid = orders.filter((o) => o.paymentStatus === "paid");
  const unpaid = orders.filter((o) => o.paymentStatus === "unpaid");
  const totalPaid = paid.reduce((s, o) => s + o.total, 0);
  const totalUnpaid = unpaid.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every order is an invoice — create one here, download a PDF, or open
            it to manage.
          </p>
        </div>
        {can(user, "orders:write") ? (
          <Button asChild className="h-11 rounded-full px-5">
            <Link href="/admin/orders/new">
              <Plus className="mr-1.5 h-4 w-4" /> New invoice
            </Link>
          </Button>
        ) : null}
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <KPI label="Total invoices" value={String(orders.length)} />
        <KPI
          label="Outstanding"
          value={formatNaira(totalUnpaid)}
          tone="amber"
          sub={`${unpaid.length} unpaid`}
        />
        <KPI
          label="Collected"
          value={formatNaira(totalPaid)}
          tone="emerald"
          sub={`${paid.length} paid`}
        />
      </div>

      <div className="rounded-2xl border border-platinum-200 bg-card p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number, customer, amount…"
            className="h-10 rounded-full border-platinum-200 bg-platinum-50 pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-platinum-200 bg-card">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-platinum-200 bg-platinum-50/60 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Invoice</th>
                  <th className="px-5 py-3 text-left font-semibold">Customer</th>
                  <th className="px-5 py-3 text-left font-semibold">Date</th>
                  <th className="px-5 py-3 text-left font-semibold">Method</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                  <th className="px-5 py-3 text-right font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-platinum-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-platinum-50/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-platinum-100 text-foreground/70">
                          <Receipt className="h-4 w-4" />
                        </span>
                        <span className="font-medium tabular-nums">{order.number}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer.phone}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-xs uppercase tracking-wider text-muted-foreground">
                      {order.paymentMethod === "cod"
                        ? "Cash"
                        : order.paymentMethod === "bank_transfer"
                          ? "Transfer"
                          : "Online"}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums">
                      {formatNaira(order.total)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          order.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.paymentStatus === "refunded"
                              ? "bg-platinum-200 text-platinum-700"
                              : "bg-amber-100 text-amber-800",
                        )}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-full p-0"
                        >
                          <a
                            href={`/invoice/${order.id}/pdf`}
                            download
                            title={`Download invoice ${order.number}`}
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span className="sr-only">Download PDF</span>
                          </a>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 rounded-full"
                        >
                          <Link href={`/admin/orders/${order.id}`}>
                            View <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "emerald" | "amber";
}) {
  return (
    <div className="rounded-3xl border border-platinum-200 bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-3xl font-semibold tabular-nums",
          tone === "emerald" && "text-emerald-700",
          tone === "amber" && "text-amber-700",
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}
