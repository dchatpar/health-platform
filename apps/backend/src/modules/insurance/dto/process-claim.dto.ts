import { z } from 'zod';

export const ProcessClaimDtoSchema = z.object({
  orderId: z.string().uuid(),
  insurancePolicyId: z.string().uuid(),
});

export type ProcessClaimDto = z.infer<typeof ProcessClaimDtoSchema>;

export const ReviewClaimDtoSchema = z.object({
  claimId: z.string().uuid(),
  status: z.enum(['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED']),
  approvedAmount: z.number().min(0).optional(),
  rejectedAmount: z.number().min(0).optional(),
  coPayAmount: z.number().min(0).optional(),
  reviewNotes: z.string().optional(),
});

export type ReviewClaimDto = z.infer<typeof ReviewClaimDtoSchema>;
