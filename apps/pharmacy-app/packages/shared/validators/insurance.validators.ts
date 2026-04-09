// Insurance Validators

import { z } from 'zod';

const claimStatusEnum = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'DENIED', 'PENDING_INFO', 'APPEALED', 'SETTLED'] as const;
const claimTypeEnum = ['MEDICAL', 'PRESCRIPTION', 'DENTAL', 'VISION', 'EMERGENCY', 'HOSPITALIZATION', 'OUTPATIENT', 'PREVENTIVE'] as const;
const policyStatusEnum = ['ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED', 'PENDING'] as const;
const planTypeEnum = ['INDIVIDUAL', 'FAMILY', 'GROUP', 'SENIOR', 'BASIC', 'PREMIUM'] as const;

const claimProviderSchema = z.object({
  name: z
    .string()
    .min(1, 'Provider name is required')
    .max(200, 'Provider name must be less than 200 characters'),
  type: z.enum(['DOCTOR', 'HOSPITAL', 'CLINIC', 'PHARMACY', 'LAB', 'OTHER'], {
    required_error: 'Provider type is required',
    invalid_type_error: 'Provider type must be a valid enum value',
  }),
  address: z.string().max(300, 'Address must be less than 300 characters').optional(),
  phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .optional(),
  taxId: z.string().max(50, 'Tax ID must be less than 50 characters').optional(),
});

const dependentSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
  relationship: z.enum(['SPOUSE', 'CHILD', 'PARENT', 'OTHER'], {
    required_error: 'Relationship is required',
    invalid_type_error: 'Relationship must be a valid enum value',
  }),
  isActive: z.boolean().default(true),
  coverageStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  coverageEndDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
});

const deductibleInfoSchema = z.object({
  individual: z.number().min(0, 'Deductible cannot be negative'),
  family: z.number().min(0, 'Deductible cannot be negative'),
  metIndividual: z.number().min(0, 'Met amount cannot be negative'),
  metFamily: z.number().min(0, 'Met amount cannot be negative'),
  remaining: z.number().min(0, 'Remaining cannot be negative'),
});

const copayInfoSchema = z.object({
  primaryCare: z.number().min(0, 'Copay cannot be negative'),
  specialist: z.number().min(0, 'Copay cannot be negative'),
  emergency: z.number().min(0, 'Copay cannot be negative'),
  prescription: z.number().min(0, 'Copay cannot be negative'),
  lab: z.number().min(0, 'Copay cannot be negative'),
  imaging: z.number().min(0, 'Copay cannot be negative'),
});

export const SubmitClaimSchema = z.object({
  policyId: z.string({
    required_error: 'Policy ID is required',
    invalid_type_error: 'Policy ID must be a string',
  }),
  type: z.enum(claimTypeEnum, {
    required_error: 'Claim type is required',
    invalid_type_error: 'Claim type must be a valid enum value',
  }),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  serviceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  amount: z
    .number()
    .min(0.01, 'Amount must be greater than 0')
    .max(1000000, 'Amount is too high'),
  diagnosisCodes: z
    .array(z.string().max(20, 'Diagnosis code must be less than 20 characters'))
    .min(1, 'At least one diagnosis code is required'),
  procedureCodes: z
    .array(z.string().max(20, 'Procedure code must be less than 20 characters'))
    .optional(),
  provider: claimProviderSchema,
});

export const UpdateClaimSchema = z.object({
  claimId: z.string({
    required_error: 'Claim ID is required',
    invalid_type_error: 'Claim ID must be a string',
  }),
  status: z.enum(claimStatusEnum).optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  denialReason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
  appealReason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
});

export const AppealClaimSchema = z.object({
  claimId: z.string({
    required_error: 'Claim ID is required',
    invalid_type_error: 'Claim ID must be a string',
  }),
  reason: z
    .string()
    .min(1, 'Appeal reason is required')
    .max(1000, 'Reason must be less than 1000 characters'),
});

