// Doctor Types

export interface DoctorProfile {
  id: string;
  userId: string;
  specialty: Specialty;
  licenseNumber: string;
  yearsOfExperience: number;
  bio?: string;
  education: Education[];
  consultationFee: number;
  rating: number;
  reviewCount: number;
  availableSlots: number;
  isAcceptingPatients: boolean;
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

export type Specialty =
  | 'GENERAL_PRACTICE'
  | 'INTERNAL_MEDICINE'
  | 'PEDIATRICS'
  | 'SURGERY'
  | 'CARDIOLOGY'
  | 'DERMATOLOGY'
  | 'NEUROLOGY'
  | 'ORTHOPEDICS'
  | 'GYNECOLOGY'
  | 'PSYCHIATRY'
  | 'ONCOLOGY'
  | 'OPHTHALMOLOGY'
  | 'ENT'
  | 'UROLOGY'
  | 'GASTROENTEROLOGY'
  | 'ENDOCRINOLOGY'
  | 'RHEUMATOLOGY'
  | 'PULMONOLOGY'
  | 'NEPHROLOGY'
  | 'INFECTIOUS_DISEASE'
  | 'ALLERGY_IMMUNOLOGY'
  | 'SPORTS_MEDICINE'
  | 'EMERGENCY_MEDICINE'
  | 'ANESTHESIOLOGY'
  | 'RADIOLOGY'
  | 'PATHOLOGY'
  | 'FAMILY_MEDICINE';

export interface SpecialtyInfo {
  id: Specialty;
  name: string;
  description: string;
  icon?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear?: number;
  isVerified: boolean;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  slotDuration: number; // in minutes
  isAvailable: boolean;
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isBooked: boolean;
  isAvailable: boolean;
}

export interface DoctorAvailability {
  doctorId: string;
  date: string;
  slots: TimeSlot[];
  isAvailable: boolean;
}

export interface DoctorSearchInput {
  specialty?: Specialty;
  name?: string;
  minRating?: number;
  maxFee?: number;
  minExperience?: number;
  isAcceptingPatients?: boolean;
  language?: string;
  date?: string; // For date-specific search
}

export interface DoctorSearchResult {
  doctors: DoctorProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DoctorReview {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  isVerified: boolean;
}

export interface CreateReviewInput {
  doctorId: string;
  rating: number;
  comment?: string;
}

export interface UpdateDoctorProfileInput {
  specialty?: Specialty;
  bio?: string;
  consultationFee?: number;
  isAcceptingPatients?: boolean;
  languages?: string[];
}

export interface DoctorStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalEarnings: number;
  averageRating: number;
  thisMonthAppointments: number;
  thisMonthEarnings: number;
}
