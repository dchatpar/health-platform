// Local type definitions for patient app
// These types are specific to the patient app's needs

export interface Specialty {
  id: string;
  name: string;
  icon: string;
}

export interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: number;
}

export interface Clinic {
  id: string;
  name: string;
  address: Address;
  phone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  specialty: Specialty;
  qualifications: Qualification[];
  yearsOfExperience: number;
  bio: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  availableForTeleconsultation: boolean;
  availableForHomeVisit: boolean;
  languages: string[];
  clinic: Clinic;
  workingHours: WorkingHours[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  address?: Address;
  insuranceId?: string;
  insuranceProvider?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctor?: Doctor;
  patient?: User;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  type: 'in-person' | 'teleconsultation' | 'home-visit';
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctor?: Doctor;
  patient?: User;
  status: ConsultationStatus;
  type: 'video' | 'chat' | 'audio';
  notes?: string;
  diagnosis?: string;
  startTime: string;
  endTime?: string;
  roomId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ConsultationStatus =
  | 'waiting'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export interface ChatMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderType: 'patient' | 'doctor';
  message: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  readAt?: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  medicines: Medicine[];
  instructions: string;
  validUntil: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  address: Address;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  is24Hours: boolean;
  deliveryAvailable: boolean;
  rating: number;
  reviewCount: number;
  openingHours: string;
  createdAt: string;
}

export interface PharmacyOrder {
  id: string;
  patientId: string;
  pharmacyId: string;
  pharmacy?: Pharmacy;
  items: PharmacyOrderItem[];
  totalAmount: number;
  deliveryFee: number;
  status: OrderStatus;
  deliveryAddress: Address;
  deliveryTime?: string;
  prescriptionUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyOrderItem {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export interface MedicalRecord {
  id: string;
  patientId: string;
  type: RecordType;
  title: string;
  description: string;
  fileUrl?: string;
  recordDate: string;
  doctorId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type RecordType =
  | 'lab_result'
  | 'imaging'
  | 'prescription'
  | 'diagnosis'
  | 'vaccination'
  | 'procedure'
  | 'general';

export interface DoctorFilters {
  specialty?: string;
  search?: string;
  minRating?: number;
  maxFee?: number;
  availableForTeleconsultation?: boolean;
  languages?: string[];
  sortBy?: 'rating' | 'fee' | 'experience';
  sortOrder?: 'asc' | 'desc';
}
