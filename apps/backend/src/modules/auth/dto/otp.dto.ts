import { z } from 'zod';

export const OtpDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  type: z.enum(['ENABLE_2FA', 'DISABLE_2FA', 'LOGIN_VERIFICATION', 'PASSWORD_RESET']),
});

export type OtpDto = z.infer<typeof OtpDtoSchema>;

export const VerifyOtpDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'OTP must be 6 digits'),
  type: z.enum(['ENABLE_2FA', 'DISABLE_2FA', 'LOGIN_VERIFICATION', 'PASSWORD_RESET']),
});

export type VerifyOtpDto = z.infer<typeof VerifyOtpDtoSchema>;
