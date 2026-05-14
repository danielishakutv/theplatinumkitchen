// Polled by the notification bell and the /notifications pages. Returns the
// signed-in user's recent notifications plus their unread count.
import { auth } from "@/lib/auth";
import {
  listNotifications,
  countUnreadNotifications,
} from "@/modules/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const [items, unreadCount] = await Promise.all([
    listNotifications(userId),
    countUnreadNotifications(userId),
  ]);

  return Response.json(
    { items, unreadCount },
    { headers: { "Cache-Control": "no-store" } },
  );
}
