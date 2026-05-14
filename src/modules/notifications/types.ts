// Named AppNotification to avoid colliding with the DOM `Notification` global.
export type NotificationType = "order_placed" | "order_status" | "order_paid";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}
