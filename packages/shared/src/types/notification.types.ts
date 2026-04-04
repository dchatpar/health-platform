// Notification Types

export type NotificationType =
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'PRESCRIPTION_READY'
  | 'PRESCRIPTION_REFILL'
  | 'ORDER_STATUS_UPDATE'
  | 'DELIVERY_UPDATE'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'REFUND_ISSUED'
  | 'INSURANCE_CLAIM_UPDATE'
  | 'INSURANCE_CLAIM_APPROVED'
  | 'INSURANCE_CLAIM_DENIED'
  | 'LAB_RESULTS_READY'
  | 'MESSAGE_RECEIVED'
  | 'VIDEO_CALL_STARTING'
  | 'REVIEW_REQUEST'
  | 'PROMOTION'
  | 'SYSTEM';

export type NotificationChannel = 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  channels: NotificationChannel[];
  readAt?: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
}

export interface NotificationData {
  appointmentId?: string;
  orderId?: string;
  prescriptionId?: string;
  claimId?: string;
  doctorId?: string;
  patientId?: string;
  pharmacyId?: string;
  messageId?: string;
  actionUrl?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

export interface SendNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  channels?: NotificationChannel[];
}

export interface SendBulkNotificationInput {
  userIds: string[];
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  channels?: NotificationChannel[];
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    [key in NotificationType]?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      inApp?: boolean;
    };
  };
}

export interface UpdateNotificationPreferencesInput {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  inApp?: boolean;
  types?: NotificationPreferences['types'];
}

export interface NotificationSearchInput {
  userId?: string;
  type?: NotificationType;
  read?: boolean;
  archived?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: NotificationData;
  badge?: number;
  sound?: string;
  icon?: string;
  clickAction?: string;
}

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: {
    filename: string;
    url: string;
    type: string;
  }[];
}

export interface SmsNotificationPayload {
  to: string;
  message: string;
}

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  type: 'IOS' | 'ANDROID' | 'WEB';
  deviceId?: string;
  deviceName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddDeviceTokenInput {
  token: string;
  type: 'IOS' | 'ANDROID' | 'WEB';
  deviceId?: string;
  deviceName?: string;
}

export interface RemoveDeviceTokenInput {
  token: string;
}

export interface NotificationBadge {
  userId: string;
  count: number;
  lastUpdated: string;
}

export interface ScheduledNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  scheduledFor: string;
  status: 'PENDING' | 'SENT' | 'CANCELLED' | 'FAILED';
  sentAt?: string;
  createdAt: string;
}

export interface CreateScheduledNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  scheduledFor: string;
}

export interface CancelScheduledNotificationInput {
  notificationId: string;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  titleTemplate: string;
  bodyTemplate: string;
  channels: NotificationChannel[];
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationTemplateInput {
  type: NotificationType;
  titleTemplate: string;
  bodyTemplate: string;
  channels: NotificationChannel[];
  variables: string[];
}
