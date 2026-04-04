import { z } from 'zod';

const OrderItemSchema = z.object({
  medicineStockId: z.string().uuid(),
  quantity: z.number().min(1),
});

export const CreateOrderDtoSchema = z.object({
  pharmacyId: z.string().uuid(),
  items: z.array(OrderItemSchema).min(1),
  prescriptionId: z.string().uuid().optional(),
  deliveryAddress: z.string().optional(),
  deliveryPhone: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderDtoSchema>;

export const UpdateOrderStatusDtoSchema = z.object({
  status: z.enum(['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusDtoSchema>;
