"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  BadgeCheck,
  Bell,
  Bike,
  CheckCheck,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AppNotification,
  NotificationType,
} from "@/modules/notifications/types";
import { useNotifications } from "@/components/notifications/use-notifications";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/components/notifications/actions";

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  order_placed: ShoppingBag,
  order_status: Bike,
  order_paid: BadgeCheck,
};

const TYPE_TONE: Record<NotificationType, string> = {
  order_placed: "bg-blue-100 text-blue-700",
  order_status: "bg-amber-100 text-amber-700",
  order_paid: "bg-emerald-100 text-emerald-700",
};

// Live notifications list. `orderHrefBase` is the route a notification deep-
// links into — "/admin/orders" for staff, "/order" for customers.
export function NotificationList({ orderHrefBase }: { orderHrefBase: string }) {
  const { items, unreadCount, setItems } = useNotifications();
  const [pending, start] = useTransition();

  const markOneRead = (id: string) => {
    setItems(
      (prev) =>
        prev?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? prev,
    );
    void markNotificationReadAction(id);
  };

  const markAll = () => {
    start(async () => {
      await markAllNotificationsReadAction();
      setItems((prev) => prev?.map((n) => ({ ...n, read: true })) ?? prev);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {items === null
            ? "Loading…"
            : unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up."}
        </p>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={markAll}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full border border-platinum-300 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Mark all read
          </button>
        ) : null}
      </div>

      {items === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-platinum-200 bg-platinum-100/60"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-2.5">
          {items.map((n) => (
            <li key={n.id}>
              <NotificationRow
                notification={n}
                orderHrefBase={orderHrefBase}
                onRead={markOneRead}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NotificationRow({
  notification: n,
  orderHrefBase,
  onRead,
}: {
  notification: AppNotification;
  orderHrefBase: string;
  onRead: (id: string) => void;
}) {
  const Icon = TYPE_ICON[n.type];

  const inner = (
    <div
      className={cn(
        "flex items-start gap-3.5 rounded-2xl border p-4 transition-colors",
        n.read
          ? "border-platinum-200 bg-card"
          : "border-primary/25 bg-accent/40",
      )}
    >
      <div
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
          TYPE_TONE[n.type],
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{n.title}</p>
          {!n.read ? (
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
          ) : null}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {formatRelative(n.createdAt)}
        </p>
      </div>
    </div>
  );

  if (n.orderId) {
    return (
      <Link href={`${orderHrefBase}/${n.orderId}`} onClick={() => onRead(n.id)}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onRead(n.id)}
      className="block w-full text-left"
    >
      {inner}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-platinum-300 bg-platinum-50/60 p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary">
        <Bell className="h-6 w-6" />
      </div>
      <p className="mt-4 font-display text-xl">No notifications yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Updates on orders will show up here as they happen.
      </p>
    </div>
  );
}
