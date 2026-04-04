import {
  Medicine,
  Order,
  Claim,
  DashboardStats,
  StaffUser,
  Pharmacy,
  SalesReport,
  InventoryAgingReport,
  CommissionReport,
} from '@/types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock Medicines
export const mockMedicines: Medicine[] = [
  {
    id: generateId(),
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    manufacturer: 'Pfizer',
    category: 'Antibiotics',
    dosage: '500mg',
    form: 'capsule',
    strength: '500mg',
    price: 150,
    stock: 150,
    minStock: 50,
    maxStock: 500,
    expiryDate: '2027-06-15',
    prescriptionRequired: true,
    insuranceCoverage: 80,
    requiresColdStorage: false,
    barcode: '1234567890123',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
  },
  {
    id: generateId(),
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    manufacturer: ' GSK',
    category: 'Pain Relief',
    dosage: '500mg',
    form: 'tablet',
    strength: '500mg',
    price: 50,
    stock: 500,
    minStock: 100,
    maxStock: 1000,
    expiryDate: '2026-12-01',
    prescriptionRequired: false,
    insuranceCoverage: 100,
    requiresColdStorage: false,
    barcode: '1234567890124',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-03-18T11:20:00Z',
  },
  {
    id: generateId(),
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    manufacturer: 'AstraZeneca',
    category: 'Gastrointestinal',
    dosage: '20mg',
    form: 'capsule',
    strength: '20mg',
    price: 200,
    stock: 80,
    minStock: 30,
    maxStock: 200,
    expiryDate: '2026-08-20',
    prescriptionRequired: true,
    insuranceCoverage: 90,
    requiresColdStorage: false,
    barcode: '1234567890125',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-03-15T16:45:00Z',
  },
  {
    id: generateId(),
    name: 'Insulin Glargine',
    genericName: 'Insulin Glargine',
    manufacturer: 'Sanofi',
    category: 'Diabetes',
    dosage: '100 IU/ml',
    form: 'injection',
    strength: '100 IU/ml',
    price: 1500,
    stock: 25,
    minStock: 20,
    maxStock: 100,
    expiryDate: '2026-04-10',
    prescriptionRequired: true,
    insuranceCoverage: 95,
    requiresColdStorage: true,
    barcode: '1234567890126',
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-03-22T09:15:00Z',
  },
  {
    id: generateId(),
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine',
    manufacturer: 'Johnson & Johnson',
    category: 'Antihistamines',
    dosage: '10mg',
    form: 'tablet',
    strength: '10mg',
    price: 80,
    stock: 300,
    minStock: 50,
    maxStock: 500,
    expiryDate: '2027-03-01',
    prescriptionRequired: false,
    insuranceCoverage: 100,
    requiresColdStorage: false,
    barcode: '1234567890127',
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-03-19T10:30:00Z',
  },
  {
    id: generateId(),
    name: 'Metformin 500mg',
    genericName: 'Metformin',
    manufacturer: 'Merck',
    category: 'Diabetes',
    dosage: '500mg',
    form: 'tablet',
    strength: '500mg',
    price: 100,
    stock: 200,
    minStock: 50,
    maxStock: 400,
    expiryDate: '2026-11-15',
    prescriptionRequired: true,
    insuranceCoverage: 90,
    requiresColdStorage: false,
    barcode: '1234567890128',
    createdAt: '2024-02-05T11:00:00Z',
    updatedAt: '2024-03-21T15:00:00Z',
  },
  {
    id: generateId(),
    name: 'Salbutamol Inhaler',
    genericName: 'Albuterol',
    manufacturer: 'GSK',
    category: 'Respiratory',
    dosage: '100mcg/dose',
    form: 'inhaler',
    strength: '100mcg',
    price: 350,
    stock: 45,
    minStock: 20,
    maxStock: 100,
    expiryDate: '2026-06-30',
    prescriptionRequired: true,
    insuranceCoverage: 85,
    requiresColdStorage: false,
    barcode: '1234567890129',
    createdAt: '2024-01-18T09:30:00Z',
    updatedAt: '2024-03-17T13:45:00Z',
  },
  {
    id: generateId(),
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    manufacturer: 'Bayer',
    category: 'Pain Relief',
    dosage: '400mg',
    form: 'tablet',
    strength: '400mg',
    price: 75,
    stock: 15,
    minStock: 30,
    maxStock: 400,
    expiryDate: '2026-09-10',
    prescriptionRequired: false,
    insuranceCoverage: 100,
    requiresColdStorage: false,
    barcode: '1234567890130',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-03-23T08:00:00Z',
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: generateId(),
    orderNumber: 'ORD-2024-001',
    patientId: 'P001',
    patientName: 'Ahmed Hassan',
    patientPhone: '+966501234567',
    doctorId: 'D001',
    doctorName: 'Dr. Fatima Al-Sayed',
    items: [
      {
        id: generateId(),
        medicineId: mockMedicines[0].id,
        medicineName: mockMedicines[0].name,
        quantity: 2,
        unitPrice: 150,
        discount: 0,
        total: 300,
      },
      {
        id: generateId(),
        medicineId: mockMedicines[1].id,
        medicineName: mockMedicines[1].name,
        quantity: 3,
        unitPrice: 50,
        discount: 10,
        total: 140,
      },
    ],
    status: 'delivered',
    subtotal: 440,
    discount: 10,
    insuranceCoverage: 344,
    coPay: 86,
    total: 430,
    deliveryFee: 0,
    deliveryAddress: {
      street: '123 King Fahd Road',
      city: 'Riyadh',
      state: 'Riyadh',
      postalCode: '12345',
      country: 'Saudi Arabia',
    },
    deliveryPartner: 'SMSA Express',
    deliveryPartnerPhone: '+966555123456',
    deliveryEstimatedTime: '45 mins',
    priority: 'normal',
    source: 'app',
    insuranceClaimId: 'CLM-001',
    claimStatus: 'approved',
    receivedAt: '2024-03-20T10:00:00Z',
    preparedAt: '2024-03-20T10:30:00Z',
    shippedAt: '2024-03-20T11:00:00Z',
    deliveredAt: '2024-03-20T11:45:00Z',
    createdAt: '2024-03-20T09:30:00Z',
    updatedAt: '2024-03-20T11:45:00Z',
  },
  {
    id: generateId(),
    orderNumber: 'ORD-2024-002',
    patientId: 'P002',
    patientName: 'Sara Mohammed',
    patientPhone: '+966507654321',
    doctorId: 'D002',
    doctorName: 'Dr. Khalid Rahman',
    items: [
      {
        id: generateId(),
        medicineId: mockMedicines[2].id,
        medicineName: mockMedicines[2].name,
        quantity: 1,
        unitPrice: 200,
        discount: 0,
        total: 200,
      },
    ],
    status: 'preparing',
    subtotal: 200,
    discount: 0,
    insuranceCoverage: 180,
    coPay: 20,
    total: 200,
    deliveryFee: 15,
    deliveryAddress: {
      street: '456 Al Olaya Street',
      city: 'Riyadh',
      state: 'Riyadh',
      postalCode: '54321',
      country: 'Saudi Arabia',
    },
    priority: 'urgent',
    source: 'phone',
    receivedAt: '2024-03-23T14:00:00Z',
    preparedAt: '2024-03-23T14:20:00Z',
    createdAt: '2024-03-23T13:45:00Z',
    updatedAt: '2024-03-23T14:20:00Z',
  },
  {
    id: generateId(),
    orderNumber: 'ORD-2024-003',
    patientId: 'P003',
    patientName: 'Omar Abdullah',
    patientPhone: '+966503456789',
    items: [
      {
        id: generateId(),
        medicineId: mockMedicines[4].id,
        medicineName: mockMedicines[4].name,
        quantity: 1,
        unitPrice: 80,
        discount: 0,
        total: 80,
      },
    ],
    status: 'pending',
    subtotal: 80,
    discount: 0,
    insuranceCoverage: 80,
    coPay: 0,
    total: 80,
    deliveryFee: 0,
    priority: 'normal',
    source: 'app',
    receivedAt: '2024-03-24T09:00:00Z',
    createdAt: '2024-03-24T08:45:00Z',
    updatedAt: '2024-03-24T09:00:00Z',
  },
  {
    id: generateId(),
    orderNumber: 'ORD-2024-004',
    patientId: 'P004',
    patientName: 'Layla Al-Rashid',
    patientPhone: '+966509876543',
    doctorId: 'D003',
    doctorName: 'Dr. Mohammed Al-Khalid',
    items: [
      {
        id: generateId(),
        medicineId: mockMedicines[3].id,
        medicineName: mockMedicines[3].name,
        quantity: 2,
        unitPrice: 1500,
        discount: 100,
        total: 2900,
      },
    ],
    status: 'ready',
    subtotal: 2900,
    discount: 100,
    insuranceCoverage: 2660,
    coPay: 240,
    total: 2900,
    deliveryFee: 25,
    deliveryAddress: {
      street: '789 Tahlia Street',
      city: 'Riyadh',
      state: 'Riyadh',
      postalCode: '67890',
      country: 'Saudi Arabia',
    },
    priority: 'urgent',
    source: 'app',
    insuranceClaimId: 'CLM-002',
    claimStatus: 'submitted',
    assignedTo: 'Staff-001',
    receivedAt: '2024-03-24T10:30:00Z',
    preparedAt: '2024-03-24T11:00:00Z',
    assignedAt: '2024-03-24T11:05:00Z',
    createdAt: '2024-03-24T10:15:00Z',
    updatedAt: '2024-03-24T11:05:00Z',
  },
];

