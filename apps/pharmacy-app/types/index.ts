// Medicine Types
export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  subCategory?: string;
  dosage: string;
  form: MedicineForm;
  strength: string;
  price: number;
  stock: number;
  minStock: number;
  maxStock: number;
  expiryDate: string;
  prescriptionRequired: boolean;
  insuranceCoverage: number;
  requiresColdStorage: boolean;
  barcode?: string;
  manufacturerCode?: string;
  imageUrl?: string;
  description?: string;
  sideEffects?: string;
  contraindications?: string;
  createdAt: string;
  updatedAt: string;
}

export type MedicineForm =
  | 'tablet'
  | 'capsule'
  | 'syrup'
  | 'injection'
  | 'cream'
  | 'ointment'
  | 'drops'
  | 'inhaler'
  | 'patch'
  | 'suppository'
  | 'powder'
  | 'solution'
  | 'suspension'
  | 'gel'
  | 'spray'
  | 'other';

export interface StockTransaction {
  id: string;
  medicineId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string;
  performedBy: string;
  performedAt: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId?: string;
  doctorName?: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  discount: number;
  insuranceCoverage: number;
  coPay: number;
  total: number;
  deliveryFee: number;
  deliveryAddress?: Address;
  deliveryPartner?: string;
  deliveryPartnerPhone?: string;
  deliveryEstimatedTime?: string;
  deliveryCompletedAt?: string;
  notes?: string;
  priority: 'normal' | 'urgent';
  source: 'app' | 'phone' | 'walkin';
  prescriptionUrl?: string;
  insuranceClaimId?: string;
  claimStatus?: ClaimStatus;
  assignedTo?: string;
  preparedBy?: string;
  receivedAt: string;
  preparedAt?: string;
  assignedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  instructions?: string;
}

export type OrderStatus =
  | 'pending'
  | 'received'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type ClaimStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'appealed';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  instructions?: string;
}

// Claims Types
export interface Claim {
  id: string;
  claimNumber: string;
  orderId: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  insuranceProviderId: string;
  insuranceProviderName: string;
  policyNumber: string;
  groupNumber?: string;
  items: ClaimItem[];
  totalAmount: number;
  coveredAmount: number;
  coPay: number;
  deductible: number;
  status: ClaimStatus;
  submittedAt?: string;
  processedAt?: string;
  rejectionReason?: string;
  appealReason?: string;
  documents: ClaimDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ClaimItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  covered: boolean;
  coveragePercentage: number;
  coveredAmount: number;
  coPayAmount: number;
}

export interface ClaimDocument {
  id: string;
  type: 'prescription' | 'lab_report' | 'invoice' | 'other';
  name: string;
  url: string;
  uploadedAt: string;
}

// Insurance Types
export interface InsuranceProvider {
  id: string;
  name: string;
  code: string;
  logo?: string;
  coverageTypes: CoverageType[];
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  isActive: boolean;
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

// Report Types
export interface SalesReport {
  date: string;
  totalOrders: number;
  totalSales: number;
  totalCoPay: number;
  totalInsurance: number;
  totalRefunds: number;
  topMedicines: TopMedicine[];
}

export interface TopMedicine {
  medicineId: string;
  medicineName: string;
  quantity: number;
  revenue: number;
}

export interface InventoryAgingReport {
  medicineId: string;
  medicineName: string;
  category: string;
  currentStock: number;
  expiryDate: string;
  daysToExpiry: number;
  status: 'fresh' | 'expiring_soon' | 'expired';
}

export interface CommissionReport {
  doctorId: string;
  doctorName: string;
  specialty: string;
  prescriptionsCount: number;
  totalSales: number;
  commissionRate: number;
  commissionAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

// User Types
export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export type StaffRole = 'admin' | 'pharmacist' | 'cashier' | 'delivery' | 'viewer';

export interface Pharmacy {
  id: string;
  name: string;
  licenseNumber: string;
  address: Address;
  phone: string;
  email?: string;
  operatingHours: OperatingHours;
  is24Hours: boolean;
  isActive: boolean;
  logo?: string;
  banner?: string;
}

export interface OperatingHours {
  [day: string]: { open: string; close: string; closed?: boolean };
}

// Dashboard Types
export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayCoPay: number;
  pendingOrders: number;
  lowStockAlerts: number;
  pendingClaims: number;
  weeklySales: number[];
  monthlyOrders: number[];
  topSellingMedicines: TopMedicine[];
  recentOrders: Order[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
