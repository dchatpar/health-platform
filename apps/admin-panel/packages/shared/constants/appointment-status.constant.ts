// Appointment Status Constants

export const AppointmentStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  RESCHEDULED: 'RESCHEDULED',
} as const;

export type AppointmentStatusType = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const AppointmentStatusDisplayName: Record<AppointmentStatusType, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
  RESCHEDULED: 'Rescheduled',
};

export const AppointmentStatusDescription: Record<AppointmentStatusType, string> = {
  PENDING: 'Appointment is awaiting confirmation from the doctor',
  CONFIRMED: 'Appointment has been confirmed by the doctor',
  IN_PROGRESS: 'Appointment is currently in progress',
  COMPLETED: 'Appointment has been completed successfully',
  CANCELLED: 'Appointment has been cancelled',
  NO_SHOW: 'Patient did not attend the appointment',
  RESCHEDULED: 'Appointment has been rescheduled to a different time',
};

export const AppointmentStatusColor: Record<AppointmentStatusType, string> = {
  PENDING: '#FFA500',
  CONFIRMED: '#00BFFF',
  IN_PROGRESS: '#9370DB',
  COMPLETED: '#32CD32',
  CANCELLED: '#DC143C',
  NO_SHOW: '#808080',
  RESCHEDULED: '#4169E1',
};

export const AppointmentStatusOrder: AppointmentStatusType[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.IN_PROGRESS,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
  AppointmentStatus.NO_SHOW,
  AppointmentStatus.RESCHEDULED,
];

export const CANCELLABLE_STATUSES: AppointmentStatusType[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
];

export const RESCHEDULABLE_STATUSES: AppointmentStatusType[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
];

export const COMPLETABLE_STATUSES: AppointmentStatusType[] = [
  AppointmentStatus.IN_PROGRESS,
];

export const APPOINTMENT_STATUS_TRANSITIONS: Record<AppointmentStatusType, AppointmentStatusType[]> = {
  [AppointmentStatus.PENDING]: [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.CONFIRMED]: [
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
    AppointmentStatus.RESCHEDULED,
  ],
  [AppointmentStatus.IN_PROGRESS]: [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
  [AppointmentStatus.NO_SHOW]: [],
  [AppointmentStatus.RESCHEDULED]: [],
};
