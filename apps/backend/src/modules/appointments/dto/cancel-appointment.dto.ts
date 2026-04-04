import { z } from 'zod';

export const CancelAppointmentDtoSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
});

export type CancelAppointmentDto = z.infer<typeof CancelAppointmentDtoSchema>;
