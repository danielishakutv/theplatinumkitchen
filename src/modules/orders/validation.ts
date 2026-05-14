import { z } from "zod";

export const fulfilmentEnum = z.enum(["delivery", "pickup", "dine_in"]);
export const paymentMethodEnum = z.enum(["cod", "bank_transfer", "paystack"]);
export const orderStatusEnum = z.enum([
  "received",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);
export const paymentStatusEnum = z.enum(["unpaid", "paid", "refunded"]);

const cartAddonSchema = z.object({
  groupId: z.string().min(1).max(100),
  optionId: z.string().min(1).max(100),
});

const cartLineSchema = z.object({
  itemId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(99),
  addons: z.array(cartAddonSchema).max(20).default([]),
  notes: z.string().trim().max(500).optional(),
});

const customerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z
    .union([z.string().trim().toLowerCase().email().max(254), z.literal("")])
    .optional(),
});

const addressSchema = z.object({
  street: z.string().trim().min(1).max(200),
  area: z.string().trim().min(1).max(120),
  city: z.string().trim().max(120).default("Abuja"),
  state: z.string().trim().max(120).default("FCT"),
  landmark: z.string().trim().max(200).optional(),
  instructions: z.string().trim().max(500).optional(),
});

export const placeOrderSchema = z
  .object({
    lines: z.array(cartLineSchema).min(1).max(50),
    customer: customerSchema,
    fulfilment: fulfilmentEnum,
    address: addressSchema.optional(),
    paymentMethod: paymentMethodEnum.default("cod"),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine(
    (v) => v.fulfilment !== "delivery" || v.address !== undefined,
    { message: "Delivery orders need an address", path: ["address"] },
  );
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const updateStatusSchema = z.object({
  status: orderStatusEnum,
});
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

// Admin order edit. Same building blocks as placing an order, but payment
// *status* stays managed by the dedicated mark-paid/unpaid actions, so it's
// deliberately not part of this payload.
export const adminUpdateOrderSchema = z
  .object({
    lines: z.array(cartLineSchema).min(1).max(50),
    customer: customerSchema,
    fulfilment: fulfilmentEnum,
    address: addressSchema.optional(),
    paymentMethod: paymentMethodEnum,
    notes: z.string().trim().max(1000).optional(),
  })
  .refine(
    (v) => v.fulfilment !== "delivery" || v.address !== undefined,
    { message: "Delivery orders need an address", path: ["address"] },
  );
export type AdminUpdateOrderInput = z.infer<typeof adminUpdateOrderSchema>;
