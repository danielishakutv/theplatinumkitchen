"use server";

import { auth } from "@/lib/auth";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/modules/notifications";

export interface NotificationActionResult {
  ok: boolean;
}

export async function markNotificationReadAction(
  id: string,
): Promise<NotificationActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  await markNotificationRead(session.user.id, id);
  return { ok: true };
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  await markAllNotificationsRead(session.user.id);
  return { ok: true };
}
