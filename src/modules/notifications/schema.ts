import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "@/modules/users/schema";

// In-app notifications. One row per recipient — staff-wide events fan out to
// a row per active staff member at creation time.
export const notificationTypeEnum = pgEnum("notification_type", [
  "order_placed", // a new order came in → staff
  "order_status", // an order's status changed → the customer
  "order_paid", // an order was marked paid → the customer
]);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    // Deep-link target — an order id for every current type. Kept FK-free so
    // a future order purge can't strand notification history.
    orderId: uuid("order_id"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Drives both the list query and the unread count.
    index("notifications_user_created_idx").on(t.userId, t.createdAt),
  ],
);

export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;
