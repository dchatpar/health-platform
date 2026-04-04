import {
  User,
  Patient,
  Doctor,
  Pharmacy,
  PlatformStats,
  MasterMedicine,
  InsurancePlan,
  Specialty,
  CommissionRule,
  DoctorPayout,
  PharmacyPayout,
  Settlement,
  SupportTicket,
  RefundRequest,
  FraudAlert,
  AuditLog,
} from '@/types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock Users
export const mockPatients: Patient[] = [
  {
    id: 'P001',
    type: 'patient',
    email: 'ahmed@example.com',
    name: 'Ahmed Hassan',
    phone: '+966501234567',
    isActive: true,
    isVerified: true,
    dateOfBirth: '1990-05-15',
    gender: 'male',
    insuranceProviderId: 'INS001',
    insurancePolicyNumber: 'POL-12345678',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
    lastLogin: '2024-03-24T10:00:00Z',
  },
  {
    id: 'P002',
    type: 'patient',
    email: 'sara@example.com',
    name: 'Sara Mohammed',
    phone: '+966507654321',
    isActive: true,
    isVerified: true,
    dateOfBirth: '1985-08-22',
    gender: 'female',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-03-18T11:20:00Z',
    lastLogin: '2024-03-23T15:00:00Z',
  },
];

export const mockDoctors: Doctor[] = [
  {
    id: 'D001',
    type: 'doctor',
    email: 'fatima@hospital.com',
    name: 'Dr. Fatima Al-Sayed',
    phone: '+966551234567',
    isActive: true,
    isVerified: true,
    specialty: 'General Practice',
    licenseNumber: 'LIC-GP-001',
    yearsOfExperience: 15,
    education: 'King Saud University',
    hospital: 'King Faisal Specialist Hospital',
    consultationFee: 200,
    isAvailableForConsultation: true,
    isApproved: true,
    approvalStatus: 'approved',
    rating: 4.8,
    totalRatings: 125,
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
    lastLogin: '2024-03-24T09:00:00Z',
  },
  {
    id: 'D002',
    type: 'doctor',
    email: 'khalid@hospital.com',
    name: 'Dr. Khalid Rahman',
    phone: '+966552345678',
    isActive: true,
    isVerified: true,
    specialty: 'Internal Medicine',
    licenseNumber: 'LIC-IM-002',
    yearsOfExperience: 12,
    education: 'American Board Certified',
    hospital: 'Saudi German Hospital',
    consultationFee: 350,
    isAvailableForConsultation: true,
    isApproved: true,
    approvalStatus: 'approved',
    rating: 4.9,
    totalRatings: 89,
    createdAt: '2023-08-20T10:00:00Z',
    updatedAt: '2024-03-21T15:00:00Z',
    lastLogin: '2024-03-24T08:00:00Z',
  },
  {
    id: 'D003',
    type: 'doctor',
    email: 'pending@hospital.com',
    name: 'Dr. Mohammed Ali',
    phone: '+966553456789',
    isActive: false,
    isVerified: true,
    specialty: 'Cardiology',
    licenseNumber: 'LIC-CARD-003',
    yearsOfExperience: 10,
    education: 'King Abdulaziz University',
    hospital: 'National Guard Hospital',
    consultationFee: 500,
    isAvailableForConsultation: false,
    isApproved: false,
    approvalStatus: 'pending',
    rating: 0,
    totalRatings: 0,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
];

export const mockPharmacies: Pharmacy[] = [
  {
    id: 'PH001',
    type: 'pharmacy',
    email: 'contact@healthplus.com',
    name: 'Health Plus Pharmacy',
    phone: '+966112345678',
    isActive: true,
    isVerified: true,
    licenseNumber: 'LIC-2024-12345',
    address: {
      street: '123 Healthcare District',
      city: 'Riyadh',
      state: 'Riyadh',
      postalCode: '12345',
      country: 'Saudi Arabia',
    },
    operatingHours: {
      sunday: { open: '08:00', close: '22:00' },
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '14:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
    },
    is24Hours: false,
    isApproved: true,
    approvalStatus: 'approved',
    services: ['prescription', 'delivery', 'consultation'],
    rating: 4.5,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
    lastLogin: '2024-03-24T10:00:00Z',
  },
  {
    id: 'PH002',
    type: 'pharmacy',
    email: 'new@pharmacy.com',
    name: 'New Care Pharmacy',
    phone: '+966118765432',
    isActive: false,
    isVerified: true,
    licenseNumber: 'LIC-2024-67890',
    address: {
      street: '456 Medical Ave',
      city: 'Jeddah',
      state: 'Jeddah',
      postalCode: '54321',
      country: 'Saudi Arabia',
    },
    operatingHours: {
      sunday: { open: '08:00', close: '23:00' },
      monday: { open: '08:00', close: '23:00' },
      tuesday: { open: '08:00', close: '23:00' },
      wednesday: { open: '08:00', close: '23:00' },
      thursday: { open: '08:00', close: '23:00' },
      friday: { open: '14:00', close: '23:00' },
      saturday: { open: '08:00', close: '23:00' },
    },
    is24Hours: false,
    isApproved: false,
    approvalStatus: 'pending',
    services: ['prescription', 'delivery'],
    rating: 0,
    createdAt: '2024-03-22T10:00:00Z',
    updatedAt: '2024-03-22T10:00:00Z',
  },
];

// Mock Platform Stats
export const mockPlatformStats: PlatformStats = {
  totalUsers: 15420,
  totalDoctors: 245,
  totalPharmacies: 89,
  totalPatients: 15086,
  totalOrders: 45230,
  totalRevenue: 12500000,
  monthlyGrowth: 12.5,
  pendingApprovals: {
    doctors: 5,
    pharmacies: 3,
  },
  activeAlerts: 8,
  openTickets: 23,
};

// Mock Master Medicines
export const mockMasterMedicines: MasterMedicine[] = [
  {
    id: generateId(),
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    manufacturer: 'Pfizer',
    category: 'Antibiotics',
    dosage: '500mg',
    form: 'capsule',
    strength: '500mg',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
  },
  {
    id: generateId(),
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    manufacturer: 'GSK',
    category: 'Pain Relief',
    dosage: '500mg',
    form: 'tablet',
    strength: '500mg',
    isActive: true,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-03-18T11:20:00Z',
  },
];

// Mock Insurance Plans
export const mockInsurancePlans: InsurancePlan[] = [
  {
    id: 'INS001',
    providerId: 'BUP001',
    providerName: 'Bupa Saudi Arabia',
    name: 'Premium Health Plan',
    code: 'BUP-PREM',
    coverageTypes: [
      {
        id: 'CT001',
        name: 'General Consultation',
        coveragePercentage: 80,
        maxPerPrescription: 200,
        maxPerMonth: 1000,
        deductible: 50,
        requiresPreAuthorization: false,
        applicableCategories: ['General Practice'],
      },
      {
        id: 'CT002',
        name: 'Specialist Consultation',
        coveragePercentage: 70,
        maxPerPrescription: 400,
        maxPerMonth: 2000,
        deductible: 100,
        requiresPreAuthorization: true,
        applicableCategories: ['Internal Medicine', 'Cardiology', 'Dermatology'],
      },
    ],
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
  },
];

// Mock Specialties
export const mockSpecialties: Specialty[] = [
  { id: 'SP001', name: 'General Practice', description: 'General practitioners', isActive: true, createdAt: '2023-01-01T10:00:00Z' },
  { id: 'SP002', name: 'Internal Medicine', description: 'Internal medicine specialists', isActive: true, createdAt: '2023-01-01T10:00:00Z' },
  { id: 'SP003', name: 'Cardiology', description: 'Heart specialists', isActive: true, createdAt: '2023-01-01T10:00:00Z' },
  { id: 'SP004', name: 'Dermatology', description: 'Skin specialists', isActive: true, createdAt: '2023-01-01T10:00:00Z' },
];

// Mock Commission Rules
export const mockCommissionRules: CommissionRule[] = [
  {
    id: 'CR001',
    specialtyId: 'SP001',
    specialtyName: 'General Practice',
    commissionPercentage: 10,
    effectiveFrom: '2024-01-01',
    isActive: true,
  },
  {
    id: 'CR002',
    specialtyId: 'SP002',
    specialtyName: 'Internal Medicine',
    commissionPercentage: 12,
    effectiveFrom: '2024-01-01',
    isActive: true,
  },
];

// Mock Financial Data
export const mockDoctorPayouts: DoctorPayout[] = [
  {
    id: 'DP001',
    doctorId: 'D001',
    doctorName: 'Dr. Fatima Al-Sayed',
    specialty: 'General Practice',
    period: 'March 2024',
    prescriptionsCount: 45,
    totalAmount: 9000,
    commissionAmount: 900,
    platformFee: 90,
    netAmount: 8010,
    status: 'completed',
    paidAt: '2024-03-20T10:00:00Z',
    bankReference: 'BANK-TXN-001',
  },
];

export const mockPharmacyPayouts: PharmacyPayout[] = [
  {
    id: 'PP001',
    pharmacyId: 'PH001',
    pharmacyName: 'Health Plus Pharmacy',
    period: 'March 2024',
    ordersCount: 156,
    totalSales: 125000,
    platformCommission: 6250,
    netAmount: 118750,
    status: 'completed',
    paidAt: '2024-03-20T10:00:00Z',
    bankReference: 'BANK-TXN-002',
  },
];

// Mock Support Tickets
export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'T001',
    ticketNumber: 'TKT-2024-001',
    userId: 'P001',
    userName: 'Ahmed Hassan',
    userType: 'patient',
    category: 'billing',
    subject: 'Incorrect charge on my order',
    description: 'I was charged incorrectly for my last order...',
    priority: 'medium',
    status: 'in_progress',
    assignedTo: 'A001',
    assignedToName: 'Admin User',
    messages: [],
    createdAt: '2024-03-22T10:00:00Z',
    updatedAt: '2024-03-23T14:00:00Z',
  },
];

