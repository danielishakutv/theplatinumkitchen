"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bike,
  ChevronRight,
  Clock,
  Loader2,
  Store,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/format";
import type { Order, OrderStatus } from "@/modules/orders";
import { setOrderStatusAction } from "@/app/admin/orders/actions";

function nextStatusFor(o: Order): { status: OrderStatus; label: string } | null {
  switch (o.status) {
    case "received":
      return { status: "preparing", label: "Start preparing" };
    case "preparing":
      return { status: "ready", label: "Mark ready" };
    case "ready":
      return o.fulfilment === "delivery"
        ? { status: "out_for_delivery", label: "Hand to rider" }
        : { status: "delivered", label: "Mark delivered" };
    case "out_for_delivery":
      return { status: "delivered", label: "Mark delivered" };
    default:
      return null;
  }
}

export function KitchenCard({ order }: { order: Order }) {
  const FulfilmentIcon =
    order.fulfilment === "delivery"
      ? Bike
      : order.fulfilment === "pickup"
        ? Store
        : Utensils;
  const next = nextStatusFor(order);
  const [pending, start] = useTransition();

  const advance = () => {
    if (!next) return;
    start(async () => {
      await setOrderStatusAction(order.id, next.status);
    });
  };

  return (
    <article className="rounded-2xl border border-platinum-200 bg-card p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <Link
          href={`/admin/orders/${order.id}`}
          className="min-w-0 hover:text-primary"
        >
          <p className="font-display text-base font-semibold tabular-nums">
            {order.number}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {formatRelative(order.createdAt)}
          </p>
        </Link>
        <span className="inline-flex items-center gap-1 rounded-full bg-platinum-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wider">
          <FulfilmentIcon className="h-3 w-3" /> {order.fulfilment.replace("_", " ")}
        </span>
      </header>

      <ul className="mt-4 space-y-2">
        {order.lines.map((line) => (
          <li key={line.id} className="flex items-start gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-platinum-100">
              {line.imageUrl ? (
                <Image
                  src={line.imageUrl}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : null}
              <span className="absolute right-0 top-0 grid h-5 w-5 -translate-y-1.5 translate-x-1.5 place-items-center rounded-full bg-foreground text-[10px] font-bold text-background">
                {line.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium leading-tight">{line.itemName}</p>
              {line.addons.length > 0 ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {line.addons.map((a) => a.name).join(" · ")}
                </p>
              ) : null}
              {line.notes ? (
                <p className="mt-1 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-900">
                  ⚠ {line.notes}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <footer className="mt-4 flex items-center justify-between gap-2 border-t border-platinum-200 pt-3">
        <span className="text-xs text-muted-foreground">
          {order.customer.name.split(" ")[0]}
        </span>
        {next ? (
          <Button
            size="sm"
            onClick={advance}
            disabled={pending}
            className="h-8 gap-1 rounded-full"
          >
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                {next.label}
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        ) : null}
      </footer>
    </article>
  );
}
