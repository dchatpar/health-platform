// Consultation Types

export type ConsultationStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  status: ConsultationStatus;
  type: 'IN_PERSON' | 'VIDEO' | 'PHONE';
  startTime?: string;
  endTime?: string;
  notes?: DoctorNotes;
  diagnosis?: string;
  treatmentPlan?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorNotes {
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  examinationFindings?: string;
  assessment?: string;
  plan?: string;
  prescriptions?: string[];
  labOrders?: LabOrder[];
  imagingOrders?: ImagingOrder[];
  referrals?: Referral[];
}

export interface LabOrder {
  id: string;
  testName: string;
  testCode?: string;
  reason?: string;
  instructions?: string;
  status: 'PENDING' | 'COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  results?: LabResult;
}

export interface LabResult {
  id: string;
  testName: string;
  value: string | number;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  notes?: string;
  completedAt: string;
}

export interface ImagingOrder {
  id: string;
  type: 'X_RAY' | 'ULTRASOUND' | 'CT_SCAN' | 'MRI' | 'PET_SCAN';
  bodyPart: string;
  reason?: string;
  instructions?: string;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  results?: ImagingResult;
}

export interface ImagingResult {
  id: string;
  type: string;
  findings?: string;
  impression?: string;
  images?: string[];
  radiologistNotes?: string;
  completedAt: string;
}

export interface Referral {
  id: string;
  toSpecialty: string;
  reason: string;
  notes?: string;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface ChatMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderRole: 'PATIENT' | 'DOCTOR';
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'PRESCRIPTION';
  attachments?: Attachment[];
  readAt?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface StartConsultationInput {
  appointmentId: string;
  type: 'IN_PERSON' | 'VIDEO' | 'PHONE';
}

export interface EndConsultationInput {
  consultationId: string;
  notes: DoctorNotes;
  diagnosis: string;
  treatmentPlan: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface SendMessageInput {
  consultationId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
  attachments?: File[];
}

export interface ConsultationHistory {
  consultations: Consultation[];
  total: number;
  page: number;
  limit: number;
}

export interface VideoSession {
  id: string;
  consultationId: string;
  roomId: string;
  roomUrl: string;
  hostToken: string;
  guestToken: string;
  expiresAt: string;
  status: 'ACTIVE' | 'ENDED' | 'EXPIRED';
}

export interface CreateVideoSessionResponse {
  session: VideoSession;
  roomUrl: string;
}
