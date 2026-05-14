import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { menuAddonOptions, menuItems } from "@/modules/menu/schema";
import { requirePermission, type ActorLike } from "@/modules/users/permissions";
import { sendOrderReceivedEmail } from "@/modules/notifications";
import { appUrl } from "@/lib/url";
import { formatNaira } from "@/lib/format";
import {
  invoiceCounters,
  orderLines,
  orders,
  type OrderLineRow,
  type OrderRow,
} from "./schema";
import {
  placeOrderSchema,
  updateStatusSchema,
  type PlaceOrderInput,
  type UpdateStatusInput,
} from "./validation";
import {
  NEXT_STATUSES,
  OrderServiceError,
  PAYMENT_METHOD_LABEL,
  type Order,
  type OrderLine,
  type OrderLineAddon,
  type OrderStatus,
} from "./types";

const SERVICE_RATE = 0.05;
const DELIVERY_FEES: Record<string, number> = {
  delivery: 1500,
  pickup: 0,
  dine_in: 0,
};

function rowToOrder(row: OrderRow, lines: OrderLine[]): Order {
  return {
    id: row.id,
    number: row.number,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    status: row.status,
    fulfilment: row.fulfilment,
    userId: row.userId ?? undefined,
    customer: {
      name: row.customerName,
      phone: row.customerPhone,
      email: row.customerEmail ?? undefined,
    },
    address: row.addressStreet
      ? {
          street: row.addressStreet,
          area: row.addressArea ?? "",
          city: row.addressCity ?? "",
          state: row.addressState ?? "",
          landmark: row.addressLandmark ?? undefined,
          instructions: row.addressInstructions ?? undefined,
        }
      : undefined,
    lines,
    subtotal: row.subtotal,
    serviceCharge: row.serviceCharge,
    deliveryFee: row.deliveryFee,
    total: row.total,
    paymentMethod: row.paymentMethod,
    paymentStatus: row.paymentStatus,
    paystackReference: row.paystackReference ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function lineRowToLine(row: OrderLineRow): OrderLine {
  return {
    id: row.id,
    itemId: row.itemId,
    itemName: row.itemName,
    imageUrl: row.imageUrl,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    addons: (row.addons as OrderLineAddon[]) ?? [],
    notes: row.notes ?? undefined,
  };
}

async function loadLinesByOrderIds(
  orderIds: string[],
): Promise<Map<string, OrderLine[]>> {
  const out = new Map<string, OrderLine[]>();
  if (orderIds.length === 0) return out;
  const rows = await db
    .select()
    .from(orderLines)
    .where(inArray(orderLines.orderId, orderIds))
    .orderBy(asc(orderLines.sortOrder));
  for (const id of orderIds) out.set(id, []);
  for (const r of rows) {
    out.get(r.orderId)!.push(lineRowToLine(r));
  }
  return out;
}

export interface CreateOrderResult {
  order: Order;
}

// Pulls each line's MenuItem + addon options from the DB, computes prices
// server-side (never trusts client-provided amounts), then writes the order
// + lines in a single transaction. Invoice number is generated atomically
// via SELECT ... FOR UPDATE on invoice_counters(year).
export async function createOrderFromCart(input: {
  payload: PlaceOrderInput;
  userId?: string;
}): Promise<CreateOrderResult> {
  const parsed = placeOrderSchema.safeParse(input.payload);
  if (!parsed.success) {
    throw new OrderServiceError("ORDER_INVALID_INPUT", parsed.error.message);
  }
  const data = parsed.data;

  // Look up all referenced items in one shot.
  const itemIds = Array.from(new Set(data.lines.map((l) => l.itemId)));
  const itemRows = await db
    .select()
    .from(menuItems)
    .where(inArray(menuItems.id, itemIds));
  const itemById = new Map(itemRows.map((r) => [r.id, r]));

  for (const l of data.lines) {
    const item = itemById.get(l.itemId);
    if (!item) {
      throw new OrderServiceError(
        "ORDER_ITEM_NOT_FOUND",
        `Dish ${l.itemId} no longer exists.`,
      );
    }
    if (!item.available) {
      throw new OrderServiceError(
        "ORDER_ITEM_UNAVAILABLE",
        `${item.name} is sold out today.`,
      );
    }
  }

  // Look up all referenced addon options in one shot.
  const optionIds = Array.from(
    new Set(data.lines.flatMap((l) => l.addons.map((a) => a.optionId))),
  );
  const optionRows =
    optionIds.length > 0
      ? await db
          .select()
          .from(menuAddonOptions)
          .where(inArray(menuAddonOptions.id, optionIds))
      : [];
  const optionById = new Map(optionRows.map((r) => [r.id, r]));

  // Build line snapshots with server-computed prices.
  const lineSnapshots = data.lines.map((l, idx) => {
    const item = itemById.get(l.itemId)!;
    const addonSnapshots: OrderLineAddon[] = [];
    for (const a of l.addons) {
      const opt = optionById.get(a.optionId);
      if (!opt || opt.groupId !== a.groupId) {
        throw new OrderServiceError(
          "ORDER_ADDON_NOT_FOUND",
          `Option ${a.optionId} was removed or moved.`,
        );
      }
      addonSnapshots.push({
        groupId: a.groupId,
        optionId: a.optionId,
        name: opt.name,
        priceDelta: opt.priceDelta,
      });
    }
    const unitPrice = item.price;
    const lineTotal =
      (unitPrice + addonSnapshots.reduce((s, a) => s + a.priceDelta, 0)) *
      l.quantity;
    return { l, item, addonSnapshots, unitPrice, lineTotal, idx };
  });

  const subtotal = lineSnapshots.reduce((s, x) => s + x.lineTotal, 0);
  const serviceCharge = Math.round(subtotal * SERVICE_RATE);
  const deliveryFee = subtotal > 0 ? DELIVERY_FEES[data.fulfilment] ?? 0 : 0;
  const total = subtotal + serviceCharge + deliveryFee;

  const orderId = await db.transaction(async (tx) => {
    // Atomic invoice number: upsert this year's counter, lock the row, bump.
    const year = new Date().getUTCFullYear();
    await tx
      .insert(invoiceCounters)
      .values({ year, lastNumber: 0 })
      .onConflictDoNothing();
    const [{ lastNumber }] = await tx
      .select({ lastNumber: invoiceCounters.lastNumber })
      .from(invoiceCounters)
      .where(eq(invoiceCounters.year, year))
      .for("update");
    const next = lastNumber + 1;
    await tx
      .update(invoiceCounters)
      .set({ lastNumber: next })
      .where(eq(invoiceCounters.year, year));
    const number = `PK-${year}-${String(next).padStart(4, "0")}`;

    const [row] = await tx
      .insert(orders)
      .values({
        number,
        status: "received",
        fulfilment: data.fulfilment,
        userId: input.userId ?? null,
        customerName: data.customer.name,
        customerPhone: data.customer.phone,
        customerEmail: data.customer.email || null,
        addressStreet: data.address?.street ?? null,
        addressArea: data.address?.area ?? null,
        addressCity: data.address?.city ?? null,
        addressState: data.address?.state ?? null,
        addressLandmark: data.address?.landmark ?? null,
        addressInstructions: data.address?.instructions ?? null,
        subtotal,
        serviceCharge,
        deliveryFee,
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus: "unpaid",
        notes: data.notes ?? null,
      })
      .returning({ id: orders.id });

    await tx.insert(orderLines).values(
      lineSnapshots.map((x) => ({
        orderId: row.id,
        itemId: x.item.id,
        itemName: x.item.name,
        imageUrl: x.item.imageUrl,
        quantity: x.l.quantity,
        unitPrice: x.unitPrice,
        addons: x.addonSnapshots,
        notes: x.l.notes ?? null,
        sortOrder: x.idx,
      })),
    );

    return row.id;
  });

  const created = await getOrderById(orderId);
  if (!created) throw new OrderServiceError("ORDER_NOT_FOUND");

  // Fire-and-forget the customer confirmation email. Don't block the order
  // creation response — any Resend error gets logged inside the notifications
  // module but doesn't roll back the order.
  if (created.customer.email) {
    sendOrderReceivedEmail({
      to: created.customer.email,
      customerFirstName: created.customer.name.split(" ")[0] || created.customer.name,
      orderNumber: created.number,
      totalFormatted: formatNaira(created.total),
      fulfilmentLabel:
        created.fulfilment === "delivery"
          ? "Delivery"
          : created.fulfilment === "pickup"
            ? "Pickup"
            : "Dine in",
      paymentLabel: PAYMENT_METHOD_LABEL[created.paymentMethod],
      trackingUrl: appUrl(`/order/${created.id}`),
      lines: created.lines.map((line) => ({
        name: line.itemName,
        quantity: line.quantity,
        addons: line.addons.map((a) => a.name),
        unitTotalFormatted: formatNaira(
          (line.unitPrice + line.addons.reduce((s, a) => s + a.priceDelta, 0)) *
            line.quantity,
        ),
      })),
    }).catch((err) => console.error("[orders] order email failed", err));
  }

  return { order: created };
}

export async function getOrderById(id: string): Promise<Order | null> {
  const [row] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!row) return null;
  const lines = await loadLinesByOrderIds([row.id]);
  return rowToOrder(row, lines.get(row.id) ?? []);
}

export async function getOrderByNumber(number: string): Promise<Order | null> {
  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.number, number))
    .limit(1);
  if (!row) return null;
  const lines = await loadLinesByOrderIds([row.id]);
  return rowToOrder(row, lines.get(row.id) ?? []);
}

