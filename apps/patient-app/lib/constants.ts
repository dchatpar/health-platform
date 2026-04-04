// App-specific constants

export const APP_NAME = 'Health Patient';
export const APP_VERSION = '1.0.0';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  NOTIFICATION_SETTINGS: 'notification_settings',
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_TELECONSULTATION: true,
  ENABLE_HOME_VISIT: true,
  ENABLE_PHARMACY_DELIVERY: true,
  ENABLE_WALLET: true,
  ENABLE_MEDICAL_RECORDS: true,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MIN_TOUCH_TARGET: 44,
  BORDER_RADIUS: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  SHADOW: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
} as const;

// Consultation
export const CONSULTATION_CONFIG = {
  VIDEO_CALL_TIMEOUT: 30000,
  RECONNECT_ATTEMPTS: 3,
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_TIMEOUT: 3000,
} as const;

// Appointment
export const APPOINTMENT_CONFIG = {
  MIN_BOOKING_ADVANCE_HOURS: 1,
  MAX_BOOKING_ADVANCE_DAYS: 30,
  CANCELLATION_WINDOW_HOURS: 24,
} as const;

// Wallet
export const WALLET_CONFIG = {
  MIN_DEPOSIT: 10,
  MAX_DEPOSIT: 1000,
  MIN_WITHDRAWAL: 10,
  MAX_WITHDRAWAL: 5000,
} as const;

// Shared constants (from shared package fallback)
export const SPECIALTIES = [
  { id: '1', name: 'General Physician', icon: 'stethoscope' },
  { id: '2', name: 'Cardiologist', icon: 'heart' },
  { id: '3', name: 'Dermatologist', icon: 'user' },
  { id: '4', name: 'Neurologist', icon: 'brain' },
  { id: '5', name: 'Orthopedic', icon: 'bone' },
  { id: '6', name: 'Pediatrician', icon: 'child' },
  { id: '7', name: 'Psychiatrist', icon: 'smile' },
  { id: '8', name: 'Ophthalmologist', icon: 'eye' },
  { id: '9', name: 'ENT Specialist', icon: 'ear' },
  { id: '10', name: 'Dentist', icon: 'tooth' },
  { id: '11', name: 'Gynecologist', icon: 'female' },
  { id: '12', name: 'Urologist', icon: 'kidney' },
  { id: '13', name: 'Gastroenterologist', icon: 'stomach' },
  { id: '14', name: 'Pulmonologist', icon: 'lungs' },
  { id: '15', name: 'Endocrinologist', icon: 'gland' },
];

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
];

export const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';