export const ClaimSearchSchema = z.object({
  patientId: z.string().optional(),
  policyId: z.string().optional(),
  status: z.enum(claimStatusEnum).optional(),
  type: z.enum(claimTypeEnum).optional(),
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

export const CreatePolicySchema = z.object({
  policyNumber: z
    .string()
    .min(1, 'Policy number is required')
    .max(100, 'Policy number must be less than 100 characters'),
  patientId: z.string({
    required_error: 'Patient ID is required',
    invalid_type_error: 'Patient ID must be a string',
  }),
  providerId: z.string({
    required_error: 'Provider ID is required',
    invalid_type_error: 'Provider ID must be a string',
  }),
  planName: z
    .string()
    .min(1, 'Plan name is required')
    .max(100, 'Plan name must be less than 100 characters'),
  planType: z.enum(planTypeEnum, {
    required_error: 'Plan type is required',
    invalid_type_error: 'Plan type must be a valid enum value',
  }),
  effectiveDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  premium: z
    .number()
    .min(0, 'Premium cannot be negative'),
  premiumFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY'], {
    required_error: 'Premium frequency is required',
    invalid_type_error: 'Premium frequency must be a valid enum value',
  }),
  deductible: deductibleInfoSchema,
  copay: copayInfoSchema,
  outOfPocketMax: z
    .number()
    .min(0, 'Out of pocket max cannot be negative'),
  coveredDependents: z.array(dependentSchema).optional(),
  primaryInsuredId: z.string().optional(),
  relationshipToPrimary: z.enum(['SELF', 'SPOUSE', 'CHILD', 'PARENT', 'OTHER']).optional(),
});

export const CoverageCheckSchema = z.object({
  policyId: z.string({
    required_error: 'Policy ID is required',
    invalid_type_error: 'Policy ID must be a string',
  }),
  procedureCode: z
    .string()
    .min(1, 'Procedure code is required')
    .max(20, 'Procedure code must be less than 20 characters'),
  diagnosisCode: z
    .string()
    .min(1, 'Diagnosis code is required')
    .max(20, 'Diagnosis code must be less than 20 characters'),
  providerType: z.enum(['DOCTOR', 'HOSPITAL', 'CLINIC', 'PHARMACY', 'LAB', 'OTHER'], {
    required_error: 'Provider type is required',
    invalid_type_error: 'Provider type must be a valid enum value',
  }),
});

export const CreatePreAuthorizationSchema = z.object({
  policyId: z.string({
    required_error: 'Policy ID is required',
    invalid_type_error: 'Policy ID must be a string',
  }),
  procedureCode: z
    .string()
    .min(1, 'Procedure code is required')
    .max(20, 'Procedure code must be less than 20 characters'),
  procedureDescription: z
    .string()
    .min(1, 'Procedure description is required')
    .max(200, 'Procedure description must be less than 200 characters'),
  diagnosisCode: z
    .string()
    .min(1, 'Diagnosis code is required')
    .max(20, 'Diagnosis code must be less than 20 characters'),
  provider: claimProviderSchema,
  estimatedCost: z
    .number()
    .min(0, 'Estimated cost cannot be negative')
    .optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export type ClaimStatus = (typeof claimStatusEnum)[number];
export type ClaimType = (typeof claimTypeEnum)[number];
export type PolicyStatus = (typeof policyStatusEnum)[number];
export type PlanType = (typeof planTypeEnum)[number];
export type SubmitClaimInput = z.infer<typeof SubmitClaimSchema>;
export type UpdateClaimInput = z.infer<typeof UpdateClaimSchema>;
export type AppealClaimInput = z.infer<typeof AppealClaimSchema>;
export type ClaimSearchInput = z.infer<typeof ClaimSearchSchema>;
export type CreatePolicyInput = z.infer<typeof CreatePolicySchema>;
export type CoverageCheckInput = z.infer<typeof CoverageCheckSchema>;
export type CreatePreAuthorizationInput = z.infer<typeof CreatePreAuthorizationSchema>;
