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
}

export interface CartTotals {
  subtotal: number;
  serviceCharge: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export type { FulfilmentMethod };
