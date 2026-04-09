// Prescription Types

export type PrescriptionStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  consultationId?: string;
  medications: Medication[];
  diagnosis?: string;
  instructions?: string;
  status: PrescriptionStatus;
  startDate: string;
  endDate: string;
  refillsRemaining: number;
  pharmacyId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  route: 'ORAL' | 'TOPICAL' | 'INJECTION' | 'INHALATION' | 'SUPPOSITORY' | 'OPHTHALMIC' | 'OTIC' | 'NASAL' | 'TRANSDERMAL';
  instructions?: string;
  warnings?: string[];
  refills: number;
  brandOnly?: boolean;
  takings: Taking[];
}

export interface Taking {
  id: string;
  medicationId: string;
  scheduledTime: string;
  takenAt?: string;
  status: 'PENDING' | 'TAKEN' | 'SKIPPED' | 'MISSED';
  notes?: string;
}

export interface CreatePrescriptionInput {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  consultationId?: string;
  medications: CreateMedicationInput[];
  diagnosis?: string;
  instructions?: string;
  startDate: string;
  endDate: string;
  refillsRemaining?: number;
  pharmacyId?: string;
  notes?: string;
}

export interface CreateMedicationInput {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  route: Medication['route'];
  instructions?: string;
  warnings?: string[];
  refills: number;
  brandOnly?: boolean;
}

export interface UpdatePrescriptionInput {
  status?: PrescriptionStatus;
  endDate?: string;
  refillsRemaining?: number;
  pharmacyId?: string;
  notes?: string;
}

export interface RefillRequest {
  id: string;
  prescriptionId: string;
  patientId: string;
  medicationId: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'CANCELLED';
  requestedAt: string;
  reviewedAt?: string;
  notes?: string;
}

export interface CreateRefillRequestInput {
  prescriptionId: string;
  medicationId: string;
  notes?: string;
}

// Electronic Health Record (EHR) Types

export interface ElectronicHealthRecord {
  id: string;
  patientId: string;
  allergies: string[];
  chronicConditions: string[];
  medications: ActiveMedication[];
  immunizations: Immunization[];
  surgeries: Surgery[];
  familyHistory: FamilyHistoryItem[];
  vitalSigns: VitalSigns[];
  labResults: LabResultSummary[];
  conditions: Condition[];
  createdAt: string;
  updatedAt: string;
}

export interface ActiveMedication {
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface Immunization {
  id: string;
  vaccine: string;
  date: string;
  administeredBy?: string;
  lotNumber?: string;
  nextDueDate?: string;
}

export interface Surgery {
  id: string;
  procedure: string;
  date: string;
  hospital?: string;
  surgeon?: string;
  notes?: string;
}

export interface FamilyHistoryItem {
  condition: string;
  relationship: string;
  ageAtDiagnosis?: number;
  notes?: string;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  recordedAt: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  recordedBy?: string;
}

export interface LabResultSummary {
  id: string;
  testName: string;
  value: string | number;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  testDate: string;
  orderedBy?: string;
}

export interface Condition {
  id: string;
  name: string;
  icdCode?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CHRONIC';
  diagnosedDate?: string;
  resolvedDate?: string;
  notes?: string;
}
