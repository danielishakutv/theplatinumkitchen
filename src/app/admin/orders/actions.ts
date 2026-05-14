"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  OrderServiceError,
  createOrderFromCart,
  deleteOrder,
  markOrderPaid,
  markOrderUnpaid,
  updateOrder,
  updateOrderStatus,
  type AdminUpdateOrderInput,
  type OrderStatus,
  type PlaceOrderInput,
} from "@/modules/orders";
import { PermissionError, requirePermission } from "@/modules/users";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function requireUser() {
  const session = await auth();
  return session?.user ?? null;
}

function toError(err: unknown): ActionResult {
  if (err instanceof OrderServiceError) {
    const map: Record<string, string> = {
      ORDER_INVALID_INPUT: "Some details don't look right. Check and try again.",
      ORDER_NOT_FOUND: "That order doesn't exist.",
      ORDER_STATUS_INVALID: err.message || "Status transition not allowed.",
      ORDER_NOT_EDITABLE: err.message || "This order can no longer be edited.",
      ORDER_ITEM_NOT_FOUND: err.message || "A dish on this order no longer exists.",
      ORDER_ADDON_NOT_FOUND: err.message || "An add-on on this order was removed.",
    };
    return { ok: false, error: map[err.code] ?? err.message ?? "Operation failed." };
  }
  if (err instanceof PermissionError) {
    return { ok: false, error: "You don't have permission for that." };
  }
  console.error("[admin/orders] unexpected", err);
  return { ok: false, error: "Something went wrong." };
}

function revalidateOrderPaths(id: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/kitchen");
  revalidatePath(`/order/${id}`);
}

export async function setOrderStatusAction(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    await updateOrderStatus(user, id, { status });
    revalidateOrderPaths(id);
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function markPaidAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    await markOrderPaid(user, id);
    revalidateOrderPaths(id);
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function markUnpaidAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    await markOrderUnpaid(user, id);
    revalidateOrderPaths(id);
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

// Places an order from the admin panel (phone-in / walk-in). Reuses the same
// pricing + invoice-numbering path as customer checkout, but skips the
// "new order" staff email — whoever placed it doesn't need to email
// themselves. Returns the new order id so the caller can open it.
export async function createOrderAction(
  input: PlaceOrderInput,
): Promise<ActionResult & { orderId?: string }> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    requirePermission(user, "orders:write");
    const { order } = await createOrderFromCart({
      payload: input,
      emailStaffOnCreate: false,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/kitchen");
    return { ok: true, orderId: order.id };
  } catch (err) {
    return toError(err);
  }
}

// Edits an existing order's contents — items, customer, fulfilment, address,
// payment method, notes. Status and payment status are untouched here.
export async function updateOrderAction(
  id: string,
  input: AdminUpdateOrderInput,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    await updateOrder(user, id, input);
    revalidateOrderPaths(id);
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

// Hard-deletes an order. The caller (a client component) navigates away on
// success, since the order's own detail page no longer exists.
export async function deleteOrderAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    await deleteOrder(user, id);
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/kitchen");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
