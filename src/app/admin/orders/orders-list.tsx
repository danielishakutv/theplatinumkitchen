"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bike,
  ChevronRight,
  Search,
  Store,
  Utensils,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNaira, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus, FulfilmentMethod } from "@/modules/orders";

const STATUS_TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "received", label: "New" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "out_for_delivery", label: "On the way" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  received: "bg-blue-100 text-blue-800",
  preparing: "bg-amber-100 text-amber-800",
  ready: "bg-emerald-100 text-emerald-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-platinum-100 text-platinum-700",
  cancelled: "bg-red-50 text-red-700",
};

const FULFILMENT_ICON: Record<FulfilmentMethod, typeof Bike> = {
  delivery: Bike,
  pickup: Store,
  dine_in: Utensils,
};

function humanize(s: string): string {
  return s.replace(/_/g, " ");
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFKD");
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        STATUS_STYLES[status],
      )}
    >
      {humanize(status)}
    </span>
  );
}

function PaymentBadge({ status }: { status: Order["paymentStatus"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        status === "paid"
          ? "bg-emerald-100 text-emerald-800"
          : status === "refunded"
            ? "bg-platinum-200 text-platinum-700"
            : "bg-amber-100 text-amber-800",
      )}
    >
      {status}
    </span>
  );
}

export function OrdersList({ orders }: { orders: Order[] }) {
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]["value"]>("all");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const q = normalize(deferred.trim());

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (tab !== "all" && o.status !== tab) return false;
      if (q.length === 0) return true;
      return (
        normalize(o.number).includes(q) ||
        normalize(o.customer.name).includes(q) ||
        normalize(o.customer.phone).includes(q) ||
        (o.customer.email ? normalize(o.customer.email).includes(q) : false)
      );
    });
  }, [orders, tab, q]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="rounded-2xl border border-platinum-200 bg-card p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search number, name, phone, email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 rounded-full border-platinum-200 bg-platinum-50 pl-9 pr-10"
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Status filter chips — horizontal scroll is fine for filters */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max items-center gap-1.5">
          {STATUS_TABS.map((t) => {
            const active = tab === t.value;
            const count =
              t.value === "all"
                ? orders.length
                : orders.filter((o) => o.status === t.value).length;
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-platinum-200 bg-card text-foreground/80 hover:bg-accent",
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
                    active
                      ? "bg-background/20 text-background"
                      : "bg-platinum-100 text-foreground/70",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-platinum-200 bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No orders to show.</p>
        </div>
      ) : (
        <>
          {/* Mobile + tablet: tappable card list, no horizontal scrolling */}
          <ul className="space-y-3 lg:hidden">
            {filtered.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>

          {/* Desktop: full table for dense scanning */}
          <div className="hidden overflow-hidden rounded-3xl border border-platinum-200 bg-card lg:block">
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
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-platinum-50/40">
                    <td className="px-5 py-4">
                      <p className="font-medium tabular-nums">{order.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelative(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer.phone}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 text-xs uppercase tracking-wider text-muted-foreground">
                      {humanize(order.fulfilment)}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums">
                      {formatNaira(order.total)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <PaymentBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 rounded-full"
                      >
                        <Link href={`/admin/orders/${order.id}`}>
                          Open <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const FulfilmentIcon = FULFILMENT_ICON[order.fulfilment];
  const itemCount = order.lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="block rounded-2xl border border-platinum-200 bg-card p-4 transition-colors hover:border-platinum-300 active:bg-platinum-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold tabular-nums">
            {order.number}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatRelative(order.createdAt)} · {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <p className="font-display text-lg font-semibold tabular-nums">
            {formatNaira(order.total)}
          </p>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5 text-sm">
        <span className="truncate font-medium">{order.customer.name}</span>
        <span className="text-muted-foreground">·</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {order.customer.phone}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <StatusBadge status={order.status} />
        <PaymentBadge status={order.paymentStatus} />
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <FulfilmentIcon className="h-3.5 w-3.5" />
          {humanize(order.fulfilment)}
        </span>
      </div>
    </Link>
  );
}
