// Common Validators

import { z } from 'zod';

export const IdSchema = z.object({
  id: z.string({
    required_error: 'ID is required',
    invalid_type_error: 'ID must be a string',
  }),
});

export const IdsSchema = z.object({
  ids: z
    .array(
      z.string({
        required_error: 'ID is required',
        invalid_type_error: 'ID must be a string',
      })
    )
    .min(1, 'At least one ID is required'),
});

export const PaginationSchema = z.object({
  page: z
    .number()
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be less than 100')
    .default(20),
});

export const DateRangeSchema = z
  .object({
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: 'dateFrom must be before or equal to dateTo',
      path: ['dateFrom'],
    }
  );

export const DateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const TimeSchema = z.object({
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format (24-hour)'),
});

export const DateTimeSchema = z.object({
  datetime: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, 'Datetime must be in ISO 8601 format'),
});

export const EmailSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email address'),
});

export const PhoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 digits')
    .regex(/^[+]?[0-9]+$/, 'Invalid phone number format'),
});

export const SearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(200, 'Search query must be less than 200 characters'),
  page: z
    .number()
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be less than 100')
    .default(20),
});

export const StatusEnumSchema = z.object({
  status: z.string().min(1, 'Status is required'),
});

export const SortSchema = z.object({
  sortBy: z.string().min(1, 'Sort by field is required'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const FilterSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'contains']),
  value: z.unknown(),
});

export const AddressSchema = z.object({
  street: z
    .string()
    .max(200, 'Street must be less than 200 characters')
    .optional(),
  city: z
    .string()
    .max(100, 'City must be less than 100 characters')
    .optional(),
  state: z
    .string()
    .max(100, 'State must be less than 100 characters')
    .optional(),
  postalCode: z
    .string()
    .max(20, 'Postal code must be less than 20 characters')
    .optional(),
  country: z
    .string()
    .max(100, 'Country must be less than 100 characters')
    .optional(),
});

export const BooleanSchema = z.object({
  value: z.boolean(),
});

export const EmptySchema = z.object({});

export type IdInput = z.infer<typeof IdSchema>;
export type IdsInput = z.infer<typeof IdsSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type DateRangeInput = z.infer<typeof DateRangeSchema>;
export type DateInput = z.infer<typeof DateSchema>;
export type TimeInput = z.infer<typeof TimeSchema>;
export type DateTimeInput = z.infer<typeof DateTimeSchema>;
export type EmailInput = z.infer<typeof EmailSchema>;
export type PhoneInput = z.infer<typeof PhoneSchema>;
export type SearchInput = z.infer<typeof SearchSchema>;
export type SortInput = z.infer<typeof SortSchema>;
export type FilterInput = z.infer<typeof FilterSchema>;
export type AddressInput = z.infer<typeof AddressSchema>;
