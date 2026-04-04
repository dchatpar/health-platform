import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Prescription validation schema
export const prescriptionSchema = z.object({
  medications: z
    .array(
      z.object({
        name: z.string().min(1, 'Medication name is required'),
        dosage: z.string().min(1, 'Dosage is required'),
        frequency: z.string().min(1, 'Frequency is required'),
        duration: z.string().min(1, 'Duration is required'),
        instructions: z.string().optional(),
      })
    )
    .min(1, 'At least one medication is required'),
  notes: z.string().optional(),
  followUp: z.string().optional(),
});

export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

// Lab order validation schema
export const labOrderSchema = z.object({
  type: z.enum(['lab', 'radiology', 'both']),
  labTests: z.array(z.string()).optional(),
  radiologyTests: z.array(z.string()).optional(),
  urgency: z.enum(['routine', 'urgent', 'stat']),
  notes: z.string().optional(),
});

export type LabOrderFormData = z.infer<typeof labOrderSchema>;

// Clinical notes validation schema
export const clinicalNotesSchema = z.object({
  chiefComplaint: z.string().min(1, 'Chief complaint is required'),
  historyOfPresentIllness: z.string().optional(),
  physicalExamination: z.string().optional(),
  assessment: z.string().min(1, 'Assessment is required'),
  plan: z.string().min(1, 'Plan is required'),
});

export type ClinicalNotesFormData = z.infer<typeof clinicalNotesSchema>;

// Withdrawal validation schema
export const withdrawalSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => parseFloat(val) >= 50, 'Minimum withdrawal is $50')
    .refine((val) => parseFloat(val) <= 10000, 'Maximum withdrawal is $10,000'),
});

export type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

// Profile update validation schema
export const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Schedule validation schema
export const scheduleSchema = z.object({
  isAvailable: z.boolean(),
  startHour: z.number().min(0).max(23),
  endHour: z.number().min(0).max(23),
});

export const weeklyScheduleSchema = z.array(scheduleSchema).length(7);

export type ScheduleFormData = z.infer<typeof scheduleSchema>;
export type WeeklyScheduleFormData = z.infer<typeof weeklyScheduleSchema>;
