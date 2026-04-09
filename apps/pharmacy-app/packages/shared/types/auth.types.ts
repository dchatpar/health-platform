// Auth Types

import type { User } from './user.types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface LoginInput {
  email: string;
  password: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: 'IOS' | 'ANDROID' | 'WEB' | 'DESKTOP';
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'PATIENT' | 'DOCTOR' | 'PHARMACY';
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

export interface OtpInput {
  email: string;
  otp: string;
  purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'PHONE_VERIFICATION' | '2FA';
}

export interface OtpResponse {
  verified: boolean;
  message: string;
}

export interface SendOtpInput {
  email?: string;
  phone?: string;
  purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'PHONE_VERIFICATION' | '2FA';
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
}

export interface PasswordResetInput {
  email?: string;
  token?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface LogoutInput {
  refreshToken?: string;
  allDevices?: boolean;
}

export interface AuthSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceName?: string;
  deviceType?: 'IOS' | 'ANDROID' | 'WEB' | 'DESKTOP';
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  tokens?: AuthTokens;
}

export interface SocialAuthInput {
  provider: 'GOOGLE' | 'APPLE' | 'FACEBOOK';
  token: string;
  deviceId?: string;
  deviceName?: string;
}

export interface SocialAuthResponse {
  user: User;
  tokens: AuthTokens;
  isNewUser: boolean;
}
