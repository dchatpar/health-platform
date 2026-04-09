// Order Status Constants

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DISPATCHED: 'DISPATCHED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderStatusDisplayName: Record<OrderStatusType, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  DISPATCHED: 'Dispatched',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export const OrderStatusDescription: Record<OrderStatusType, string> = {
  PENDING: 'Order has been placed and is awaiting pharmacy confirmation',
  CONFIRMED: 'Order has been confirmed by the pharmacy',
  PREPARING: 'Order is being prepared by the pharmacy',
  READY: 'Order is ready for pickup or delivery',
  DISPATCHED: 'Order has been dispatched from the pharmacy',
  OUT_FOR_DELIVERY: 'Order is out for delivery',
  DELIVERED: 'Order has been delivered successfully',
  CANCELLED: 'Order has been cancelled',
  REFUNDED: 'Order has been refunded',
};

export const OrderStatusColor: Record<OrderStatusType, string> = {
  PENDING: '#FFA500',
  CONFIRMED: '#00BFFF',
  PREPARING: '#9370DB',
  READY: '#32CD32',
  DISPATCHED: '#4169E1',
  OUT_FOR_DELIVERY: '#4169E1',
  DELIVERED: '#008000',
  CANCELLED: '#DC143C',
  REFUNDED: '#808080',
};

export const OrderStatusOrder: OrderStatusType[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.DISPATCHED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
];

export const ORDER_CANCELLABLE_STATUSES: OrderStatusType[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
];

export const REFUNDABLE_STATUSES: OrderStatusType[] = [
  OrderStatus.DELIVERED,
  OrderStatus.REFUNDED,
];

export const DELIVERY_STATUSES: OrderStatusType[] = [
  OrderStatus.DISPATCHED,
  OrderStatus.OUT_FOR_DELIVERY,
];

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  [OrderStatus.PENDING]: [
    OrderStatus.CONFIRMED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.CONFIRMED]: [
    OrderStatus.PREPARING,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PREPARING]: [
    OrderStatus.READY,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.READY]: [
    OrderStatus.DISPATCHED,
    OrderStatus.OUT_FOR_DELIVERY,
  ],
  [OrderStatus.DISPATCHED]: [
    OrderStatus.OUT_FOR_DELIVERY,
  ],
  [OrderStatus.OUT_FOR_DELIVERY]: [
    OrderStatus.DELIVERED,
  ],
  [OrderStatus.DELIVERED]: [
    OrderStatus.REFUNDED,
  ],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export const PAYMENT_ON_DELIVERY_STATUSES: OrderStatusType[] = [
  OrderStatus.READY,
  OrderStatus.DISPATCHED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];
