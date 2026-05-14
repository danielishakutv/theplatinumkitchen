import "server-only";

import { and, count, desc, eq, isNull, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/modules/users/schema";
import { getFromAddress, getResendClient, isConfigured } from "./client";
import {
  renderEmailChangeVerification,
  renderOrderReceived,
  renderPasswordReset,
  type OrderEmailLine,
} from "./templates";
import { notifications, type NotificationRow } from "./schema";
import type { AppNotification, NotificationType } from "./types";

interface SendResult {
  delivered: boolean;
  // Only populated in dev/no-key environments — the raw URL is also logged so
  // a human can click it during local testing.
  loggedToConsole?: boolean;
}

async function send(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<SendResult> {
  if (!isConfigured()) {
    console.log(`[notifications] (no RESEND_API_KEY) Would send to ${to}: ${subject}`);
    console.log(`[notifications] text body:\n${text}`);
    return { delivered: false, loggedToConsole: true };
  }

  const client = getResendClient();
  if (!client) {
    return { delivered: false, loggedToConsole: true };
  }

  const { error } = await client.emails.send({
    from: getFromAddress(),
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[notifications] Resend error", error);
    throw new Error(`Failed to send email: ${error.message ?? "unknown error"}`);
  }

  return { delivered: true };
}

export async function sendPasswordResetEmail(args: {
  to: string;
  resetUrl: string;
  ttlMinutes: number;
}): Promise<SendResult> {
  const { subject, html, text } = renderPasswordReset({
    resetUrl: args.resetUrl,
    ttlMinutes: args.ttlMinutes,
  });
  return send(args.to, subject, html, text);
}

export async function sendOrderReceivedEmail(args: {
  to: string;
  customerFirstName: string;
  orderNumber: string;
  totalFormatted: string;
  fulfilmentLabel: string;
  paymentLabel: string;
  trackingUrl: string;
  lines: OrderEmailLine[];
}): Promise<SendResult> {
  const { subject, html, text } = renderOrderReceived({
    customerFirstName: args.customerFirstName,
    orderNumber: args.orderNumber,
    totalFormatted: args.totalFormatted,
    fulfilmentLabel: args.fulfilmentLabel,
    paymentLabel: args.paymentLabel,
    trackingUrl: args.trackingUrl,
    lines: args.lines,
  });
  return send(args.to, subject, html, text);
}

export async function sendEmailChangeVerification(args: {
  to: string;
  verifyUrl: string;
  ttlMinutes: number;
}): Promise<SendResult> {
  const { subject, html, text } = renderEmailChangeVerification({
    verifyUrl: args.verifyUrl,
    ttlMinutes: args.ttlMinutes,
  });
  return send(args.to, subject, html, text);
}

// --- In-app notifications ----------------------------------------------------
// Distinct from the email helpers above: these write rows to the notifications
// table that the bell + /notifications pages poll. All creators are meant to
// be called fire-and-forget — a notification failure must never roll back the
// order action that triggered it.

function rowToNotification(r: NotificationRow): AppNotification {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    orderId: r.orderId ?? undefined,
    read: r.readAt !== null,
    createdAt: r.createdAt.toISOString(),
  };
}

interface NotifyInput {
  type: NotificationType;
  title: string;
  body: string;
  orderId?: string;
}

// Notify a single user (used for customer-facing order updates).
export async function notifyUser(
  userId: string,
  input: NotifyInput,
): Promise<void> {
  if (!userId) return;
  await db.insert(notifications).values({
    userId,
    type: input.type,
    title: input.title,
    body: input.body,
    orderId: input.orderId ?? null,
  });
}

// Fan a notification out to every active staff member.
export async function notifyStaff(input: NotifyInput): Promise<void> {
  const staff = await db
    .select({ id: users.id })
    .from(users)
    .where(and(ne(users.role, "customer"), eq(users.active, true)));
  if (staff.length === 0) return;
  await db.insert(notifications).values(
    staff.map((s) => ({
      userId: s.id,
      type: input.type,
      title: input.title,
      body: input.body,
      orderId: input.orderId ?? null,
    })),
  );
}

export async function listNotifications(
  userId: string,
  limit = 30,
): Promise<AppNotification[]> {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  return rows.map(rowToNotification);
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.readAt)),
    );
  return row?.n ?? 0;
}

// Scoped by userId so a caller can only ever touch their own notifications.
export async function markNotificationRead(
  userId: string,
  id: string,
): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
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
    .set({ readAt: new Date() })
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.readAt)),
    );
}
