// Prescription Validators

import { z } from 'zod';

const prescriptionStatusEnum = ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'] as const;

const routeEnum = [
  'ORAL',
  'TOPICAL',
  'INJECTION',
  'INHALATION',
  'SUPPOSITORY',
  'OPHTHALMIC',
  'OTIC',
  'NASAL',
  'TRANSDERMAL',
] as const;

const medicationSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, 'Medication name is required')
    .max(200, 'Medication name must be less than 200 characters'),
  genericName: z
    .string()
    .max(200, 'Generic name must be less than 200 characters')
    .optional(),
  dosage: z
    .string()
    .min(1, 'Dosage is required')
    .max(100, 'Dosage must be less than 100 characters'),
  frequency: z
    .string()
    .min(1, 'Frequency is required')
    .max(100, 'Frequency must be less than 100 characters'),
  duration: z
    .string()
    .min(1, 'Duration is required')
    .max(100, 'Duration must be less than 100 characters'),
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Quantity is too high'),
  route: z.enum(routeEnum, {
    required_error: 'Route is required',
    invalid_type_error: 'Route must be a valid enum value',
  }),
  instructions: z.string().max(500, 'Instructions must be less than 500 characters').optional(),
  warnings: z.array(z.string().max(200, 'Warning must be less than 200 characters')).optional(),
  refills: z
    .number()
    .min(0, 'Refills cannot be negative')
    .max(100, 'Refills is too high'),
  brandOnly: z.boolean().optional(),
  takings: z
    .array(
      z.object({
        id: z.string().optional(),
        medicationId: z.string().optional(),
        scheduledTime: z.string(),
        takenAt: z.string().optional(),
        status: z.enum(['PENDING', 'TAKEN', 'SKIPPED', 'MISSED']),
        notes: z.string().optional(),
      })
    )
    .optional(),
});

export const CreatePrescriptionSchema = z.object({
  patientId: z.string({
    required_error: 'Patient ID is required',
    invalid_type_error: 'Patient ID must be a string',
  }),
  doctorId: z.string({
    required_error: 'Doctor ID is required',
    invalid_type_error: 'Doctor ID must be a string',
  }),
  appointmentId: z.string().optional(),
  consultationId: z.string().optional(),
  medications: z
    .array(medicationSchema)
    .min(1, 'At least one medication is required'),
  diagnosis: z.string().max(500, 'Diagnosis must be less than 500 characters').optional(),
  instructions: z.string().max(1000, 'Instructions must be less than 1000 characters').optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  refillsRemaining: z
    .number()
    .min(0, 'Refills cannot be negative')
    .max(100, 'Refills is too high')
    .optional(),
  pharmacyId: z.string().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const UpdatePrescriptionSchema = z.object({
  status: z.enum(prescriptionStatusEnum).optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  refillsRemaining: z
    .number()
    .min(0, 'Refills cannot be negative')
    .max(100, 'Refills is too high')
    .optional(),
  pharmacyId: z.string().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const CreateMedicationInputSchema = medicationSchema.extend({
  name: z
    .string()
    .min(1, 'Medication name is required')
    .max(200, 'Medication name must be less than 200 characters'),
  dosage: z
    .string()
    .min(1, 'Dosage is required')
    .max(100, 'Dosage must be less than 100 characters'),
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Quantity is too high'),
  route: z.enum(routeEnum, {
    required_error: 'Route is required',
    invalid_type_error: 'Route must be a valid enum value',
  }),
  refills: z
    .number()
    .min(0, 'Refills cannot be negative')
    .max(100, 'Refills is too high'),
});

export const CreateRefillRequestSchema = z.object({
  prescriptionId: z.string({
    required_error: 'Prescription ID is required',
    invalid_type_error: 'Prescription ID must be a string',
  }),
  medicationId: z.string({
    required_error: 'Medication ID is required',
    invalid_type_error: 'Medication ID must be a string',
  }),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const GetPrescriptionSchema = z.object({
  prescriptionId: z.string({
    required_error: 'Prescription ID is required',
    invalid_type_error: 'Prescription ID must be a string',
  }),
});

export const ListPrescriptionsSchema = z.object({
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z.enum(prescriptionStatusEnum).optional(),
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

export type PrescriptionStatus = (typeof prescriptionStatusEnum)[number];
export type Route = (typeof routeEnum)[number];
export type CreatePrescriptionInput = z.infer<typeof CreatePrescriptionSchema>;
export type UpdatePrescriptionInput = z.infer<typeof UpdatePrescriptionSchema>;
export type CreateMedicationInput = z.infer<typeof CreateMedicationInputSchema>;
export type CreateRefillRequestInput = z.infer<typeof CreateRefillRequestSchema>;
