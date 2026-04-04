import { z } from 'zod';

export const CreateMedicineDtoSchema = z.object({
  name: z.string().min(1),
  genericName: z.string().optional(),
  manufacturer: z.string().optional(),
  category: z.string().min(1),
  description: z.string().optional(),
  requiredPrescription: z.boolean().optional().default(false),
});

export type CreateMedicineDto = z.infer<typeof CreateMedicineDtoSchema>;

export const AddStockDtoSchema = z.object({
  pharmacyId: z.string().uuid(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().datetime().optional(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  mrp: z.number().min(0).optional(),
});

export type AddStockDto = z.infer<typeof AddStockDtoSchema>;

export const UpdateStockDtoSchema = z.object({
  quantity: z.number().optional(),
  price: z.number().min(0).optional(),
  mrp: z.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
});

export type UpdateStockDto = z.infer<typeof UpdateStockDtoSchema>;
