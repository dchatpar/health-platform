// Payment Types

import type { Order } from './pharmacy.types';
import type { Claim } from './insurance.types';

export type WalletTransactionType = 'CREDIT' | 'DEBIT';
export type WalletTransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type TransactionPurpose = 'APPOINTMENT_BOOKING' | 'ORDER_PAYMENT' | 'REFUND' | 'WALLET_TOP_UP' | 'CANCELLATION_REFUND' | 'INSURANCE_CLAIM' | 'VIRTUAL_CARD' | 'OTHER';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: WalletTransactionType;
  amount: number;
  balanceAfter: number;
  purpose: TransactionPurpose;
  status: WalletTransactionStatus;
  referenceId?: string;
  referenceType?: 'APPOINTMENT' | 'ORDER' | 'PRESCRIPTION' | 'CLAIM' | 'WALLET' | 'OTHER';
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface TopUpWalletInput {
  amount: number;
  paymentMethod: 'CARD' | 'BANK_TRANSFER' | 'CRYPTO';
  cardId?: string;
}

export interface TopUpWalletResponse {
  transactionId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentUrl?: string;
  paymentReference?: string;
}

export interface WithdrawFromWalletInput {
  amount: number;
  bankAccountId?: string;
}

export interface WithdrawFromWalletResponse {
  transactionId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  estimatedArrival?: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  referenceId?: string;
  referenceType?: 'APPOINTMENT' | 'ORDER' | 'PRESCRIPTION' | 'WALLET' | 'OTHER';
  description?: string;
  metadata?: Record<string, unknown>;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type PaymentMethod = 'WALLET' | 'CARD' | 'BANK_TRANSFER' | 'INSURANCE' | 'CRYPTO' | 'COD';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  clientSecret?: string;
  paymentMethod?: PaymentMethod;
  returnUrl?: string;
}

export interface CreatePaymentIntentInput {
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  referenceId: string;
  referenceType: 'APPOINTMENT' | 'ORDER' | 'PRESCRIPTION' | 'OTHER';
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentMethod_ {
  id: string;
  userId: string;
  type: 'CARD' | 'BANK_ACCOUNT';
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
  // Card specific
  brand?: 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: string;
  cardholderName?: string;
  // Bank account specific
  bankName?: string;
  accountType?: 'CHECKING' | 'SAVINGS';
  routingNumber?: string;
}

export interface AddCardInput {
  token: string;
  isDefault?: boolean;
}

export interface AddBankAccountInput {
  accountNumber: string;
  routingNumber: string;
  accountType: 'CHECKING' | 'SAVINGS';
  isDefault?: boolean;
}

export interface RefundInput {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  refundId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reason?: string;
}

export interface PaymentSearchInput {
  userId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  referenceId?: string;
  referenceType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionSearchInput {
  walletId?: string;
  userId?: string;
  type?: WalletTransactionType;
  purpose?: TransactionPurpose;
  status?: WalletTransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface TransactionListResponse {
  transactions: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentGatewayWebhook {
  event: string;
  data: Record<string, unknown>;
  signature?: string;
  timestamp: string;
}

export interface VirtualCard {
  id: string;
  userId: string;
  walletId: string;
  cardNumber: string;
  cvv: string;
  expiryMonth: number;
  expiryYear: number;
  status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED';
  balance: number;
  limit?: number;
  createdAt: string;
}

export interface CreateVirtualCardInput {
  walletId: string;
  limit?: number;
}

export interface TransactionFee {
  type: 'TOP_UP' | 'WITHDRAW' | 'PAYMENT';
  percentage: number;
  fixed: number;
  minAmount: number;
  maxAmount?: number;
}
