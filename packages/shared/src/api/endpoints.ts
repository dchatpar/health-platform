// API Endpoints

export const API_VERSION = 'v1';

export const BASE_ENDPOINTS = {
  AUTH: `/auth`,
  USERS: `/users`,
  PROFILE: `/profile`,
  APPOINTMENTS: `/appointments`,
  DOCTORS: `/doctors`,
  SCHEDULE: `/schedule`,
  REVIEWS: `/reviews`,
  CONSULTATIONS: `/consultations`,
  PRESCRIPTIONS: `/prescriptions`,
  PHARMACIES: `/pharmacies`,
  MEDICINES: `/medicines`,
  ORDERS: `/orders`,
  DELIVERY: `/delivery`,
  INSURANCE: `/insurance`,
  CLAIMS: `/claims`,
  POLICIES: `/policies`,
  WALLET: `/wallet`,
  PAYMENTS: `/payments`,
  NOTIFICATIONS: `/notifications`,
  SETTINGS: `/settings`,
  REPORTS: `/reports`,
  AUDIT: `/audit`,
} as const;

// Auth Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${BASE_ENDPOINTS.AUTH}/login`,
  REGISTER: `${BASE_ENDPOINTS.AUTH}/register`,
  LOGOUT: `${BASE_ENDPOINTS.AUTH}/logout`,
  REFRESH: `${BASE_ENDPOINTS.AUTH}/refresh`,
  OTP_SEND: `${BASE_ENDPOINTS.AUTH}/otp/send`,
  OTP_VERIFY: `${BASE_ENDPOINTS.AUTH}/otp/verify`,
  PASSWORD_RESET: `${BASE_ENDPOINTS.AUTH}/password/reset`,
  PASSWORD_CHANGE: `${BASE_ENDPOINTS.AUTH}/password/change`,
  SOCIAL_AUTH: `${BASE_ENDPOINTS.AUTH}/social`,
  SESSIONS: `${BASE_ENDPOINTS.AUTH}/sessions`,
  REVOKE_SESSION: (sessionId: string) => `${BASE_ENDPOINTS.AUTH}/sessions/${sessionId}`,
  REVOKE_ALL_SESSIONS: `${BASE_ENDPOINTS.AUTH}/sessions/all`,
} as const;

// User Endpoints
export const USER_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.USERS,
  CREATE: BASE_ENDPOINTS.USERS,
  GET: (id: string) => `${BASE_ENDPOINTS.USERS}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.USERS}/${id}`,
  DELETE: (id: string) => `${BASE_ENDPOINTS.USERS}/${id}`,
  SEARCH: `${BASE_ENDPOINTS.USERS}/search`,
  VERIFY: (id: string) => `${BASE_ENDPOINTS.USERS}/${id}/verify`,
  DEACTIVATE: (id: string) => `${BASE_ENDPOINTS.USERS}/${id}/deactivate`,
  ACTIVATE: (id: string) => `${BASE_ENDPOINTS.USERS}/${id}/activate`,
} as const;

// Profile Endpoints
export const PROFILE_ENDPOINTS = {
  GET: BASE_ENDPOINTS.PROFILE,
  UPDATE: BASE_ENDPOINTS.PROFILE,
  AVATAR_UPLOAD: `${BASE_ENDPOINTS.PROFILE}/avatar`,
  AVATAR_DELETE: `${BASE_ENDPOINTS.PROFILE}/avatar`,
} as const;

// Appointment Endpoints
export const APPOINTMENT_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.APPOINTMENTS,
  CREATE: BASE_ENDPOINTS.APPOINTMENTS,
  GET: (id: string) => `${BASE_ENDPOINTS.APPOINTMENTS}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.APPOINTMENTS}/${id}`,
  CANCEL: (id: string) => `${BASE_ENDPOINTS.APPOINTMENTS}/${id}/cancel`,
  RESCHEDULE: (id: string) => `${BASE_ENDPOINTS.APPOINTMENTS}/${id}/reschedule`,
  CONFIRM: (id: string) => `${BASE_ENDPOINTS.APPOINTMENTS}/${id}/confirm`,
  START: (id: string) => `${BASE_ENDPOINTS.APPOINTMENTS}/${id}/start`,
  COMPLETE: (id: string) => `${BASE_ENDPOINTS.APPOINTMENTS}/${id}/complete`,
  SEARCH: `${BASE_ENDPOINTS.APPOINTMENTS}/search`,
  AVAILABILITY: `${BASE_ENDPOINTS.APPOINTMENTS}/availability`,
  SLOTS: `${BASE_ENDPOINTS.APPOINTMENTS}/slots`,
  STATS: `${BASE_ENDPOINTS.APPOINTMENTS}/stats`,
} as const;

