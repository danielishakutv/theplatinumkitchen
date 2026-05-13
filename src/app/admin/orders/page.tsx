import Link from "next/link";
import { ArrowUpRight, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orders, type OrderStatus } from "@/modules/orders";
import { formatNaira, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "received", label: "New" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "out_for_delivery", label: "On the way" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<string, string> = {
  received: "bg-blue-100 text-blue-800",
  preparing: "bg-amber-100 text-amber-800",
  ready: "bg-emerald-100 text-emerald-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-platinum-100 text-platinum-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track every order from received to delivered.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-platinum-200 bg-card p-3">
        <div className="relative flex-1 min-w-[14rem]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by number, name, phone…"
            className="h-10 rounded-full border-platinum-200 bg-platinum-50 pl-9"
          />
        </div>
        <Button variant="outline" size="sm" className="h-10 gap-2 rounded-full border-platinum-200">
          <Filter className="h-3.5 w-3.5" /> Filters
        </Button>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <div className="flex min-w-max items-center gap-1.5">
          {STATUS_TABS.map((t, i) => (
            <button
              key={t.value}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                i === 0
                  ? "border-foreground bg-foreground text-background"
                  : "border-platinum-200 bg-card text-foreground/80 hover:bg-accent",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-platinum-200 bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-platinum-200 bg-platinum-50/60 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Order</th>
                <th className="px-5 py-3 text-left font-semibold">Customer</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">Method</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
                <th className="px-5 py-3 text-right font-semibold">Payment</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-platinum-50/40">
                  <td className="px-5 py-4">
                    <p className="font-medium tabular-nums">{order.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(order.createdAt)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        STATUS_STYLES[order.status] ?? "",
                      )}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs uppercase tracking-wider text-muted-foreground">
                    {order.fulfilment.replace("_", " ")}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold tabular-nums">
                    {formatNaira(order.total)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
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
                    <Button asChild variant="ghost" size="sm" className="h-8 gap-1 rounded-full">
                      <Link href={`/order/${order.id}`}>
                        Open <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
