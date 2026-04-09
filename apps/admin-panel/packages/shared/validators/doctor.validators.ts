// Doctor Validators

import { z } from 'zod';

const specialtyEnum = [
  'GENERAL_PRACTICE',
  'INTERNAL_MEDICINE',
  'PEDIATRICS',
  'SURGERY',
  'CARDIOLOGY',
  'DERMATOLOGY',
  'NEUROLOGY',
  'ORTHOPEDICS',
  'GYNECOLOGY',
  'PSYCHIATRY',
  'ONCOLOGY',
  'OPHTHALMOLOGY',
  'ENT',
  'UROLOGY',
  'GASTROENTEROLOGY',
  'ENDOCRINOLOGY',
  'RHEUMATOLOGY',
  'PULMONOLOGY',
  'NEPHROLOGY',
  'INFECTIOUS_DISEASE',
  'ALLERGY_IMMUNOLOGY',
  'SPORTS_MEDICINE',
  'EMERGENCY_MEDICINE',
  'ANESTHESIOLOGY',
  'RADIOLOGY',
  'PATHOLOGY',
  'FAMILY_MEDICINE',
] as const;

const dayOfWeekEnum = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

const educationSchema = z.object({
  id: z.string().optional(),
  degree: z
    .string()
    .min(1, 'Degree is required')
    .max(100, 'Degree must be less than 100 characters'),
  institution: z
    .string()
    .min(1, 'Institution is required')
    .max(200, 'Institution must be less than 200 characters'),
  fieldOfStudy: z
    .string()
    .max(100, 'Field of study must be less than 100 characters')
    .optional(),
  startYear: z
    .number()
    .min(1950, 'Start year must be after 1950')
    .max(new Date().getFullYear(), 'Start year cannot be in the future'),
  endYear: z
    .number()
    .min(1950, 'End year must be after 1950')
    .max(new Date().getFullYear() + 10, 'End year is too far in the future')
    .optional(),
  isVerified: z.boolean().optional(),
});

export const SearchDoctorSchema = z.object({
  specialty: z.enum(specialtyEnum).optional(),
  name: z.string().max(100, 'Name must be less than 100 characters').optional(),
  minRating: z
    .number()
    .min(0, 'Rating must be between 0 and 5')
    .max(5, 'Rating must be between 0 and 5')
    .optional(),
  maxFee: z
    .number()
    .min(0, 'Maximum fee cannot be negative')
    .optional(),
  minExperience: z
    .number()
    .min(0, 'Minimum experience cannot be negative')
    .optional(),
  isAcceptingPatients: z.boolean().optional(),
  language: z.string().max(50, 'Language must be less than 50 characters').optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  page: z
    .number()
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be less than 100')
    .default(20),
});

export const UpdateDoctorProfileSchema = z.object({
  specialty: z.enum(specialtyEnum).optional(),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  education: z.array(educationSchema).optional(),
  consultationFee: z
    .number()
    .min(0, 'Consultation fee cannot be negative')
    .max(10000, 'Consultation fee is too high')
    .optional(),
  isAcceptingPatients: z.boolean().optional(),
  languages: z.array(z.string().max(50, 'Language must be less than 50 characters')).optional(),
});

export const CreateDoctorScheduleSchema = z.object({
  doctorId: z.string({
    required_error: 'Doctor ID is required',
    invalid_type_error: 'Doctor ID must be a string',
  }),
  dayOfWeek: z.enum(dayOfWeekEnum, {
    required_error: 'Day of week is required',
    invalid_type_error: 'Day of week must be a valid enum value',
  }),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format (24-hour)'),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format (24-hour)'),
  slotDuration: z
    .number()
    .min(5, 'Slot duration must be at least 5 minutes')
    .max(120, 'Slot duration cannot exceed 120 minutes'),
  isAvailable: z.boolean().default(true),
});

export const BulkAvailabilityUpdateSchema = z.object({
  doctorId: z.string({
    required_error: 'Doctor ID is required',
    invalid_type_error: 'Doctor ID must be a string',
  }),
  schedules: z
    .array(
      z.object({
        dayOfWeek: z.enum(dayOfWeekEnum, {
          required_error: 'Day of week is required',
          invalid_type_error: 'Day of week must be a valid enum value',
        }),
        isAvailable: z.boolean(),
        startTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format (24-hour)')
          .optional(),
        endTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format (24-hour)')
          .optional(),
        slotDuration: z
          .number()
          .min(5, 'Slot duration must be at least 5 minutes')
          .max(120, 'Slot duration cannot exceed 120 minutes')
          .optional(),
      })
    )
    .min(1, 'At least one schedule is required'),
});

export const CreateReviewSchema = z.object({
  doctorId: z.string({
    required_error: 'Doctor ID is required',
    invalid_type_error: 'Doctor ID must be a string',
  }),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
});

export const GetAvailableSlotsSchema = z.object({
  doctorId: z.string({
    required_error: 'Doctor ID is required',
    invalid_type_error: 'Doctor ID must be a string',
  }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
});

export type Specialty = (typeof specialtyEnum)[number];
export type DayOfWeek = (typeof dayOfWeekEnum)[number];
export type SearchDoctorInput = z.infer<typeof SearchDoctorSchema>;
export type UpdateDoctorProfileInput = z.infer<typeof UpdateDoctorProfileSchema>;
export type CreateDoctorScheduleInput = z.infer<typeof CreateDoctorScheduleSchema>;
export type BulkAvailabilityUpdateInput = z.infer<typeof BulkAvailabilityUpdateSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type GetAvailableSlotsInput = z.infer<typeof GetAvailableSlotsSchema>;
