// User/Auth types
export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  avatar?: string;
  isOnline: boolean;
  licenseNumber?: string;
  licenseVerified: boolean;
  bankingInfo?: BankingInfo;
  schedule?: DaySchedule[];
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  avatar?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  bloodType?: string;
  allergies?: string;
  conditions?: string[];
  emergencyContact?: EmergencyContact;
  insuranceInfo?: InsuranceInfo;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
}

// Appointment types
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  doctor?: Doctor;
  scheduledAt: string;
  status: AppointmentStatus;
  type?: string;
  duration?: number;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Consultation types
export interface Consultation {
  id: string;
  appointmentId: string;
  appointment: Appointment;
  doctorId: string;
  doctor: Doctor;
  patientId: string;
  patient: Patient;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: ClinicalNotes;
  prescriptions?: Prescription[];
  orders?: LabOrder[];
}

export interface ClinicalNotes {
  id: string;
  consultationId: string;
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  assessment: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  medications: PrescriptionMedication[];
  notes?: string;
  followUp?: string;
  createdAt: string;
}

export interface PrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface LabOrder {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  type: 'lab' | 'radiology';
  tests: string[];
  urgency: 'routine' | 'urgent' | 'stat';
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

// Medical Record types
export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: 'consultation' | 'prescription' | 'lab' | 'radiology';
  condition?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  status?: string;
  doctor?: {
    id: string;
    name: string;
    specialty: string;
  };
}

// Schedule types
export interface DaySchedule {
  isAvailable: boolean;
  startHour: number;
  endHour: number;
}

// Earnings types
export type TransactionType = 'consultation' | 'withdrawal' | 'refund' | 'bonus';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: TransactionStatus;
  description?: string;
  appointmentId?: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  pendingAmount: number;
  availableAmount: number;
  lastWithdrawalDate?: string;
  weeklyLimit: number;
}

// Chat/Message types
export interface Message {
  id?: string;
  type: 'chat' | 'file' | 'system';
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  metadata?: {
    fileUrl?: string;
    fileName?: string;
  };
}

// WebRTC types
export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'candidate';
  payload: any;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
