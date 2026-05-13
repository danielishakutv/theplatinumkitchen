// Public surface of the orders module. Do NOT deep-import from this module.
export type {
  Order,
  OrderLine,
  OrderLineAddon,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  FulfilmentMethod,
  Customer,
  DeliveryAddress,
  OrderError,
} from "./types";
export {
  OrderServiceError,
  ORDER_ERROR_STATUS,
  NEXT_STATUSES,
} from "./types";

export {
  placeOrderSchema,
  updateStatusSchema,
  fulfilmentEnum,
  paymentMethodEnum,
  orderStatusEnum,
  paymentStatusEnum,
  type PlaceOrderInput,
  type UpdateStatusInput,
} from "./validation";

export {
  createOrderFromCart,
  getOrderById,
  getOrderByNumber,
  listOrders,
  updateOrderStatus,
  markOrderPaid,
  markOrderUnpaid,
} from "./service";

export { orders, orderLines, invoiceCounters } from "./schema";
