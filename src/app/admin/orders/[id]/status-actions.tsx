"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  markPaidAction,
  markUnpaidAction,
  setOrderStatusAction,
} from "../actions";
import type { Order, OrderStatus } from "@/modules/orders";
import { NEXT_STATUSES } from "@/modules/orders";
import { cn } from "@/lib/utils";

const LABELS: Record<OrderStatus, string> = {
  received: "Received",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function StatusActions({ order }: { order: Order }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const next = NEXT_STATUSES[order.status];

  const handleStatus = (status: OrderStatus) => {
    setError(null);
    if (status === "cancelled" && !confirm("Cancel this order?")) return;
    start(async () => {
      const r = await setOrderStatusAction(order.id, status);
      if (!r.ok) setError(r.error ?? "Update failed.");
    });
  };

  const handlePayment = () => {
    setError(null);
    start(async () => {
      const r =
        order.paymentStatus === "paid"
          ? await markUnpaidAction(order.id)
          : await markPaidAction(order.id);
      if (!r.ok) setError(r.error ?? "Update failed.");
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {next
          .filter((s) => s !== "cancelled")
          .map((s) => (
            <Button
              key={s}
              onClick={() => handleStatus(s)}
              disabled={pending}
              size="sm"
              className={cn(
                "h-9 rounded-full",
                s === "delivered" && "bg-emerald-700 hover:bg-emerald-800",
              )}
            >
              {pending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Mark {LABELS[s].toLowerCase()}
            </Button>
          ))}
        {next.includes("cancelled") ? (
          <Button
            onClick={() => handleStatus("cancelled")}
            disabled={pending}
            variant="outline"
            size="sm"
            className="h-9 rounded-full text-destructive hover:text-destructive"
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Cancel order
          </Button>
        ) : null}
      </div>

      <Button
        onClick={handlePayment}
        disabled={pending}
        variant="outline"
        size="sm"
        className="h-9 rounded-full"
      >
        {pending ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : null}
        {order.paymentStatus === "paid" ? "Mark unpaid" : "Mark paid"}
      </Button>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
