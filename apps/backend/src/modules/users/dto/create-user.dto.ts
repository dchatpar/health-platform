import { z } from 'zod';

export const CreateUserDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
  role: z.enum(['PATIENT', 'DOCTOR', 'PHARMACIST', 'INSURANCE_PROVIDER', 'ADMIN']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  avatar: z.string().url().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
