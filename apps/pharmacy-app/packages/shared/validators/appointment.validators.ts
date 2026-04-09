// Appointment Validators

import { z } from 'zod';

const appointmentStatusEnum = [
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'RESCHEDULED',
] as const;

const appointmentTypeEnum = ['IN_PERSON', 'VIDEO', 'PHONE'] as const;

export const CreateAppointmentSchema = z.object({
  doctorId: z.string({
    required_error: 'Doctor ID is required',
    invalid_type_error: 'Doctor ID must be a string',
  }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format (24-hour)'),
  type: z.enum(appointmentTypeEnum, {
    required_error: 'Appointment type is required',
    invalid_type_error: 'Type must be IN_PERSON, VIDEO, or PHONE',
  }),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
});

export const RescheduleAppointmentSchema = z.object({
  appointmentId: z.string({
    required_error: 'Appointment ID is required',
    invalid_type_error: 'Appointment ID must be a string',
  }),
  newDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  newStartTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format (24-hour)'),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
});

export const CancelAppointmentSchema = z.object({
  appointmentId: z.string({
    required_error: 'Appointment ID is required',
    invalid_type_error: 'Appointment ID must be a string',
  }),
  reason: z
    .string()
    .min(1, 'Cancellation reason is required')
    .max(500, 'Reason must be less than 500 characters'),
});

export const AppointmentSearchSchema = z.object({
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z.enum(appointmentStatusEnum).optional(),
  type: z.enum(appointmentTypeEnum).optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  dateTo: z
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

export const UpdateAppointmentStatusSchema = z.object({
  appointmentId: z.string({
    required_error: 'Appointment ID is required',
    invalid_type_error: 'Appointment ID must be a string',
  }),
  status: z.enum(appointmentStatusEnum, {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a valid enum value',
  }),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const ConfirmAppointmentSchema = z.object({
  appointmentId: z.string({
    required_error: 'Appointment ID is required',
    invalid_type_error: 'Appointment ID must be a string',
  }),
});

export const StartAppointmentSchema = z.object({
  appointmentId: z.string({
    required_error: 'Appointment ID is required',
    invalid_type_error: 'Appointment ID must be a string',
  }),
});

export const CompleteAppointmentSchema = z.object({
  appointmentId: z.string({
    required_error: 'Appointment ID is required',
    invalid_type_error: 'Appointment ID must be a string',
  }),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  prescriptionId: z.string().optional(),
  followUpDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
});

export type AppointmentStatus = (typeof appointmentStatusEnum)[number];
export type AppointmentType = (typeof appointmentTypeEnum)[number];
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<typeof RescheduleAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof CancelAppointmentSchema>;
export type AppointmentSearchInput = z.infer<typeof AppointmentSearchSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof UpdateAppointmentStatusSchema>;
export type ConfirmAppointmentInput = z.infer<typeof ConfirmAppointmentSchema>;
export type StartAppointmentInput = z.infer<typeof StartAppointmentSchema>;
export type CompleteAppointmentInput = z.infer<typeof CompleteAppointmentSchema>;
