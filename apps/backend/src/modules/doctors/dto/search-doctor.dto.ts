import { z } from 'zod';

export const SearchDoctorDtoSchema = z.object({
  specialty: z.string().optional(),
  search: z.string().optional(),
  minExperience: z.number().optional(),
  maxExperience: z.number().optional(),
  minRating: z.number().optional(),
  consultationFeeMin: z.number().optional(),
  consultationFeeMax: z.number().optional(),
  availableToday: z.boolean().optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  skip: z.number().optional(),
  take: z.number().optional(),
});

export type SearchDoctorDto = z.infer<typeof SearchDoctorDtoSchema>;
