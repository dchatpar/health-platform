// User Role Constants

export const UserRole = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  PHARMACY: 'PHARMACY',
  ADMIN: 'ADMIN',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleDisplayName: Record<UserRoleType, string> = {
  PATIENT: 'Patient',
  DOCTOR: 'Doctor',
  PHARMACY: 'Pharmacy',
  ADMIN: 'Administrator',
};

export const UserRolePermissions: Record<UserRoleType, string[]> = {
  PATIENT: [
    'appointment:create',
    'appointment:read:own',
    'appointment:cancel:own',
    'prescription:read:own',
    'prescription:refill:request',
    'order:create',
    'order:read:own',
    'order:cancel:own',
    'wallet:read:own',
    'wallet:topup',
    'wallet:withdraw',
    'insurance:read:own',
    'insurance:claim:submit',
    'profile:read:own',
    'profile:update:own',
    'notification:read:own',
    'notification:update:own',
  ],
  DOCTOR: [
    'appointment:read:all',
    'appointment:update:all',
    'appointment:cancel:all',
    'consultation:create',
    'consultation:read:all',
    'consultation:update:all',
    'prescription:create',
    'prescription:read:all',
    'prescription:update:all',
    'patient:read:all',
    'patient:history:read',
    'schedule:read:own',
    'schedule:update:own',
    'wallet:read:own',
    'profile:read:own',
    'profile:update:own',
    'notification:read:own',
    'notification:update:own',
    'review:read:own',
  ],
  PHARMACY: [
    'order:read:all',
    'order:update:all',
    'order:cancel:all',
    'inventory:read:all',
    'inventory:update:all',
    'prescription:verify',
    'delivery:update',
    'wallet:read:own',
    'profile:read:own',
    'profile:update:own',
    'notification:read:own',
    'notification:update:own',
  ],
  ADMIN: [
    'user:create',
    'user:read:all',
    'user:update:all',
    'user:delete:all',
    'appointment:read:all',
    'appointment:update:all',
    'appointment:delete:all',
    'prescription:read:all',
    'prescription:update:all',
    'prescription:delete:all',
    'order:read:all',
    'order:update:all',
    'order:delete:all',
    'insurance:read:all',
    'insurance:update:all',
    'insurance:delete:all',
    'pharmacy:verify',
    'doctor:verify',
    'wallet:read:all',
    'wallet:update:all',
    'notification:send:all',
    'notification:read:all',
    'settings:read',
    'settings:update',
    'report:read:all',
    'audit:read:all',
  ],
};

export const PATIENT_DEFAULT_PERMISSIONS = UserRolePermissions.PATIENT;
export const DOCTOR_DEFAULT_PERMISSIONS = UserRolePermissions.DOCTOR;
export const PHARMACY_DEFAULT_PERMISSIONS = UserRolePermissions.PHARMACY;
export const ADMIN_DEFAULT_PERMISSIONS = UserRolePermissions.ADMIN;
