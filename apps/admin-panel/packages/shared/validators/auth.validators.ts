// Auth Validators

import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email address'),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  deviceType: z.enum(['IOS', 'ANDROID', 'WEB', 'DESKTOP']).optional(),
});

export const RegisterSchema = z
  .object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .email('Invalid email address'),
    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string',
      })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
      invalid_type_error: 'Confirm password must be a string',
    }),
    firstName: z
      .string({
        required_error: 'First name is required',
        invalid_type_error: 'First name must be a string',
      })
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters'),
    lastName: z
      .string({
        required_error: 'Last name is required',
        invalid_type_error: 'Last name must be a string',
      })
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters'),
    phone: z
      .string({
        required_error: 'Phone number is required',
        invalid_type_error: 'Phone number must be a string',
      })
      .min(10, 'Phone number must be at least 10 digits')
      .max(20, 'Phone number must be less than 20 digits')
      .regex(/^[+]?[0-9]+$/, 'Invalid phone number format'),
    role: z.enum(['PATIENT', 'DOCTOR', 'PHARMACY'], {
      required_error: 'Role is required',
      invalid_type_error: 'Role must be PATIENT, DOCTOR, or PHARMACY',
    }),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
      .optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const OtpSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email address'),
  otp: z
    .string({
      required_error: 'OTP is required',
      invalid_type_error: 'OTP must be a string',
    })
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only digits'),
  purpose: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION', '2FA'], {
    required_error: 'Purpose is required',
    invalid_type_error: 'Purpose must be a valid enum value',
  }),
});

export const SendOtpSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 digits')
    .optional(),
  purpose: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION', '2FA'], {
    required_error: 'Purpose is required',
    invalid_type_error: 'Purpose must be a valid enum value',
  }),
});

export const PasswordResetSchema = z
  .object({
    email: z.string().email('Invalid email address').optional(),
    token: z.string().optional(),
    newPassword: z
      .string({
        required_error: 'New password is required',
        invalid_type_error: 'New password must be a string',
      })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
      invalid_type_error: 'Confirm password must be a string',
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string({
      required_error: 'Current password is required',
      invalid_type_error: 'Current password must be a string',
    }),
    newPassword: z
      .string({
        required_error: 'New password is required',
        invalid_type_error: 'New password must be a string',
      })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
      invalid_type_error: 'Confirm password must be a string',
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const RefreshTokenSchema = z.object({
  refreshToken: z.string({
    required_error: 'Refresh token is required',
    invalid_type_error: 'Refresh token must be a string',
  }),
});

export const SocialAuthSchema = z.object({
  provider: z.enum(['GOOGLE', 'APPLE', 'FACEBOOK'], {
    required_error: 'Provider is required',
    invalid_type_error: 'Provider must be GOOGLE, APPLE, or FACEBOOK',
  }),
  token: z.string({
    required_error: 'Token is required',
    invalid_type_error: 'Token must be a string',
  }),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type OtpInput = z.infer<typeof OtpSchema>;
export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type PasswordResetInput = z.infer<typeof PasswordResetSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type SocialAuthInput = z.infer<typeof SocialAuthSchema>;
