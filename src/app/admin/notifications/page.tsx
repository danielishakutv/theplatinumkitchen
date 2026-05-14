import type { Metadata } from "next";
import { NotificationList } from "@/components/notification-list";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notifications" };

export default function AdminNotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live updates on orders and kitchen activity.
        </p>
      </header>
      <NotificationList orderHrefBase="/admin/orders" />
    </div>
  );
}