// Mock Claims
export const mockClaims: Claim[] = [
  {
    id: generateId(),
    claimNumber: 'CLM-2024-001',
    orderId: mockOrders[0].id,
    orderNumber: mockOrders[0].orderNumber,
    patientId: 'P001',
    patientName: 'Ahmed Hassan',
    insuranceProviderId: 'INS001',
    insuranceProviderName: 'Bupa Saudi Arabia',
    policyNumber: 'POL-12345678',
    groupNumber: 'GRP-001',
    items: [
      {
        medicineId: mockMedicines[0].id,
        medicineName: mockMedicines[0].name,
        quantity: 2,
        unitPrice: 150,
        total: 300,
        covered: true,
        coveragePercentage: 80,
        coveredAmount: 240,
        coPayAmount: 60,
      },
      {
        medicineId: mockMedicines[1].id,
        medicineName: mockMedicines[1].name,
        quantity: 3,
        unitPrice: 50,
        total: 140,
        covered: true,
        coveragePercentage: 100,
        coveredAmount: 140,
        coPayAmount: 0,
      },
    ],
    totalAmount: 440,
    coveredAmount: 380,
    coPay: 60,
    deductible: 0,
    status: 'approved',
    submittedAt: '2024-03-21T08:00:00Z',
    processedAt: '2024-03-22T10:00:00Z',
    documents: [],
    createdAt: '2024-03-21T08:00:00Z',
    updatedAt: '2024-03-22T10:00:00Z',
  },
  {
    id: generateId(),
    claimNumber: 'CLM-2024-002',
    orderId: mockOrders[3].id,
    orderNumber: mockOrders[3].orderNumber,
    patientId: 'P004',
    patientName: 'Layla Al-Rashid',
    insuranceProviderId: 'INS002',
    insuranceProviderName: 'Tawuniya Insurance',
    policyNumber: 'POL-87654321',
    items: [
      {
        medicineId: mockMedicines[3].id,
        medicineName: mockMedicines[3].name,
        quantity: 2,
        unitPrice: 1500,
        total: 2900,
        covered: true,
        coveragePercentage: 95,
        coveredAmount: 2755,
        coPayAmount: 145,
      },
    ],
    totalAmount: 2900,
    coveredAmount: 2755,
    coPay: 145,
    deductible: 0,
    status: 'submitted',
    submittedAt: '2024-03-24T12:00:00Z',
    documents: [],
    createdAt: '2024-03-24T12:00:00Z',
    updatedAt: '2024-03-24T12:00:00Z',
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  todaySales: 15430,
  todayOrders: 23,
  todayCoPay: 2340,
  pendingOrders: 5,
  lowStockAlerts: 3,
  pendingClaims: 2,
  weeklySales: [12000, 14500, 13200, 15800, 14000, 16500, 15430],
  monthlyOrders: [450, 520, 480, 550, 600, 580],
  topSellingMedicines: [
    { medicineId: mockMedicines[0].id, medicineName: mockMedicines[0].name, quantity: 120, revenue: 18000 },
    { medicineId: mockMedicines[2].id, medicineName: mockMedicines[2].name, quantity: 95, revenue: 19000 },
    { medicineId: mockMedicines[1].id, medicineName: mockMedicines[1].name, quantity: 280, revenue: 14000 },
    { medicineId: mockMedicines[5].id, medicineName: mockMedicines[5].name, quantity: 85, revenue: 8500 },
    { medicineId: mockMedicines[4].id, medicineName: mockMedicines[4].name, quantity: 150, revenue: 12000 },
  ],
  recentOrders: mockOrders.slice(0, 5),
};

// Mock Staff Users
export const mockStaffUsers: StaffUser[] = [
  {
    id: 'S001',
    email: 'admin@pharmacy.com',
    name: 'Admin User',
    role: 'admin',
    phone: '+966501111111',
    isActive: true,
    lastLogin: '2024-03-24T08:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'S002',
    email: 'pharmacist@pharmacy.com',
    name: 'Ahmed Pharmacist',
    role: 'pharmacist',
    phone: '+966502222222',
    isActive: true,
    lastLogin: '2024-03-24T09:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'S003',
    email: 'cashier@pharmacy.com',
    name: 'Sara Cashier',
    role: 'cashier',
    phone: '+966503333333',
    isActive: true,
    lastLogin: '2024-03-24T10:00:00Z',
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'S004',
    email: 'delivery@pharmacy.com',
    name: 'Khalid Delivery',
    role: 'delivery',
    phone: '+966504444444',
    isActive: true,
    lastLogin: '2024-03-24T11:00:00Z',
    createdAt: '2024-02-15T00:00:00Z',
  },
];

// Mock Pharmacy Info
export const mockPharmacy: Pharmacy = {
  id: 'PH001',
  name: 'Health Plus Pharmacy',
  licenseNumber: 'LIC-2024-12345',
  address: {
    street: '123 Healthcare District',
    city: 'Riyadh',
    state: 'Riyadh',
    postalCode: '12345',
    country: 'Saudi Arabia',
  },
  phone: '+966112345678',
  email: 'contact@healthplus-pharmacy.com',
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
  isActive: true,
  logo: '/logo.png',
  banner: '/banner.png',
};

// Mock Reports
export const mockSalesReport: SalesReport[] = [
  { date: '2024-03-18', totalOrders: 45, totalSales: 28500, totalCoPay: 4200, totalInsurance: 23100, totalRefunds: 0, topMedicines: [] },
  { date: '2024-03-19', totalOrders: 52, totalSales: 31200, totalCoPay: 4800, totalInsurance: 25200, totalRefunds: 500, topMedicines: [] },
  { date: '2024-03-20', totalOrders: 48, totalSales: 29800, totalCoPay: 4400, totalInsurance: 24200, totalRefunds: 0, topMedicines: [] },
  { date: '2024-03-21', totalOrders: 55, totalSales: 33500, totalCoPay: 5100, totalInsurance: 27200, totalRefunds: 800, topMedicines: [] },
  { date: '2024-03-22', totalOrders: 50, totalSales: 30500, totalCoPay: 4600, totalInsurance: 24700, totalRefunds: 0, topMedicines: [] },
  { date: '2024-03-23', totalOrders: 58, totalSales: 35800, totalCoPay: 5400, totalInsurance: 29200, totalRefunds: 1200, topMedicines: [] },
  { date: '2024-03-24', totalOrders: 23, totalSales: 15430, totalCoPay: 2340, totalInsurance: 12490, totalRefunds: 0, topMedicines: [] },
];

export const mockInventoryAgingReport: InventoryAgingReport[] = [
  { medicineId: mockMedicines[3].id, medicineName: mockMedicines[3].name, category: 'Diabetes', currentStock: 25, expiryDate: '2026-04-10', daysToExpiry: 12, status: 'expiring_soon' },
  { medicineId: mockMedicines[6].id, medicineName: mockMedicines[6].name, category: 'Respiratory', currentStock: 45, expiryDate: '2026-06-30', daysToExpiry: 93, status: 'fresh' },
  { medicineId: mockMedicines[7].id, medicineName: mockMedicines[7].name, category: 'Pain Relief', currentStock: 15, expiryDate: '2026-09-10', daysToExpiry: 165, status: 'fresh' },
  { medicineId: mockMedicines[2].id, medicineName: mockMedicines[2].name, category: 'Gastrointestinal', currentStock: 80, expiryDate: '2026-08-20', daysToExpiry: 144, status: 'fresh' },
];

export const mockCommissionReport: CommissionReport[] = [
  { doctorId: 'D001', doctorName: 'Dr. Fatima Al-Sayed', specialty: 'General Practice', prescriptionsCount: 45, totalSales: 13500, commissionRate: 10, commissionAmount: 1350, paidAmount: 1000, pendingAmount: 350 },
  { doctorId: 'D002', doctorName: 'Dr. Khalid Rahman', specialty: 'Internal Medicine', prescriptionsCount: 38, totalSales: 15200, commissionRate: 10, commissionAmount: 1520, paidAmount: 1520, pendingAmount: 0 },
  { doctorId: 'D003', doctorName: 'Dr. Mohammed Al-Khalid', specialty: 'Endocrinology', prescriptionsCount: 25, totalSales: 18500, commissionRate: 12, commissionAmount: 2220, paidAmount: 1800, pendingAmount: 420 },
];

// API Functions (mock implementations)
export const api = {
  // Medicines
  getMedicines: async (params?: { search?: string; category?: string; lowStock?: boolean }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    let filtered = [...mockMedicines];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.genericName.toLowerCase().includes(search)
      );
    }

    if (params?.category) {
      filtered = filtered.filter((m) => m.category === params.category);
    }

    if (params?.lowStock) {
      filtered = filtered.filter((m) => m.stock <= m.minStock);
    }

    return { items: filtered, total: filtered.length };
  },

  getMedicine: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const medicine = mockMedicines.find((m) => m.id === id);
    if (!medicine) throw new Error('Medicine not found');
    return medicine;
  },

  createMedicine: async (data: Partial<Medicine>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newMedicine: Medicine = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Medicine;
    mockMedicines.push(newMedicine);
    return newMedicine;
  },

  updateMedicine: async (id: string, data: Partial<Medicine>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockMedicines.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Medicine not found');
    mockMedicines[index] = { ...mockMedicines[index], ...data, updatedAt: new Date().toISOString() };
    return mockMedicines[index];
  },

  deleteMedicine: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = mockMedicines.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Medicine not found');
    mockMedicines.splice(index, 1);
    return { success: true };
  },

  updateStock: async (id: string, quantity: number, reason: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const medicine = mockMedicines.find((m) => m.id === id);
    if (!medicine) throw new Error('Medicine not found');
    medicine.stock += quantity;
    medicine.updatedAt = new Date().toISOString();
    return medicine;
  },

  // Orders
  getOrders: async (params?: { status?: string; search?: string; date?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    let filtered = [...mockOrders];

    if (params?.status) {
      filtered = filtered.filter((o) => o.status === params.status);
    }

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.patientName.toLowerCase().includes(search)
      );
    }

    if (params?.date) {
      filtered = filtered.filter((o) => o.receivedAt.startsWith(params.date));
    }

    return { items: filtered, total: filtered.length };
  },

  getOrder: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  },

  updateOrderStatus: async (id: string, status: Order['status']) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error('Order not found');
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'received') order.receivedAt = new Date().toISOString();
    if (status === 'preparing') order.preparedAt = new Date().toISOString();
    if (status === 'ready') order.preparedAt = new Date().toISOString();
    if (status === 'assigned') order.assignedAt = new Date().toISOString();
    if (status === 'shipped') order.shippedAt = new Date().toISOString();
    if (status === 'delivered') order.deliveredAt = new Date().toISOString();
    return order;
  },

  // Claims
  getClaims: async (params?: { status?: string; search?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    let filtered = [...mockClaims];

    if (params?.status) {
      filtered = filtered.filter((c) => c.status === params.status);
    }

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.claimNumber.toLowerCase().includes(search) ||
          c.patientName.toLowerCase().includes(search)
      );
    }

    return { items: filtered, total: filtered.length };
  },

  getClaim: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const claim = mockClaims.find((c) => c.id === id);
    if (!claim) throw new Error('Claim not found');
    return claim;
  },

  updateClaimStatus: async (id: string, status: Claim['status']) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const claim = mockClaims.find((c) => c.id === id);
    if (!claim) throw new Error('Claim not found');
    claim.status = status;
    claim.updatedAt = new Date().toISOString();
    if (status === 'submitted') claim.submittedAt = new Date().toISOString();
    if (status === 'approved' || status === 'rejected') claim.processedAt = new Date().toISOString();
    return claim;
  },

  // Dashboard
  getDashboardStats: async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockDashboardStats;
  },

  // Reports
  getSalesReport: async (startDate: string, endDate: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockSalesReport;
  },

  getInventoryAgingReport: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockInventoryAgingReport;
  },

  getCommissionReport: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockCommissionReport;
  },

  // Staff
  getStaff: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { items: mockStaffUsers, total: mockStaffUsers.length };
  },

  // Settings
  getPharmacy: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockPharmacy;
  },

  updatePharmacy: async (data: Partial<Pharmacy>) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    Object.assign(mockPharmacy, data);
    return mockPharmacy;
  },
};

export type Order = import('@/types').Order;
export type Claim = import('@/types').Claim;
