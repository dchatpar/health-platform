import { z } from 'zod';

export const CreateAppointmentDtoSchema = z.object({
  doctorId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(120).optional().default(30),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateAppointmentDto = z.infer<typeof CreateAppointmentDtoSchema>;
