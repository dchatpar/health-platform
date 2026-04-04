// User Types
export type UserType = 'patient' | 'doctor' | 'pharmacy' | 'admin';

export interface User {
  id: string;
  type: UserType;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Patient extends User {
  type: 'patient';
  dateOfBirth: string;
  gender: 'male' | 'female';
  address?: Address;
  insuranceProviderId?: string;
  insurancePolicyNumber?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Doctor extends User {
  type: 'doctor';
  specialty: string;
  licenseNumber: string;
  yearsOfExperience: number;
  education: string;
  hospital?: string;
  consultationFee: number;
  isAvailableForConsultation: boolean;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  rating: number;
  totalRatings: number;
}

export interface Pharmacy extends User {
  type: 'pharmacy';
  licenseNumber: string;
  address: Address;
  operatingHours: OperatingHours;
  is24Hours: boolean;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  services: string[];
  rating: number;
}

export interface Admin extends User {
  type: 'admin';
  role: 'super_admin' | 'support' | 'finance' | 'security';
  permissions: string[];
}

// Address
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  instructions?: string;
}

export interface OperatingHours {
  [day: string]: { open: string; close: string; closed?: boolean };
}

// Catalog Types
export interface MasterMedicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  subCategory?: string;
  dosage: string;
  form: string;
  strength: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsurancePlan {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
  code: string;
  coverageTypes: CoverageType[];
  isActive: boolean;
  createdAt: string;
}

export interface CoverageType {
  id: string;
  name: string;
  coveragePercentage: number;
  maxPerPrescription: number;
  maxPerMonth: number;
  deductible: number;
  requiresPreAuthorization: boolean;
  applicableCategories: string[];
}

export interface Specialty {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CommissionRule {
  id: string;
  specialtyId: string;
  specialtyName: string;
  commissionPercentage: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

// Financial Types
export interface DoctorPayout {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  period: string;
  prescriptionsCount: number;
  totalAmount: number;
  commissionAmount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paidAt?: string;
  bankReference?: string;
}

export interface PharmacyPayout {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  period: string;
  ordersCount: number;
  totalSales: number;
  platformCommission: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paidAt?: string;
  bankReference?: string;
}

export interface Settlement {
  id: string;
  type: 'doctor' | 'pharmacy';
  entityId: string;
  entityName: string;
  period: string;
  grossAmount: number;
  deductions: Deduction[];
  netAmount: number;
  status: 'pending' | 'completed';
  completedAt?: string;
}

export interface Deduction {
  type: string;
  description: string;
  amount: number;
}

// Support Types
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userType: UserType;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedToName?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export type TicketCategory =
  | 'technical'
  | 'billing'
  | 'account'
  | 'order_issue'
  | 'refund'
  | 'complaint'
  | 'suggestion'
  | 'other';

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'support';
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface RefundRequest {
  id: string;
  requestNumber: string;
  orderId: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  pharmacyId: string;
  pharmacyName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

// Security Types
export interface FraudAlert {
  id: string;
  alertType: 'suspicious_order' | 'unusual_activity' | 'fake_prescription' | 'account_sharing' | 'refund_abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  userName: string;
  userType: UserType;
  description: string;
  status: 'new' | 'reviewing' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userType: UserType;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

// Dashboard Types
export interface PlatformStats {
  totalUsers: number;
  totalDoctors: number;
  totalPharmacies: number;
  totalPatients: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyGrowth: number;
  pendingApprovals: {
    doctors: number;
    pharmacies: number;
  };
  activeAlerts: number;
  openTickets: number;
}
