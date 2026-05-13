export type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type FulfilmentMethod = "delivery" | "pickup" | "dine_in";

export type PaymentMethod = "cod" | "paystack";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

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
  status: OrderStatus;
  fulfilment: FulfilmentMethod;
  customer: Customer;
  address?: DeliveryAddress;
  lines: OrderLine[];
  subtotal: number;
  serviceCharge: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
}
