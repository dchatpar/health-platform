import { z } from 'zod';

export const CreatePharmacyDtoSchema = z.object({
  name: z.string().min(1),
  licenseNumber: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
});

export type CreatePharmacyDto = z.infer<typeof CreatePharmacyDtoSchema>;

export const UpdatePharmacyDtoSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

export type UpdatePharmacyDto = z.infer<typeof UpdatePharmacyDtoSchema>;
