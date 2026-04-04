import { z } from 'zod';

export const medicineSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  genericName: z.string().min(2, 'Generic name must be at least 2 characters'),
  manufacturer: z.string().min(2, 'Manufacturer is required'),
  category: z.string().min(1, 'Category is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  form: z.enum([
    'tablet',
    'capsule',
    'syrup',
    'injection',
    'cream',
    'ointment',
    'drops',
    'inhaler',
    'patch',
    'suppository',
    'powder',
    'solution',
    'suspension',
    'gel',
    'spray',
    'other',
  ]),
  strength: z.string().min(1, 'Strength is required'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  minStock: z.number().int().min(0, 'Minimum stock cannot be negative'),
  maxStock: z.number().int().min(1, 'Maximum stock must be at least 1'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  prescriptionRequired: z.boolean(),
  insuranceCoverage: z.number().int().min(0).max(100),
  requiresColdStorage: z.boolean(),
  barcode: z.string().optional(),
  manufacturerCode: z.string().optional(),
  description: z.string().optional(),
  sideEffects: z.string().optional(),
  contraindications: z.string().optional(),
});

export const orderSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  patientPhone: z.string().min(10, 'Valid phone number is required'),
  doctorId: z.string().optional(),
  doctorName: z.string().optional(),
  items: z
    .array(
      z.object({
        medicineId: z.string().min(1, 'Medicine is required'),
        medicineName: z.string().min(1),
        quantity: z.number().int().positive('Quantity must be positive'),
        unitPrice: z.number().positive(),
        discount: z.number().min(0).default(0),
        instructions: z.string().optional(),
      })
    )
    .min(1, 'At least one item is required'),
  deliveryAddress: z
    .object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1),
      instructions: z.string().optional(),
    })
    .optional(),
  deliveryFee: z.number().min(0).default(0),
  priority: z.enum(['normal', 'urgent']).default('normal'),
  notes: z.string().optional(),
});

export const stockUpdateSchema = z.object({
  quantity: z.number().int('Quantity must be a whole number'),
  reason: z.string().min(1, 'Reason is required'),
  reference: z.string().optional(),
});

export const claimProcessSchema = z.object({
  status: z.enum(['submitted', 'approved', 'rejected', 'appealed']),
  rejectionReason: z.string().optional(),
  appealReason: z.string().optional(),
});

export const staffSchema = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['admin', 'pharmacist', 'cashier', 'delivery', 'viewer']),
  phone: z.string().optional(),
});

export const pharmacySchema = z.object({
  name: z.string().min(2, 'Pharmacy name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  is24Hours: z.boolean().default(false),
});

export type MedicineInput = z.infer<typeof medicineSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type StockUpdateInput = z.infer<typeof stockUpdateSchema>;
export type ClaimProcessInput = z.infer<typeof claimProcessSchema>;
export type StaffInput = z.infer<typeof staffSchema>;
export type PharmacyInput = z.infer<typeof pharmacySchema>;