// Doctor Endpoints
export const DOCTOR_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.DOCTORS,
  GET: (id: string) => `${BASE_ENDPOINTS.DOCTORS}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.DOCTORS}/${id}`,
  SEARCH: `${BASE_ENDPOINTS.DOCTORS}/search`,
  SPECIALTIES: `${BASE_ENDPOINTS.DOCTORS}/specialties`,
  AVAILABILITY: (id: string) => `${BASE_ENDPOINTS.DOCTORS}/${id}/availability`,
  SCHEDULE: (id: string) => `${BASE_ENDPOINTS.DOCTORS}/${id}/schedule`,
  SCHEDULE_UPDATE: (id: string) => `${BASE_ENDPOINTS.DOCTORS}/${id}/schedule`,
  BULK_SCHEDULE: (id: string) => `${BASE_ENDPOINTS.DOCTORS}/${id}/schedule/bulk`,
  REVIEWS: (id: string) => `${BASE_ENDPOINTS.DOCTORS}/${id}/reviews`,
  STATS: (id: string) => `${BASE_ENDPOINTS.DOCTORS}/${id}/stats`,
  VERIFY: (id: string) => `${BASE_ENDPOINTS.DOCTORS}/${id}/verify`,
} as const;

// Schedule Endpoints
export const SCHEDULE_ENDPOINTS = {
  GET: BASE_ENDPOINTS.SCHEDULE,
  UPDATE: BASE_ENDPOINTS.SCHEDULE,
  BULK_UPDATE: `${BASE_ENDPOINTS.SCHEDULE}/bulk`,
  TEMPLATE: `${BASE_ENDPOINTS.SCHEDULE}/template`,
} as const;

// Review Endpoints
export const REVIEW_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.REVIEWS,
  CREATE: BASE_ENDPOINTS.REVIEWS,
  GET: (id: string) => `${BASE_ENDPOINTS.REVIEWS}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.REVIEWS}/${id}`,
  DELETE: (id: string) => `${BASE_ENDPOINTS.REVIEWS}/${id}`,
  DOCTOR_REVIEWS: (doctorId: string) => `${BASE_ENDPOINTS.REVIEWS}/doctor/${doctorId}`,
} as const;

// Consultation Endpoints
export const CONSULTATION_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.CONSULTATIONS,
  CREATE: BASE_ENDPOINTS.CONSULTATIONS,
  GET: (id: string) => `${BASE_ENDPOINTS.CONSULTATIONS}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.CONSULTATIONS}/${id}`,
  START: (id: string) => `${BASE_ENDPOINTS.CONSULTATIONS}/${id}/start`,
  END: (id: string) => `${BASE_ENDPOINTS.CONSULTATIONS}/${id}/end`,
  CHAT: (id: string) => `${BASE_ENDPOINTS.CONSULTATIONS}/${id}/chat`,
  CHAT_SEND: (id: string) => `${BASE_ENDPOINTS.CONSULTATIONS}/${id}/chat/send`,
  VIDEO_SESSION: (id: string) => `${BASE_ENDPOINTS.CONSULTATIONS}/${id}/video`,
  HISTORY: `${BASE_ENDPOINTS.CONSULTATIONS}/history`,
} as const;

