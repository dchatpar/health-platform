import { z } from 'zod';

export const UpdateUserDtoSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  avatar: z.string().url().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>;

export const UpdateUserStatusDtoSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']),
});

export type UpdateUserStatusDto = z.infer<typeof UpdateUserStatusDtoSchema>;
