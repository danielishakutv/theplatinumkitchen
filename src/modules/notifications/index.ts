// Public surface of the notifications module. Server-only — the whole module
// uses Resend / db / "server-only" and has no client-safe value exports.
// Client components type-import from ./types instead.
// See [[feedback_client_imports]].
import "server-only";

export {
  sendPasswordResetEmail,
  sendEmailChangeVerification,
  sendOrderReceivedEmail,
  sendNewOrderStaffEmail,
} from "./service";
export { isConfigured as isEmailConfigured } from "./client";

// In-app notifications.
export {
  notifyUser,
  notifyStaff,
  listNotifications,
  countUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./service";
export type { AppNotification, NotificationType } from "./types";
export { notifications } from "./schema";