// Mock Refund Requests
export const mockRefundRequests: RefundRequest[] = [
  {
    id: 'R001',
    requestNumber: 'REF-2024-001',
    orderId: 'ORD001',
    orderNumber: 'ORD-2024-001',
    patientId: 'P001',
    patientName: 'Ahmed Hassan',
    pharmacyId: 'PH001',
    pharmacyName: 'Health Plus Pharmacy',
    amount: 150,
    reason: 'Medicine was expired',
    status: 'pending',
    createdAt: '2024-03-22T10:00:00Z',
  },
];

// Mock Fraud Alerts
export const mockFraudAlerts: FraudAlert[] = [
  {
    id: 'FA001',
    alertType: 'suspicious_order',
    severity: 'high',
    userId: 'P003',
    userName: 'Unknown User',
    userType: 'patient',
    description: 'Multiple high-value orders from different addresses',
    status: 'reviewing',
    createdAt: '2024-03-24T10:00:00Z',
  },
];

// Mock Audit Logs
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'AL001',
    userId: 'A001',
    userName: 'Admin User',
    userType: 'admin',
    action: 'APPROVE_DOCTOR',
    entityType: 'doctor',
    entityId: 'D001',
    details: { doctorName: 'Dr. Fatima Al-Sayed' },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    createdAt: '2024-03-20T10:00:00Z',
  },
];

