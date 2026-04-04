import { z } from 'zod';

export const CreateInsurancePolicyDtoSchema = z.object({
  policyNumber: z.string().min(1),
  providerId: z.string().min(1),
  patientId: z.string().uuid(),
  policyType: z.string().min(1),
  coverageAmount: z.number().min(0),
  deductible: z.number().min(0).optional().default(0),
  copayPercentage: z.number().min(0).max(100).optional().default(20),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  coveredCategories: z.array(z.string()).optional(),
  excludedMedicines: z.array(z.string()).optional(),
});

export type CreateInsurancePolicyDto = z.infer<typeof CreateInsurancePolicyDtoSchema>;

export const UpdateInsurancePolicyDtoSchema = z.object({
  coverageAmount: z.number().min(0).optional(),
  deductible: z.number().min(0).optional(),
  copayPercentage: z.number().min(0).max(100).optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED']).optional(),
});

export type UpdateInsurancePolicyDto = z.infer<typeof UpdateInsurancePolicyDtoSchema>;
