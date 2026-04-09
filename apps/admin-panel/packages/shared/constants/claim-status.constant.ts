// Claim Status Constants

export const ClaimStatus = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  DENIED: 'DENIED',
  PENDING_INFO: 'PENDING_INFO',
  APPEALED: 'APPEALED',
  SETTLED: 'SETTLED',
} as const;

export type ClaimStatusType = (typeof ClaimStatus)[keyof typeof ClaimStatus];

export const ClaimStatusDisplayName: Record<ClaimStatusType, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  DENIED: 'Denied',
  PENDING_INFO: 'Pending Information',
  APPEALED: 'Appealed',
  SETTLED: 'Settled',
};

export const ClaimStatusDescription: Record<ClaimStatusType, string> = {
  SUBMITTED: 'Claim has been submitted and is awaiting review',
  UNDER_REVIEW: 'Claim is currently being reviewed by the insurance provider',
  APPROVED: 'Claim has been approved for payment',
  DENIED: 'Claim has been denied',
  PENDING_INFO: 'Additional information is required to process this claim',
  APPEALED: 'Claim denial has been appealed',
  SETTLED: 'Claim has been settled and payment has been processed',
};

export const ClaimStatusColor: Record<ClaimStatusType, string> = {
  SUBMITTED: '#FFA500',
  UNDER_REVIEW: '#00BFFF',
  APPROVED: '#32CD32',
  DENIED: '#DC143C',
  PENDING_INFO: '#9370DB',
  APPEALED: '#4169E1',
  SETTLED: '#008000',
};

export const ClaimStatusOrder: ClaimStatusType[] = [
  ClaimStatus.SUBMITTED,
  ClaimStatus.UNDER_REVIEW,
  ClaimStatus.APPROVED,
  ClaimStatus.DENIED,
  ClaimStatus.PENDING_INFO,
  ClaimStatus.APPEALED,
  ClaimStatus.SETTLED,
];

export const PAYABLE_STATUSES: ClaimStatusType[] = [
  ClaimStatus.APPROVED,
  ClaimStatus.SETTLED,
];

export const DENIED_STATUSES: ClaimStatusType[] = [
  ClaimStatus.DENIED,
];

export const APPEALABLE_STATUSES: ClaimStatusType[] = [
  ClaimStatus.DENIED,
];

export const REVISABLE_STATUSES: ClaimStatusType[] = [
  ClaimStatus.SUBMITTED,
  ClaimStatus.UNDER_REVIEW,
  ClaimStatus.PENDING_INFO,
];

export const CLAIM_STATUS_TRANSITIONS: Record<ClaimStatusType, ClaimStatusType[]> = {
  [ClaimStatus.SUBMITTED]: [
    ClaimStatus.UNDER_REVIEW,
    ClaimStatus.APPROVED,
    ClaimStatus.DENIED,
    ClaimStatus.PENDING_INFO,
  ],
  [ClaimStatus.UNDER_REVIEW]: [
    ClaimStatus.APPROVED,
    ClaimStatus.DENIED,
    ClaimStatus.PENDING_INFO,
  ],
  [ClaimStatus.APPROVED]: [
    ClaimStatus.SETTLED,
  ],
  [ClaimStatus.DENIED]: [
    ClaimStatus.APPEALED,
  ],
  [ClaimStatus.PENDING_INFO]: [
    ClaimStatus.UNDER_REVIEW,
    ClaimStatus.APPROVED,
    ClaimStatus.DENIED,
  ],
  [ClaimStatus.APPEALED]: [
    ClaimStatus.UNDER_REVIEW,
    ClaimStatus.APPROVED,
    ClaimStatus.DENIED,
  ],
  [ClaimStatus.SETTLED]: [],
};

export const CLAIM_TYPE_DISPLAY_NAMES: Record<string, string> = {
  MEDICAL: 'Medical',
  PRESCRIPTION: 'Prescription',
  DENTAL: 'Dental',
  VISION: 'Vision',
  EMERGENCY: 'Emergency',
  HOSPITALIZATION: 'Hospitalization',
  OUTPATIENT: 'Outpatient',
  PREVENTIVE: 'Preventive Care',
};
