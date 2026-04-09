// Insurance Types

export type PolicyStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED' | 'PENDING';

export type ClaimStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'DENIED' | 'PENDING_INFO' | 'APPEALED' | 'SETTLED';

export type ClaimType = 'MEDICAL' | 'PRESCRIPTION' | 'DENTAL' | 'VISION' | 'EMERGENCY' | 'HOSPITALIZATION' | 'OUTPATIENT' | 'PREVENTIVE';

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  patientId: string;
  provider: InsuranceProvider;
  planName: string;
  planType: PlanType;
  status: PolicyStatus;
  effectiveDate: string;
  expiryDate: string;
  premium: number;
  premiumFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  deductible: DeductibleInfo;
  copay: CopayInfo;
  outOfPocketMax: number;
  coveredDependents: Dependent[];
  primaryInsuredId?: string;
  relationshipToPrimary: 'SELF' | 'SPOUSE' | 'CHILD' | 'PARENT' | 'OTHER';
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

export type PlanType = 'INDIVIDUAL' | 'FAMILY' | 'GROUP' | 'SENIOR' | 'BASIC' | 'PREMIUM';

export interface DeductibleInfo {
  individual: number;
  family: number;
  metIndividual: number;
  metFamily: number;
  remaining: number;
}

export interface CopayInfo {
  primaryCare: number;
  specialist: number;
  emergency: number;
  prescription: number;
  lab: number;
  imaging: number;
}

export interface Dependent {
  id: string;
  name: string;
  dateOfBirth: string;
  relationship: 'SPOUSE' | 'CHILD' | 'PARENT' | 'OTHER';
  isActive: boolean;
  coverageStartDate: string;
  coverageEndDate?: string;
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  patientId: string;
  type: ClaimType;
  status: ClaimStatus;
  description: string;
  serviceDate: string;
  amount: ClaimAmount;
  diagnosisCodes: string[];
  procedureCodes: string[];
  provider: ClaimProvider;
  documents: ClaimDocument[];
  submittedAt: string;
  reviewedAt?: string;
  resolvedAt?: string;
  denialReason?: string;
  appealReason?: string;
  notes?: string;
  history: ClaimHistoryEntry[];
}

export interface ClaimAmount {
  claimed: number;
  approved: number;
  paid: number;
  patient Responsibility: number;
  deductibleApplied: number;
  copayApplied: number;
  coinsuranceApplied: number;
}

export interface ClaimProvider {
  name: string;
  type: 'DOCTOR' | 'HOSPITAL' | 'CLINIC' | 'PHARMACY' | 'LAB' | 'OTHER';
  address?: string;
  phone?: string;
  taxId?: string;
}

export interface ClaimDocument {
  id: string;
  type: 'RECEIPT' | 'PRESCRIPTION' | 'LAB_REPORT' | 'MEDICAL_REPORT' | 'INVOICE' | 'OTHER';
  name: string;
  url: string;
  uploadedAt: string;
}

export interface ClaimHistoryEntry {
  status: ClaimStatus;
  timestamp: string;
  notes?: string;
  updatedBy?: string;
}

export interface SubmitClaimInput {
  policyId: string;
  type: ClaimType;
  description: string;
  serviceDate: string;
  amount: number;
  diagnosisCodes: string[];
  procedureCodes: string[];
  provider: {
    name: string;
    type: ClaimProvider['type'];
    address?: string;
    phone?: string;
    taxId?: string;
  };
  documents?: File[];
}

export interface UpdateClaimInput {
  claimId: string;
  status?: ClaimStatus;
  notes?: string;
  denialReason?: string;
  appealReason?: string;
}

export interface AppealClaimInput {
  claimId: string;
  reason: string;
  additionalDocuments?: File[];
}

export interface ClaimSearchInput {
  patientId?: string;
  policyId?: string;
  status?: ClaimStatus;
  type?: ClaimType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ClaimListResponse {
  claims: Claim[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CoverageCheckInput {
  policyId: string;
  procedureCode: string;
  diagnosisCode: string;
  providerType: ClaimProvider['type'];
}

export interface CoverageCheckResponse {
  isCovered: boolean;
  coveragePercentage: number;
  patientResponsibility: number;
  requiresPreAuthorization: boolean;
  preAuthorizationNumber?: string;
  notes?: string;
}

export interface PreAuthorization {
  id: string;
  patientId: string;
  policyId: string;
  procedureCode: string;
  procedureDescription: string;
  diagnosisCode: string;
  provider: ClaimProvider;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';
  approvedAmount?: number;
  submittedAt: string;
  reviewedAt?: string;
  expirationDate?: string;
  notes?: string;
}

export interface CreatePreAuthorizationInput {
  policyId: string;
  procedureCode: string;
  procedureDescription: string;
  diagnosisCode: string;
  provider: {
    name: string;
    type: ClaimProvider['type'];
    address?: string;
    phone?: string;
  };
  estimatedCost?: number;
  notes?: string;
}

export interface InsuranceCard {
  id: string;
  policyId: string;
  memberId: string;
  policyNumber: string;
  groupNumber?: string;
  provider: InsuranceProvider;
  holderName: string;
  relationship: 'SELF' | 'SPOUSE' | 'CHILD' | 'PARENT' | 'OTHER';
  effectiveDate: string;
  expiryDate: string;
  imageUrl?: string;
  digitalCardUrl?: string;
}
