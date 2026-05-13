import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "@/modules/users/schema";

export const orderStatusEnum = pgEnum("order_status", [
  "received",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const fulfilmentMethodEnum = pgEnum("fulfilment_method", [
  "delivery",
  "pickup",
  "dine_in",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["cod", "paystack"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "paid",
  "refunded",
]);

// Atomic invoice number generator. One row per year, locked with FOR UPDATE
// inside the order-creation transaction so concurrent creates never collide.
export const invoiceCounters = pgTable("invoice_counters", {
  year: integer("year").primaryKey(),
  lastNumber: integer("last_number").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Human-friendly identifier shown on receipts: PK-YYYY-NNNN.
    number: text("number").notNull().unique(),

    status: orderStatusEnum("status").notNull().default("received"),
    fulfilment: fulfilmentMethodEnum("fulfilment").notNull(),

    // Customer snapshot. userId is set when a signed-in customer placed it;
    // null for guest checkouts. The name/phone/email are denormalised at
    // order time so deleting the user doesn't lose the order's contact info.
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerEmail: text("customer_email"),

    // Delivery address fields (nullable — only used when fulfilment=delivery).
    addressStreet: text("address_street"),
    addressArea: text("address_area"),
    addressCity: text("address_city"),
    addressState: text("address_state"),
    addressLandmark: text("address_landmark"),
    addressInstructions: text("address_instructions"),

    // Money fields are integer NGN.
    subtotal: integer("subtotal").notNull().default(0),
    serviceCharge: integer("service_charge").notNull().default(0),
    deliveryFee: integer("delivery_fee").notNull().default(0),
    total: integer("total").notNull().default(0),

    paymentMethod: paymentMethodEnum("payment_method").notNull().default("cod"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
    paystackReference: text("paystack_reference"),

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (t) => [
    index("orders_status_idx").on(t.status),
    index("orders_created_at_idx").on(t.createdAt),
    index("orders_user_id_idx").on(t.userId),
  ],
);

export const orderLines = pgTable(
  "order_lines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    // itemId stays as text so deleting the menu item later doesn't break old
    // orders. We snapshot the name/image/price below.
    itemId: text("item_id").notNull(),
    itemName: text("item_name").notNull(),
    imageUrl: text("image_url").notNull().default(""),
    quantity: integer("quantity").notNull().default(1),
    // The dish's base price at order time.
    unitPrice: integer("unit_price").notNull(),
    // Addon snapshots as JSON: array of { groupId, optionId, name, priceDelta }.
    addons: jsonb("addons").notNull().default(sql`'[]'::jsonb`),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("order_lines_order_id_idx").on(t.orderId)],
);

export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
export type OrderLineRow = typeof orderLines.$inferSelect;
export type NewOrderLineRow = typeof orderLines.$inferInsert;
export type InvoiceCounterRow = typeof invoiceCounters.$inferSelect;
