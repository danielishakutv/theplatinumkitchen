// In-app notification inbox — create / query / mark-read against the
// `notifications` table. Server-only; the email side lives in service.ts.
import "server-only";

import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/modules/users/schema";
import { notifications, type NotificationRow } from "./schema";
import type { AppNotification } from "./types";

function rowToNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    orderId: row.orderId ?? undefined,
    read: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  };
}

// Customer-facing copy for each order status. Kept local so the
// notifications module doesn't take a runtime dependency on the orders
// module (orders already depends on notifications — see service.ts).
const STATUS_COPY: Record<string, { title: string; body: (n: string) => string }> = {
  received: {
    title: "Order received",
    body: (n) => `We've got order ${n} — the kitchen will start on it shortly.`,
  },
  preparing: {
    title: "Your order is being prepared",
    body: (n) => `The kitchen is working on order ${n} right now.`,
  },
  ready: {
    title: "Your order is ready",
    body: (n) => `Order ${n} is ready.`,
  },
  out_for_delivery: {
    title: "Out for delivery",
    body: (n) => `Order ${n} is on its way to you.`,
  },
  delivered: {
    title: "Order delivered",
    body: (n) => `Order ${n} has been delivered. Enjoy!`,
  },
  cancelled: {
    title: "Order cancelled",
    body: (n) => `Order ${n} was cancelled. Give us a call if that's unexpected.`,
  },
};

// New order → fan out one row per active staff member.
export async function notifyStaffOrderPlaced(input: {
  orderId: string;
  orderNumber: string;
  customerName: string;
}): Promise<void> {
  const staff = await db
    .select({ id: users.id })
    .from(users)
    .where(and(ne(users.role, "customer"), eq(users.active, true)));
  if (staff.length === 0) return;
  await db.insert(notifications).values(
    staff.map((s) => ({
      userId: s.id,
      type: "order_placed" as const,
      title: `New order ${input.orderNumber}`,
      body: `${input.customerName} just placed an order.`,
      orderId: input.orderId,
    })),
  );
}

// Order status changed → notify the customer who owns the order. No-op for
// guest orders (no userId on the order).
export async function notifyCustomerOrderStatus(input: {
  orderId: string;
  orderNumber: string;
  userId?: string;
  status: string;
}): Promise<void> {
  if (!input.userId) return;
  const copy = STATUS_COPY[input.status];
  if (!copy) return;
  await db.insert(notifications).values({
    userId: input.userId,
    type: "order_status",
    title: copy.title,
    body: copy.body(input.orderNumber),
    orderId: input.orderId,
  });
}

// Order marked paid → notify the customer who owns the order.
export async function notifyCustomerOrderPaid(input: {
  orderId: string;
  orderNumber: string;
  userId?: string;
}): Promise<void> {
  if (!input.userId) return;
  await db.insert(notifications).values({
    userId: input.userId,
    type: "order_paid",
    title: "Payment confirmed",
    body: `We've confirmed payment for order ${input.orderNumber}. Thank you!`,
    orderId: input.orderId,
  });
}

export async function listNotifications(
  userId: string,
  limit = 50,
): Promise<AppNotification[]> {
  if (!userId) return [];
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  return rows.map(rowToNotification);
}

export async function getUnreadCount(userId: string): Promise<number> {
  if (!userId) return 0;
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return row?.count ?? 0;
}

export async function markNotificationRead(
  userId: string,
  id: string,
): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: sql`now()` })
    .where(
      and(
        eq(notifications.id, id),
        eq(notifications.userId, userId),
        isNull(notifications.readAt),
      ),
    );
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: sql`now()` })
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.readAt)),
    );
}
