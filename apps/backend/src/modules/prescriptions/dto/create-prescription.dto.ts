import { z } from 'zod';

const MedicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  quantity: z.number().min(1),
  instructions: z.string().optional(),
});

export const CreatePrescriptionDtoSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  medications: z.array(MedicationSchema).min(1),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  validUntil: z.string().datetime().optional(),
});

export type CreatePrescriptionDto = z.infer<typeof CreatePrescriptionDtoSchema>;
