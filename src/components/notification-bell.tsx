"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/components/notifications/use-notifications";

// Live unread badge + link to the notifications page. Used in both the admin
// shell header and the public site header — `href` points at whichever
// notifications page belongs to that surface.
export function NotificationBell({ href }: { href: string }) {
  const { unreadCount } = useNotifications();
  const has = unreadCount > 0;

  return (
    <Link
      href={href}
      aria-label={
        has ? `Notifications, ${unreadCount} unread` : "Notifications"
      }
      className="relative grid h-10 w-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
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
    </Link>
  );
}