// Prescription Endpoints
export const PRESCRIPTION_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.PRESCRIPTIONS,
  CREATE: BASE_ENDPOINTS.PRESCRIPTIONS,
  GET: (id: string) => `${BASE_ENDPOINTS.PRESCRIPTIONS}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.PRESCRIPTIONS}/${id}`,
  DELETE: (id: string) => `${BASE_ENDPOINTS.PRESCRIPTIONS}/${id}`,
  VERIFY: (id: string) => `${BASE_ENDPOINTS.PRESCRIPTIONS}/${id}/verify`,
  REFILL_REQUEST: (id: string) => `${BASE_ENDPOINTS.PRESCRIPTIONS}/${id}/refill`,
  REFILL_LIST: (id: string) => `${BASE_ENDPOINTS.PRESCRIPTIONS}/${id}/refills`,
  SEND_TO_PHARMACY: (id: string) => `${BASE_ENDPOINTS.PRESCRIPTIONS}/${id}/send`,
  PATIENT_PRESCRIPTIONS: (patientId: string) => `${BASE_ENDPOINTS.PRESCRIPTIONS}/patient/${patientId}`,
  EHR: (patientId: string) => `${BASE_ENDPOINTS.PRESCRIPTIONS}/ehr/${patientId}`,
} as const;

// Pharmacy Endpoints
export const PHARMACY_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.PHARMACIES,
  GET: (id: string) => `${BASE_ENDPOINTS.PHARMACIES}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.PHARMACIES}/${id}`,
  SEARCH: `${BASE_ENDPOINTS.PHARMACIES}/search`,
  VERIFY: (id: string) => `${BASE_ENDPOINTS.PHARMACIES}/${id}/verify`,
  HOURS: (id: string) => `${BASE_ENDPOINTS.PHARMACIES}/${id}/hours`,
  INVENTORY: (id: string) => `${BASE_ENDPOINTS.PHARMACIES}/${id}/inventory`,
  STOCK_UPDATE: (id: string) => `${BASE_ENDPOINTS.PHARMACIES}/${id}/inventory/update`,
} as const;

