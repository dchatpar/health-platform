import { z } from 'zod';

export const TopUpWalletDtoSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
  paymentMethod: z.string().optional(),
  paymentId: z.string().optional(),
});

export type TopUpWalletDto = z.infer<typeof TopUpWalletDtoSchema>;

export const PaymentDtoSchema = z.object({
  orderId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  amount: z.number().min(0),
  useWalletBalance: z.boolean().optional().default(true),
});

export type PaymentDto = z.infer<typeof PaymentDtoSchema>;

export const WithdrawDtoSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
  bankDetails: z.string().optional(),
});

export type WithdrawDto = z.infer<typeof WithdrawDtoSchema>;
