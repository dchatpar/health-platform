// User Validators

import { z } from 'zod';

const addressSchema = z.object({
  street: z
    .string()
    .max(200, 'Street must be less than 200 characters')
    .optional(),
  city: z
    .string()
    .max(100, 'City must be less than 100 characters')
    .optional(),
  state: z
    .string()
    .max(100, 'State must be less than 100 characters')
    .optional(),
  postalCode: z
    .string()
    .max(20, 'Postal code must be less than 20 characters')
    .optional(),
  country: z
    .string()
    .max(100, 'Country must be less than 100 characters')
    .optional(),
});

const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(1, 'Emergency contact name is required')
    .max(100, 'Name must be less than 100 characters'),
  relationship: z
    .string()
    .min(1, 'Relationship is required')
    .max(50, 'Relationship must be less than 50 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 digits')
    .regex(/^[+]?[0-9]+$/, 'Invalid phone number format'),
});

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

export const CreateUserSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email address'),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  firstName: z
    .string({
      required_error: 'First name is required',
      invalid_type_error: 'First name must be a string',
    })
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string({
      required_error: 'Last name is required',
      invalid_type_error: 'Last name must be a string',
    })
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  phone: z
    .string({
      required_error: 'Phone number is required',
      invalid_type_error: 'Phone number must be a string',
    })
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 digits')
    .regex(/^[+]?[0-9]+$/, 'Invalid phone number format'),
  role: z.enum(['PATIENT', 'DOCTOR', 'PHARMACY', 'ADMIN'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be a valid enum value',
  }),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
    .optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: addressSchema.optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name cannot be empty')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 digits')
    .regex(/^[+]?[0-9]+$/, 'Invalid phone number format')
    .optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
    .optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: addressSchema.optional(),
});

export const UpdatePatientSchema = UpdateUserSchema.extend({
  emergencyContact: emergencyContactSchema.optional(),
  bloodType: z
    .string()
    .max(10, 'Blood type must be less than 10 characters')
    .optional(),
  allergies: z.array(z.string().max(200, 'Allergy must be less than 200 characters')).optional(),
  chronicConditions: z
    .array(z.string().max(200, 'Condition must be less than 200 characters'))
    .optional(),
  insuranceId: z.string().optional(),
});

export const UpdateDoctorSchema = UpdateUserSchema.extend({
  specialty: z.string().max(100, 'Specialty must be less than 100 characters').optional(),
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

export const UpdatePharmacySchema = UpdateUserSchema.extend({
  pharmacyName: z
    .string()
    .min(1, 'Pharmacy name is required')
    .max(200, 'Pharmacy name must be less than 200 characters')
    .optional(),
  is24Hours: z.boolean().optional(),
  deliveryRadius: z
    .number()
    .min(0, 'Delivery radius cannot be negative')
    .max(1000, 'Delivery radius is too large')
    .optional(),
});

export const CreatePatientProfileSchema = z.object({
  userId: z.string({
    required_error: 'User ID is required',
    invalid_type_error: 'User ID must be a string',
  }),
  emergencyContact: emergencyContactSchema.optional(),
  bloodType: z
    .string()
    .max(10, 'Blood type must be less than 10 characters')
    .optional(),
  allergies: z.array(z.string().max(200, 'Allergy must be less than 200 characters')).optional(),
  chronicConditions: z
    .array(z.string().max(200, 'Condition must be less than 200 characters'))
    .optional(),
  insuranceId: z.string().optional(),
  walletBalance: z
    .number()
    .min(0, 'Wallet balance cannot be negative')
    .default(0),
});

export const CreateDoctorProfileSchema = z.object({
  userId: z.string({
    required_error: 'User ID is required',
    invalid_type_error: 'User ID must be a string',
  }),
  specialty: z
    .string()
    .min(1, 'Specialty is required')
    .max(100, 'Specialty must be less than 100 characters'),
  licenseNumber: z
    .string()
    .min(1, 'License number is required')
    .max(100, 'License number must be less than 100 characters'),
  yearsOfExperience: z
    .number()
    .min(0, 'Years of experience cannot be negative')
    .max(70, 'Years of experience is too high'),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  education: z.array(educationSchema).optional(),
  consultationFee: z
    .number()
    .min(0, 'Consultation fee cannot be negative')
    .max(10000, 'Consultation fee is too high'),
  languages: z.array(z.string().max(50, 'Language must be less than 50 characters')).optional(),
  isAcceptingPatients: z.boolean().default(true),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;
export type UpdateDoctorInput = z.infer<typeof UpdateDoctorSchema>;
export type UpdatePharmacyInput = z.infer<typeof UpdatePharmacySchema>;