// Medicine Endpoints
export const MEDICINE_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.MEDICINES,
  GET: (id: string) => `${BASE_ENDPOINTS.MEDICINES}/${id}`,
  CREATE: BASE_ENDPOINTS.MEDICINES,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.MEDICINES}/${id}`,
  DELETE: (id: string) => `${BASE_ENDPOINTS.MEDICINES}/${id}`,
  SEARCH: `${BASE_ENDPOINTS.MEDICINES}/search`,
  CATEGORIES: `${BASE_ENDPOINTS.MEDICINES}/categories`,
  POPULAR: `${BASE_ENDPOINTS.MEDICINES}/popular`,
  NEARBY: `${BASE_ENDPOINTS.MEDICINES}/nearby`,
} as const;

// Order Endpoints
export const ORDER_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.ORDERS,
  CREATE: BASE_ENDPOINTS.ORDERS,
  GET: (id: string) => `${BASE_ENDPOINTS.ORDERS}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.ORDERS}/${id}`,
  CANCEL: (id: string) => `${BASE_ENDPOINTS.ORDERS}/${id}/cancel`,
  STATUS: (id: string) => `${BASE_ENDPOINTS.ORDERS}/${id}/status`,
  TRACK: (id: string) => `${BASE_ENDPOINTS.ORDERS}/${id}/track`,
  SEARCH: `${BASE_ENDPOINTS.ORDERS}/search`,
  PATIENT_ORDERS: (patientId: string) => `${BASE_ENDPOINTS.ORDERS}/patient/${patientId}`,
  PHARMACY_ORDERS: (pharmacyId: string) => `${BASE_ENDPOINTS.ORDERS}/pharmacy/${pharmacyId}`,
} as const;

// Delivery Endpoints
export const DELIVERY_ENDPOINTS = {
  GET: (id: string) => `${BASE_ENDPOINTS.DELIVERY}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.DELIVERY}/${id}`,
  TRACK: (id: string) => `${BASE_ENDPOINTS.DELIVERY}/${id}/track`,
  ASSIGN_DRIVER: (id: string) => `${BASE_ENDPOINTS.DELIVERY}/${id}/assign`,
  CURRENT_LOCATION: (id: string) => `${BASE_ENDPOINTS.DELIVERY}/${id}/location`,
} as const;

// Insurance Endpoints
export const INSURANCE_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.INSURANCE,
  GET: (id: string) => `${BASE_ENDPOINTS.INSURANCE}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.INSURANCE}/${id}`,
  POLICIES: `${BASE_ENDPOINTS.POLICIES}`,
  POLICY_GET: (id: string) => `${BASE_ENDPOINTS.POLICIES}/${id}`,
  POLICY_CREATE: `${BASE_ENDPOINTS.POLICIES}`,
  COVERAGE_CHECK: `${BASE_ENDPOINTS.INSURANCE}/coverage-check`,
  PROVIDERS: `${BASE_ENDPOINTS.INSURANCE}/providers`,
} as const;

// Claim Endpoints
export const CLAIM_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.CLAIMS,
  CREATE: BASE_ENDPOINTS.CLAIMS,
  GET: (id: string) => `${BASE_ENDPOINTS.CLAIMS}/${id}`,
  UPDATE: (id: string) => `${BASE_ENDPOINTS.CLAIMS}/${id}`,
  APPEAL: (id: string) => `${BASE_ENDPOINTS.CLAIMS}/${id}/appeal`,
  SUBMIT: `${BASE_ENDPOINTS.CLAIMS}/submit`,
  SEARCH: `${BASE_ENDPOINTS.CLAIMS}/search`,
  PATIENT_CLAIMS: (patientId: string) => `${BASE_ENDPOINTS.CLAIMS}/patient/${patientId}`,
  POLICY_CLAIMS: (policyId: string) => `${BASE_ENDPOINTS.CLAIMS}/policy/${policyId}`,
  PRE_AUTH: `${BASE_ENDPOINTS.CLAIMS}/pre-auth`,
  PRE_AUTH_GET: (id: string) => `${BASE_ENDPOINTS.CLAIMS}/pre-auth/${id}`,
} as const;

// Wallet Endpoints
export const WALLET_ENDPOINTS = {
  GET: BASE_ENDPOINTS.WALLET,
  TOPUP: `${BASE_ENDPOINTS.WALLET}/topup`,
  WITHDRAW: `${BASE_ENDPOINTS.WALLET}/withdraw`,
  TRANSACTIONS: `${BASE_ENDPOINTS.WALLET}/transactions`,
  TRANSACTION_GET: (id: string) => `${BASE_ENDPOINTS.WALLET}/transactions/${id}`,
  VIRTUAL_CARD: `${BASE_ENDPOINTS.WALLET}/virtual-card`,
  VIRTUAL_CARD_GET: (id: string) => `${BASE_ENDPOINTS.WALLET}/virtual-card/${id}`,
  VIRTUAL_CARD_BLOCK: (id: string) => `${BASE_ENDPOINTS.WALLET}/virtual-card/${id}/block`,
} as const;

// Payment Endpoints
export const PAYMENT_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.PAYMENTS,
  GET: (id: string) => `${BASE_ENDPOINTS.PAYMENTS}/${id}`,
  CREATE_INTENT: `${BASE_ENDPOINTS.PAYMENTS}/intent`,
  CONFIRM: `${BASE_ENDPOINTS.PAYMENTS}/confirm`,
  REFUND: `${BASE_ENDPOINTS.PAYMENTS}/refund`,
  METHODS: `${BASE_ENDPOINTS.PAYMENTS}/methods`,
  METHODS_ADD: `${BASE_ENDPOINTS.PAYMENTS}/methods`,
  METHODS_DELETE: (id: string) => `${BASE_ENDPOINTS.PAYMENTS}/methods/${id}`,
  METHODS_SET_DEFAULT: (id: string) => `${BASE_ENDPOINTS.PAYMENTS}/methods/${id}/default`,
  WEBHOOK: `${BASE_ENDPOINTS.PAYMENTS}/webhook`,
} as const;

// Notification Endpoints
export const NOTIFICATION_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.NOTIFICATIONS,
  GET: (id: string) => `${BASE_ENDPOINTS.NOTIFICATIONS}/${id}`,
  READ: (id: string) => `${BASE_ENDPOINTS.NOTIFICATIONS}/${id}/read`,
  READ_ALL: `${BASE_ENDPOINTS.NOTIFICATIONS}/read-all`,
  ARCHIVE: (id: string) => `${BASE_ENDPOINTS.NOTIFICATIONS}/${id}/archive`,
  DELETE: (id: string) => `${BASE_ENDPOINTS.NOTIFICATIONS}/${id}`,
  PREFERENCES: `${BASE_ENDPOINTS.NOTIFICATIONS}/preferences`,
  PREFERENCES_UPDATE: `${BASE_ENDPOINTS.NOTIFICATIONS}/preferences`,
  DEVICE_TOKENS: `${BASE_ENDPOINTS.NOTIFICATIONS}/device-tokens`,
  DEVICE_TOKENS_ADD: `${BASE_ENDPOINTS.NOTIFICATIONS}/device-tokens`,
  DEVICE_TOKENS_REMOVE: `${BASE_ENDPOINTS.NOTIFICATIONS}/device-tokens/remove`,
  SEND: `${BASE_ENDPOINTS.NOTIFICATIONS}/send`,
  SEND_BULK: `${BASE_ENDPOINTS.NOTIFICATIONS}/send-bulk`,
  SCHEDULE: `${BASE_ENDPOINTS.NOTIFICATIONS}/schedule`,
  SCHEDULE_CANCEL: (id: string) => `${BASE_ENDPOINTS.NOTIFICATIONS}/schedule/${id}`,
  TEMPLATES: `${BASE_ENDPOINTS.NOTIFICATIONS}/templates`,
  UNREAD_COUNT: `${BASE_ENDPOINTS.NOTIFICATIONS}/unread-count`,
} as const;

// Settings Endpoints
export const SETTINGS_ENDPOINTS = {
  GET: BASE_ENDPOINTS.SETTINGS,
  UPDATE: BASE_ENDPOINTS.SETTINGS,
  CATEGORIES: `${BASE_ENDPOINTS.SETTINGS}/categories`,
  CATEGORY_GET: (category: string) => `${BASE_ENDPOINTS.SETTINGS}/categories/${category}`,
} as const;

// Report Endpoints
export const REPORT_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.REPORTS,
  GET: (id: string) => `${BASE_ENDPOINTS.REPORTS}/${id}`,
  GENERATE: BASE_ENDPOINTS.REPORTS,
  DOWNLOAD: (id: string) => `${BASE_ENDPOINTS.REPORTS}/${id}/download`,
  TYPES: `${BASE_ENDPOINTS.REPORTS}/types`,
} as const;

// Audit Endpoints
export const AUDIT_ENDPOINTS = {
  LIST: BASE_ENDPOINTS.AUDIT,
  GET: (id: string) => `${BASE_ENDPOINTS.AUDIT}/${id}`,
  SEARCH: `${BASE_ENDPOINTS.AUDIT}/search`,
  EXPORT: `${BASE_ENDPOINTS.AUDIT}/export`,
} as const;

// Export all endpoints
export const ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USERS: USER_ENDPOINTS,
  PROFILE: PROFILE_ENDPOINTS,
  APPOINTMENTS: APPOINTMENT_ENDPOINTS,
  DOCTORS: DOCTOR_ENDPOINTS,
  SCHEDULE: SCHEDULE_ENDPOINTS,
  REVIEWS: REVIEW_ENDPOINTS,
  CONSULTATIONS: CONSULTATION_ENDPOINTS,
  PRESCRIPTIONS: PRESCRIPTION_ENDPOINTS,
  PHARMACIES: PHARMACY_ENDPOINTS,
  MEDICINES: MEDICINE_ENDPOINTS,
  ORDERS: ORDER_ENDPOINTS,
  DELIVERY: DELIVERY_ENDPOINTS,
  INSURANCE: INSURANCE_ENDPOINTS,
  CLAIMS: CLAIM_ENDPOINTS,
  WALLET: WALLET_ENDPOINTS,
  PAYMENTS: PAYMENT_ENDPOINTS,
  NOTIFICATIONS: NOTIFICATION_ENDPOINTS,
  SETTINGS: SETTINGS_ENDPOINTS,
  REPORTS: REPORT_ENDPOINTS,
  AUDIT: AUDIT_ENDPOINTS,
} as const;

export type Endpoints = typeof ENDPOINTS;
