// Appointment Types

import type { DayOfWeek } from './doctor.types';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export type AppointmentType = 'IN_PERSON' | 'VIDEO' | 'PHONE';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: AppointmentType;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  prescriptionId?: string;
  followUpDate?: string;
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  videoLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  doctorId: string;
  date: string;
  startTime: string;
  type: AppointmentType;
  reason?: string;
}

export interface RescheduleAppointmentInput {
  appointmentId: string;
  newDate: string;
  newStartTime: string;
  reason?: string;
}

export interface CancelAppointmentInput {
  appointmentId: string;
  reason: string;
}

export interface AppointmentSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
}

export interface AvailableSlotsResponse {
  doctorId: string;
  doctorName: string;
  date: string;
  slots: AppointmentSlot[];
}

export interface AppointmentSearchInput {
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
  thisWeek: number;
  thisMonth: number;
}

export interface BookedSlot {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentId?: string;
}

export interface DoctorScheduleTemplate {
  doctorId: string;
  dayOfWeek: DayOfWeek;
  isAvailable: boolean;
  slots: {
    startTime: string;
    endTime: string;
    slotDuration: number;
  }[];
}

export interface BulkAvailabilityUpdate {
  doctorId: string;
  schedules: {
    dayOfWeek: DayOfWeek;
    isAvailable: boolean;
    startTime?: string;
    endTime?: string;
    slotDuration?: number;
  }[];
}

export interface AppointmentReminder {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  scheduledFor: string;
  sentAt?: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
}