export interface ListOrdersOptions {
  status?: OrderStatus | OrderStatus[];
  limit?: number;
  search?: string; // matches against number / customer name / phone
}

export async function listOrders(
  actor: ActorLike,
  options: ListOrdersOptions = {},
): Promise<Order[]> {
  requirePermission(actor, "orders:read");
  const filters = [];
  if (options.status) {
    if (Array.isArray(options.status)) {
      filters.push(inArray(orders.status, options.status));
    } else {
      filters.push(eq(orders.status, options.status));
    }
  }
  if (options.search) {
    const q = `%${options.search.toLowerCase().replace(/[%_]/g, "")}%`;
    filters.push(
      sql`(lower(${orders.number}) like ${q} or lower(${orders.customerName}) like ${q} or lower(${orders.customerPhone}) like ${q})`,
    );
  }
  const where = filters.length === 0 ? undefined : and(...filters);

  const rows = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(options.limit ?? 200);
  const lines = await loadLinesByOrderIds(rows.map((r) => r.id));
  return rows.map((r) => rowToOrder(r, lines.get(r.id) ?? []));
}

export async function updateOrderStatus(
  actor: ActorLike,
  id: string,
  input: UpdateStatusInput,
): Promise<Order> {
  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw new OrderServiceError("ORDER_INVALID_INPUT", parsed.error.message);
  }
  const next = parsed.data.status;
  // cancellation needs orders:cancel; everything else uses orders:write or
  // kitchen:advance (kitchen role can move through prep/ready stages).
  if (next === "cancelled") {
    requirePermission(actor, "orders:cancel");
  } else if (next === "preparing" || next === "ready") {
    requirePermission(actor, "kitchen:advance");
  } else {
    requirePermission(actor, "orders:write");
  }

  const [existing] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!existing) throw new OrderServiceError("ORDER_NOT_FOUND");

  const allowed = NEXT_STATUSES[existing.status];
  if (!allowed.includes(next)) {
    throw new OrderServiceError(
      "ORDER_STATUS_INVALID",
      `Cannot move from ${existing.status} to ${next}.`,
    );
  }

  await db.update(orders).set({ status: next }).where(eq(orders.id, id));
  const updated = await getOrderById(id);
  return updated!;
}

export async function markOrderPaid(
  actor: ActorLike,
  id: string,
  paystackReference?: string,
): Promise<Order> {
  requirePermission(actor, "invoices:mark_paid");
  const [existing] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!existing) throw new OrderServiceError("ORDER_NOT_FOUND");
  await db
    .update(orders)
    .set({
      paymentStatus: "paid",
      paystackReference: paystackReference ?? existing.paystackReference,
    })
    .where(eq(orders.id, id));
  const updated = await getOrderById(id);
  return updated!;
}

export async function markOrderUnpaid(actor: ActorLike, id: string): Promise<Order> {
  requirePermission(actor, "invoices:mark_paid");
  const [existing] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!existing) throw new OrderServiceError("ORDER_NOT_FOUND");
  await db
    .update(orders)
    .set({ paymentStatus: "unpaid" })
    .where(eq(orders.id, id));
  const updated = await getOrderById(id);
  return updated!;
}
