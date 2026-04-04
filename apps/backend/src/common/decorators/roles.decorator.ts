import { SetMetadata } from '@nestjs/common';

export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  PHARMACIST = 'PHARMACIST',
  INSURANCE_PROVIDER = 'INSURANCE_PROVIDER',
  ADMIN = 'ADMIN',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