// API Functions
export const api = {
  // Dashboard
  getPlatformStats: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockPlatformStats;
  },

  // Users
  getUsers: async (type?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (type === 'patient') return { items: mockPatients, total: mockPatients.length };
    if (type === 'doctor') return { items: mockDoctors, total: mockDoctors.length };
    if (type === 'pharmacy') return { items: mockPharmacies, total: mockPharmacies.length };
    return { items: [...mockPatients, ...mockDoctors, ...mockPharmacies], total: 30 };
  },

  getDoctors: async (params?: { approvalStatus?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let filtered = [...mockDoctors];
    if (params?.approvalStatus) {
      filtered = filtered.filter((d) => d.approvalStatus === params.approvalStatus);
    }
    return { items: filtered, total: filtered.length };
  },

  getPharmacies: async (params?: { approvalStatus?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let filtered = [...mockPharmacies];
    if (params?.approvalStatus) {
      filtered = filtered.filter((p) => p.approvalStatus === params.approvalStatus);
    }
    return { items: filtered, total: filtered.length };
  },

  approveDoctor: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const doctor = mockDoctors.find((d) => d.id === id);
    if (doctor) {
      doctor.isApproved = true;
      doctor.approvalStatus = 'approved';
    }
    return doctor;
  },

  rejectDoctor: async (id: string, reason: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const doctor = mockDoctors.find((d) => d.id === id);
    if (doctor) {
      doctor.isApproved = false;
      doctor.approvalStatus = 'rejected';
      doctor.rejectionReason = reason;
    }
    return doctor;
  },

  approvePharmacy: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const pharmacy = mockPharmacies.find((p) => p.id === id);
    if (pharmacy) {
      pharmacy.isApproved = true;
      pharmacy.approvalStatus = 'approved';
    }
    return pharmacy;
  },

  rejectPharmacy: async (id: string, reason: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const pharmacy = mockPharmacies.find((p) => p.id === id);
    if (pharmacy) {
      pharmacy.isApproved = false;
      pharmacy.approvalStatus = 'rejected';
      pharmacy.rejectionReason = reason;
    }
    return pharmacy;
  },

  // Catalog
  getMasterMedicines: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { items: mockMasterMedicines, total: mockMasterMedicines.length };
  },

  // Insurance
  getInsurancePlans: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { items: mockInsurancePlans, total: mockInsurancePlans.length };
  },

  // Specialties
  getSpecialties: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { items: mockSpecialties, total: mockSpecialties.length };
  },

  // Commissions
  getCommissionRules: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { items: mockCommissionRules, total: mockCommissionRules.length };
  },

  // Financials
  getDoctorPayouts: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { items: mockDoctorPayouts, total: mockDoctorPayouts.length };
  },

  getPharmacyPayouts: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { items: mockPharmacyPayouts, total: mockPharmacyPayouts.length };
  },

  // Support
  getSupportTickets: async (params?: { status?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let filtered = [...mockSupportTickets];
    if (params?.status) {
      filtered = filtered.filter((t) => t.status === params.status);
    }
    return { items: filtered, total: filtered.length };
  },

  getRefundRequests: async (params?: { status?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let filtered = [...mockRefundRequests];
    if (params?.status) {
      filtered = filtered.filter((r) => r.status === params.status);
    }
    return { items: filtered, total: filtered.length };
  },

  // Security
  getFraudAlerts: async (params?: { status?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let filtered = [...mockFraudAlerts];
    if (params?.status) {
      filtered = filtered.filter((f) => f.status === params.status);
    }
    return { items: filtered, total: filtered.length };
  },

  getAuditLogs: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { items: mockAuditLogs, total: mockAuditLogs.length };
  },

  // Profile
  getProfile: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id: 'A001',
      name: 'Admin User',
      email: 'admin@health.com',
      phone: '+966501234567',
      role: 'super_admin',
    };
  },

  updateProfile: async (data: { name: string; email: string; phone?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      ...data,
      updatedAt: new Date().toISOString(),
    };
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (data.currentPassword === 'wrong') {
      throw new Error('Current password is incorrect');
    }
    return { success: true };
  },

  // Notifications
  updateNotificationPreferences: async (data: Record<string, boolean>) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true, ...data };
  },

  // Sessions
  getActiveSessions: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      items: [
        {
          id: 'sess_1',
          deviceName: 'Chrome on Windows',
          deviceType: 'Desktop',
          location: 'Riyadh, Saudi Arabia',
          lastActive: 'Just now',
          isCurrent: true,
        },
        {
          id: 'sess_2',
          deviceName: 'Safari on iPhone',
          deviceType: 'Mobile',
          location: 'Riyadh, Saudi Arabia',
          lastActive: '2 hours ago',
          isCurrent: false,
        },
        {
          id: 'sess_3',
          deviceName: 'Firefox on Linux',
          deviceType: 'Desktop',
          location: 'Jeddah, Saudi Arabia',
          lastActive: 'Yesterday',
          isCurrent: false,
        },
      ],
    };
  },

  revokeSession: async (sessionId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true, sessionId };
  },

  revokeAllSessions: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  },
};
