"use client";

import Link from "next/link";
import { BadgeCheck, Bell, Bike, ShoppingBag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/modules/notifications/types";
import { useNotifications } from "@/components/notifications/use-notifications";

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  order_placed: ShoppingBag,
  order_status: Bike,
  order_paid: BadgeCheck,
};

// How many recent notifications the dropdown previews — the rest live on the
// full /notifications page reached via "See all".
const PREVIEW_COUNT = 5;

// Live unread badge + a dropdown of recent notifications. Used in both the
// admin shell header and the public site header — `notificationsHref` is the
// full-list page for that surface, `orderHrefBase` is where an order
// notification deep-links ("/admin/orders" for staff, "/order" for customers).
export function NotificationBell({
  notificationsHref,
  orderHrefBase,
}: {
  notificationsHref: string;
  orderHrefBase: string;
}) {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const has = unreadCount > 0;
  const preview = items?.slice(0, PREVIEW_COUNT) ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={
          has ? `Notifications, ${unreadCount} unread` : "Notifications"
        }
        className="relative grid h-10 w-10 place-items-center rounded-full text-foreground/80 outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="h-4 w-4" />
        {has ? (
          <span
            className={cn(
              "absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full",
              "bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground",
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-1.5">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <p className="text-sm font-medium">Notifications</p>
          {has ? (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-medium text-primary transition-colors hover:underline"
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />

        {items === null ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : preview.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            No notifications yet.
          </p>
        ) : (
          preview.map((n) => {
            const Icon = TYPE_ICON[n.type];
            const href = n.orderId
              ? `${orderHrefBase}/${n.orderId}`
              : notificationsHref;
            return (
              <DropdownMenuItem
                key={n.id}
                render={<Link href={href} />}
                onClick={() => markRead(n.id)}
                className="items-start gap-2.5 px-2 py-2"
              >
                <span
                  className={cn(
                    "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                    n.read
                      ? "bg-muted text-muted-foreground"
                      : "bg-accent text-primary",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {n.title}
                  </span>
                  <span className="block line-clamp-2 text-xs text-muted-foreground">
                    {n.body}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {formatRelative(n.createdAt)}
                  </span>
                </span>
                {!n.read ? (
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                ) : null}
              </DropdownMenuItem>
            );
          })
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href={notificationsHref} />}
          className="justify-center px-2 py-2 text-sm font-medium text-primary"
        >
          See all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
