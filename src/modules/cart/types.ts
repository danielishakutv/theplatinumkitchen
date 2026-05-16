import type { FulfilmentMethod } from "@/modules/orders";

export interface CartLineAddon {
  groupId: string;
  optionId: string;
  name: string;
  priceDelta: number;
}

export interface CartLine {
  id: string;
  itemId: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  addons: CartLineAddon[];
  notes?: string;
  // Stock snapshot taken when the item was added. `null`/`undefined` =
  // untracked (no cap). The cart UI uses this to cap the quantity stepper
  // and show "X left" hints. The server re-checks atomically at order
  // submission — this is UX, not the security wall.
  stockQuantity?: number | null;
}

export interface CartTotals {
  subtotal: number;
  serviceCharge: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export type { FulfilmentMethod };
