export type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type FulfilmentMethod = "delivery" | "pickup" | "dine_in";

export type PaymentMethod = "cod" | "bank_transfer" | "paystack";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
  paystack: "Pay Online",
};

export interface OrderLineAddon {
  groupId: string;
  optionId: string;
  name: string;
  priceDelta: number;
}

export interface OrderLine {
  id: string;
  itemId: string;
  itemName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  addons: OrderLineAddon[];
  notes?: string;
}

export interface DeliveryAddress {
  street: string;
  area: string;
  city: string;
  state: string;
  landmark?: string;
  instructions?: string;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  fulfilment: FulfilmentMethod;
  customer: Customer;
  userId?: string;
  address?: DeliveryAddress;
  lines: OrderLine[];
  subtotal: number;
  serviceCharge: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paystackReference?: string;
  notes?: string;
}

export type OrderError =
  | "ORDER_INVALID_INPUT"
  | "ORDER_NOT_FOUND"
  | "ORDER_ITEM_NOT_FOUND"
  | "ORDER_ITEM_UNAVAILABLE"
  | "ORDER_ADDON_NOT_FOUND"
  | "ORDER_STATUS_INVALID"
  | "ORDER_NOT_EDITABLE";

export class OrderServiceError extends Error {
  constructor(
    public readonly code: OrderError,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "OrderServiceError";
  }
}

export const ORDER_ERROR_STATUS: Record<OrderError, number> = {
  ORDER_INVALID_INPUT: 422,
  ORDER_NOT_FOUND: 404,
  ORDER_ITEM_NOT_FOUND: 422,
  ORDER_ITEM_UNAVAILABLE: 409,
  ORDER_ADDON_NOT_FOUND: 422,
  ORDER_STATUS_INVALID: 409,
  ORDER_NOT_EDITABLE: 409,
};

// Status transition rules. Empty array = terminal state.
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  received: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "delivered", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};
