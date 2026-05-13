"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  ORDER_ERROR_STATUS,
  OrderServiceError,
  markOrderPaid,
  markOrderUnpaid,
  updateOrderStatus,
  type OrderStatus,
} from "@/modules/orders";
import { PermissionError } from "@/modules/users";

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
    void ORDER_ERROR_STATUS;
    const map: Record<string, string> = {
      ORDER_INVALID_INPUT: "Some details don't look right. Check and try again.",
      ORDER_NOT_FOUND: "That order doesn't exist.",
      ORDER_STATUS_INVALID: err.message || "Status transition not allowed.",
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
