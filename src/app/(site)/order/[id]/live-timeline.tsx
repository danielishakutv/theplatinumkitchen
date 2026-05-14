"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus, FulfilmentMethod } from "@/modules/orders/types";

// How often to re-check the order status. The page is rarely open for long,
// so a brisk poll feels live without being heavy. Polling pauses while the
// tab is hidden and stops once the order reaches a terminal state.
const POLL_MS = 15_000;

const STAGES: { status: OrderStatus; label: string }[] = [
  { status: "received", label: "Received" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
  { status: "out_for_delivery", label: "On the way" },
  { status: "delivered", label: "Delivered" },
];

function isTerminal(status: OrderStatus): boolean {
  return status === "delivered" || status === "cancelled";
}

// The order-status timeline, kept live by polling /api/orders/[id]/status.
// Server-renders with `initialStatus` so there's no flash, then updates in
// place as the kitchen advances the order.
export function LiveTimeline({
  orderId,
  initialStatus,
  fulfilment,
}: {
  orderId: string;
  initialStatus: OrderStatus;
  fulfilment: FulfilmentMethod;
}) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  useEffect(() => {
    // Already done — nothing left to watch for.
    if (isTerminal(initialStatus)) return;

    let cancelled = false;
    let intervalId: number | undefined;

    const poll = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { status?: OrderStatus };
        if (cancelled || !data.status) return;
        setStatus(data.status);
        // Stop polling once the order can't change any further.
        if (isTerminal(data.status) && intervalId) {
          window.clearInterval(intervalId);
          intervalId = undefined;
        }
      } catch {
        // Network blip — keep the last known status and try again next tick.
      }
    };

    poll();
    intervalId = window.setInterval(poll, POLL_MS);
    document.addEventListener("visibilitychange", poll);
    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [orderId, initialStatus]);

  const stages =
    fulfilment === "delivery"
      ? STAGES
      : STAGES.filter((s) => s.status !== "out_for_delivery");
  const idx = Math.max(
    0,
    stages.findIndex((s) => s.status === status),
  );
  const isCancelled = status === "cancelled";
  // While the order is still moving, the current stage gets a live pulse —
  // something gentle to watch until the kitchen advances it.
  const isActive = !isTerminal(status);

  return (
    <div className="mt-8 rounded-3xl border border-platinum-200 bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Order status
          </span>
          <p className="mt-1 font-display text-xl">
            {isCancelled ? "Cancelled" : stages[idx]?.label ?? "Pending"}
          </p>
        </div>
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">
          {fulfilment === "delivery"
            ? "Delivery"
            : fulfilment === "pickup"
              ? "Pickup"
              : "Dine in"}
        </span>
      </div>

      {!isCancelled ? (
        <ol className="mt-7 grid grid-cols-2 gap-y-6 sm:flex sm:items-start sm:justify-between sm:gap-2">
          {stages.map((s, i) => {
            const reached = i <= idx;
            const isCurrent = i === idx;
            return (
              <li
                key={s.status}
                className="relative flex flex-1 flex-col items-center text-center"
              >
                {i < stages.length - 1 ? (
                  <span
                    className={cn(
                      "absolute left-[calc(50%+1.5rem)] right-[calc(-50%+1.5rem)] top-3 hidden h-0.5 overflow-hidden rounded-full sm:block",
                      i < idx
                        ? "bg-primary"
                        : i === idx && isActive
                          ? "timeline-flow"
                          : "bg-platinum-200",
                    )}
                  />
                ) : null}
                <span className="relative z-10 flex items-center justify-center">
                  {isCurrent && isActive ? (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/40 motion-reduce:hidden" />
                  ) : null}
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full transition-colors",
                      reached
                        ? "bg-primary text-primary-foreground"
                        : "bg-platinum-100 text-muted-foreground",
                      isCurrent && "ring-4 ring-primary/15",
                    )}
                  >
                    {reached ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : null}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-2.5 text-xs font-medium uppercase tracking-wider",
                    reached ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          This order was cancelled. If you weren&apos;t expecting that, give us
          a call.
        </p>
      )}
    </div>
  );
}
