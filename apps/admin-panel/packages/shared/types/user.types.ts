// User Types

export type UserRole = 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'ADMIN';

export interface BaseUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: Address;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Patient extends BaseUser {
  role: 'PATIENT';
  emergencyContact?: EmergencyContact;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  insuranceId?: string;
  walletBalance: number;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Doctor extends BaseUser {
  role: 'DOCTOR';
  specialty: string;
  licenseNumber: string;
  yearsOfExperience: number;
  bio?: string;
  education?: Education[];
  consultationFee: number;
  rating: number;
  reviewCount: number;
  availableSlots: number;
  isAcceptingPatients: boolean;
  languages?: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface Pharmacy extends BaseUser {
  role: 'PHARMACY';
  pharmacyName: string;
  licenseNumber: string;
  is24Hours: boolean;
  deliveryRadius: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
}

export interface Admin extends BaseUser {
  role: 'ADMIN';
  permissions: string[];
  department?: string;
}

export type User = Patient | Doctor | Pharmacy | Admin;

// Discriminator for union types
export type UserDiscriminator = User['role'];

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: Address;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: Address;
}

export interface UpdatePatientInput extends UpdateUserInput {
  emergencyContact?: EmergencyContact;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  insuranceId?: string;
}

export interface UpdateDoctorInput extends UpdateUserInput {
  specialty?: string;
  bio?: string;
  education?: Education[];
  consultationFee?: number;
  isAcceptingPatients?: boolean;
  languages?: string[];
}

export interface UpdatePharmacyInput extends UpdateUserInput {
  pharmacyName?: string;
  is24Hours?: boolean;
  deliveryRadius?: number;
}
