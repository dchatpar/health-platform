// Pharmacy Types

import type { Prescription } from './prescription.types';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DISPATCHED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface Pharmacy {
  id: string;
  userId: string;
  pharmacyName: string;
  licenseNumber: string;
  is24Hours: boolean;
  deliveryRadius: number;
  address: PharmacyAddress;
  rating: number;
  reviewCount: number;
  verified: boolean;
  openingHours: PharmacyHours[];
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: Coordinates;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PharmacyHours {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  category: MedicineCategory;
  description?: string;
  composition?: string;
  sideEffects?: string[];
  contraindications?: string[];
  interactions?: string[];
  dosage?: string;
  form: MedicineForm;
  strength: string;
  requiresPrescription: boolean;
  imageUrl?: string;
  averagePrice: number;
  inStock: boolean;
  quantity?: number;
  reorderLevel?: number;
  expiresAt?: string;
}

export type MedicineCategory =
  | 'ANALGESICS'
  | 'ANTIBIOTICS'
  | 'ANTIVIRALS'
  | 'ANTIFUNGALS'
  | 'ANTIHISTAMINES'
  | 'CARDIOVASCULAR'
  | 'DIABETES'
  | 'GASTROINTESTINAL'
  | 'RESPIRATORY'
  | 'DERMATOLOGICAL'
  | 'NEUROLOGICAL'
  | 'PSYCHIATRIC'
  | 'EYE_EAR'
  | 'MUSCULOSKELETAL'
  | 'HORMONAL'
  | 'VITAMINS_SUPPLEMENTS'
  | 'HERBAL'
  | 'OTHER';

export type MedicineForm = 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'OINTMENT' | 'DROPS' | 'INHALER' | 'PATCH' | 'SUPPOSITORY' | 'POWDER' | 'SUSPENSION' | 'GEL' | 'SPRAY' | 'LOZENGES';

export interface Order {
  id: string;
  patientId: string;
  pharmacyId: string;
  prescriptionId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  deliveryAddress: DeliveryAddress;
  deliveryInstructions?: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  prescriptionId?: string;
  requiresPrescription: boolean;
  notes?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: Coordinates;
  instructions?: string;
}

export type PaymentMethod = 'WALLET' | 'CARD' | 'INSURANCE' | 'COD';

export interface CreateOrderInput {
  pharmacyId: string;
  prescriptionId?: string;
  items: {
    medicineId: string;
    quantity: number;
    notes?: string;
  }[];
  deliveryAddress: DeliveryAddress;
  deliveryInstructions?: string;
  paymentMethod: PaymentMethod;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  notes?: string;
}

export interface CancelOrderInput {
  orderId: string;
  reason: string;
}

export interface OrderSearchInput {
  patientId?: string;
  pharmacyId?: string;
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PharmacyInventory {
  medicineId: string;
  pharmacyId: string;
  stock: number;
  price: number;
  isAvailable: boolean;
  lastRestocked?: string;
}

export interface UpdateStockInput {
  medicineId: string;
  quantity: number;
  operation: 'ADD' | 'REMOVE' | 'SET';
}

export interface Delivery {
  id: string;
  orderId: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  status: DeliveryStatus;
  pickedUpAt?: string;
  estimatedArrival?: string;
  deliveredAt?: string;
  currentLocation?: Coordinates;
  route?: string;
}

export type DeliveryStatus = 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'ARRIVED' | 'DELIVERED' | 'FAILED';

export interface DeliveryTrackingResponse {
  orderId: string;
  status: DeliveryStatus;
  estimatedArrival?: string;
  currentLocation?: Coordinates;
  driver?: {
    name: string;
    phone: string;
    photoUrl?: string;
  };
  path: {
    latitude: number;
    longitude: number;
    timestamp: string;
  }[];
}

export interface PrescriptionVerification {
  prescriptionId: string;
  isValid: boolean;
  expiryDate?: string;
  refillsRemaining: number;
  prescriberVerified: boolean;
  issues?: string[];
}
