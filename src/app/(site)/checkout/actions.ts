"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  ORDER_ERROR_STATUS,
  OrderServiceError,
  createOrderFromCart,
  type PlaceOrderInput,
} from "@/modules/orders";

interface OkResult {
  ok: true;
  orderId: string;
  orderNumber: string;
}

interface ErrResult {
  ok: false;
  error: string;
}

export type PlaceOrderResult = OkResult | ErrResult;

export async function placeOrderAction(
  payload: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const session = await auth();
  try {
    const { order } = await createOrderFromCart({
      payload,
      userId: session?.user?.id,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/kitchen");
    return { ok: true, orderId: order.id, orderNumber: order.number };
  } catch (err) {
    if (err instanceof OrderServiceError) {
      void ORDER_ERROR_STATUS;
      const map: Record<string, string> = {
        ORDER_INVALID_INPUT: "Some order details aren't right — please review and try again.",
        ORDER_ITEM_NOT_FOUND: "One of the dishes in your cart is no longer on the menu.",
        ORDER_ITEM_UNAVAILABLE: "One of the dishes in your cart is sold out.",
        ORDER_ADDON_NOT_FOUND: "An add-on was removed since you picked it. Please rebuild your selection.",
      };
      return { ok: false, error: map[err.code] ?? err.message ?? "Couldn't place the order." };
    }
    console.error("[checkout] unexpected error", err);
    return { ok: false, error: "Something went wrong placing your order." };
  }
}
