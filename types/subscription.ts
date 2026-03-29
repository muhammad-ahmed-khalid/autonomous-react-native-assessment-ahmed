/**
 * Subscription Types
 * Type definitions for subscription management system
 */

export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial' | 'none';
export type PlanTier = 'free' | 'basic' | 'pro' | 'premium';

export interface SubscriptionFeature {
  id: string;
  name: string;
  description?: string;
  included: boolean;
  limit?: number | string;
}

export interface SubscriptionPlan {
  id: string;
  tier: PlanTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: SubscriptionFeature[];
  popular?: boolean;
  limitations?: string[];
}

export interface ActiveSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface PaymentDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  cardholderName: string;
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  status: 'paid' | 'failed' | 'pending' | 'refunded';
  invoiceUrl?: string;
  plan: string;
  billingCycle: BillingCycle;
}

export interface ProrationPreview {
  creditAmount: number;
  chargeAmount: number;
  netAmount: number;
  effectiveDate: string;
  newBillingDate: string;
}

export interface SubscriptionState {
  currentSubscription: ActiveSubscription | null;
  availablePlans: SubscriptionPlan[];
  billingHistory: BillingHistoryItem[];
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  prorationPreview: ProrationPreview | null;
}

export interface ChangePlanPayload {
  newPlanId: string;
  billingCycle: BillingCycle;
}

export interface ProcessPaymentPayload {
  planId: string;
  billingCycle: BillingCycle;
  paymentDetails: PaymentDetails;
}
