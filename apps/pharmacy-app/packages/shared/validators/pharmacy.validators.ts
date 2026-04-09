// Pharmacy Validators

import { z } from 'zod';

const orderStatusEnum = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'DISPATCHED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

const paymentMethodEnum = ['WALLET', 'CARD', 'INSURANCE', 'COD'] as const;

const coordinatesSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
});

const deliveryAddressSchema = z.object({
  street: z
    .string()
    .min(1, 'Street is required')
    .max(200, 'Street must be less than 200 characters'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .max(100, 'State must be less than 100 characters'),
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .max(20, 'Postal code must be less than 20 characters'),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters'),
  coordinates: coordinatesSchema.optional(),
  instructions: z.string().max(500, 'Instructions must be less than 500 characters').optional(),
});

const orderItemSchema = z.object({
  medicineId: z.string({
    required_error: 'Medicine ID is required',
    invalid_type_error: 'Medicine ID must be a string',
  }),
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity is too high'),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
});

export const CreateOrderSchema = z.object({
  pharmacyId: z.string({
    required_error: 'Pharmacy ID is required',
    invalid_type_error: 'Pharmacy ID must be a string',
  }),
  prescriptionId: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  deliveryAddress: deliveryAddressSchema,
  deliveryInstructions: z.string().max(500, 'Instructions must be less than 500 characters').optional(),
  paymentMethod: z.enum(paymentMethodEnum, {
    required_error: 'Payment method is required',
    invalid_type_error: 'Payment method must be a valid enum value',
  }),
});

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string({
    required_error: 'Order ID is required',
    invalid_type_error: 'Order ID must be a string',
  }),
  status: z.enum(orderStatusEnum, {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a valid enum value',
  }),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const CancelOrderSchema = z.object({
  orderId: z.string({
    required_error: 'Order ID is required',
    invalid_type_error: 'Order ID must be a string',
  }),
  reason: z
    .string()
    .min(1, 'Cancellation reason is required')
    .max(500, 'Reason must be less than 500 characters'),
});

export const OrderSearchSchema = z.object({
  patientId: z.string().optional(),
  pharmacyId: z.string().optional(),
  status: z.enum(orderStatusEnum).optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  page: z
    .number()
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be less than 100')
    .default(20),
});

export const UpdateStockSchema = z.object({
  medicineId: z.string({
    required_error: 'Medicine ID is required',
    invalid_type_error: 'Medicine ID must be a string',
  }),
  quantity: z
    .number()
    .min(0, 'Quantity cannot be negative')
    .max(100000, 'Quantity is too high'),
  operation: z.enum(['ADD', 'REMOVE', 'SET'], {
    required_error: 'Operation is required',
    invalid_type_error: 'Operation must be ADD, REMOVE, or SET',
  }),
});

export const SearchMedicineSchema = z.object({
  name: z.string().max(200, 'Name must be less than 200 characters').optional(),
  category: z.string().optional(),
  requirePrescription: z.boolean().optional(),
  inStock: z.boolean().optional(),
  minPrice: z
    .number()
    .min(0, 'Minimum price cannot be negative')
    .optional(),
  maxPrice: z
    .number()
    .min(0, 'Maximum price cannot be negative')
    .optional(),
  page: z
    .number()
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be less than 100')
    .default(20),
});

export const GetOrderSchema = z.object({
  orderId: z.string({
    required_error: 'Order ID is required',
    invalid_type_error: 'Order ID must be a string',
  }),
});

export type OrderStatus = (typeof orderStatusEnum)[number];
export type PaymentMethod = (typeof paymentMethodEnum)[number];
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof CancelOrderSchema>;
export type OrderSearchInput = z.infer<typeof OrderSearchSchema>;
export type UpdateStockInput = z.infer<typeof UpdateStockSchema>;
export type SearchMedicineInput = z.infer<typeof SearchMedicineSchema>;
