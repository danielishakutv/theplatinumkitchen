// Public surface of the orders module. Server-only — client components must
// import types only, or deep-import values from leaves like
// @/modules/orders/types, @/modules/orders/validation.
// See [[feedback_client_imports]].
import "server-only";

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
  PAYMENT_METHOD_LABEL,
} from "./types";

export {
  placeOrderSchema,
  updateStatusSchema,
  adminUpdateOrderSchema,
  fulfilmentEnum,
  paymentMethodEnum,
  orderStatusEnum,
  paymentStatusEnum,
  type PlaceOrderInput,
  type UpdateStatusInput,
  type AdminUpdateOrderInput,
} from "./validation";

export {
  createOrderFromCart,
  getOrderById,
  getOrderByNumber,
  listOrders,
  listOrdersForUser,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  markOrderPaid,
  markOrderUnpaid,
  getPopularItems,
  type PopularItem,
} from "./service";

export { orders, orderLines, invoiceCounters } from "./schema";
