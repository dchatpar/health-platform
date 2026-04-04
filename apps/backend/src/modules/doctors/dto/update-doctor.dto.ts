import { z } from 'zod';

export const UpdateDoctorDtoSchema = z.object({
  specialty: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  experienceYears: z.number().optional(),
  bio: z.string().optional(),
  consultationFee: z.number().optional(),
});

export type UpdateDoctorDto = z.infer<typeof UpdateDoctorDtoSchema>;

export const CreateDoctorProfileDtoSchema = z.object({
  userId: z.string().uuid(),
  specialty: z.string().min(1),
  qualifications: z.array(z.string()).min(1),
  experienceYears: z.number().min(0),
  bio: z.string().optional(),
  consultationFee: z.number().min(0),
});

export type CreateDoctorProfileDto = z.infer<typeof CreateDoctorProfileDtoSchema>;
