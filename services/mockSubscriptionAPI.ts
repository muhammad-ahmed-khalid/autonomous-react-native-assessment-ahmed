/**
 * Mock Subscription API Service
 * Simulates backend API calls for subscription management
 */

import type {
  ActiveSubscription,
  SubscriptionPlan,
  BillingHistoryItem,
  PaymentDetails,
  ProrationPreview,
  BillingCycle,
} from '@/types/subscription';

/**
 * Mock delay to simulate network latency
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock subscription plans data
 */
const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_free',
    tier: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'USD',
    features: [
      { id: 'f1', name: 'Up to 5 apps', included: true },
      { id: 'f2', name: 'Basic analytics', included: true },
      { id: 'f3', name: 'Email support', included: false },
      { id: 'f4', name: 'Advanced features', included: false },
      { id: 'f5', name: 'Priority support', included: false },
      { id: 'f6', name: 'Custom branding', included: false },
    ],
    limitations: ['Limited to 5 apps', 'Basic features only'],
  },
  {
    id: 'plan_basic',
    tier: 'basic',
    name: 'Basic',
    description: 'Ideal for small teams',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    currency: 'USD',
    features: [
      { id: 'f1', name: 'Up to 20 apps', included: true },
      { id: 'f2', name: 'Advanced analytics', included: true },
      { id: 'f3', name: 'Email support', included: true },
      { id: 'f4', name: 'Advanced features', included: false },
      { id: 'f5', name: 'Priority support', included: false },
      { id: 'f6', name: 'Custom branding', included: false },
    ],
  },
  {
    id: 'plan_pro',
    tier: 'pro',
    name: 'Pro',
    description: 'Best for growing businesses',
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    currency: 'USD',
    popular: true,
    features: [
      { id: 'f1', name: 'Unlimited apps', included: true },
      { id: 'f2', name: 'Advanced analytics', included: true },
      { id: 'f3', name: 'Priority email support', included: true },
      { id: 'f4', name: 'Advanced features', included: true },
      { id: 'f5', name: 'Priority support', included: true },
      { id: 'f6', name: 'Custom branding', included: false },
    ],
  },
  {
    id: 'plan_premium',
    tier: 'premium',
    name: 'Premium',
    description: 'Enterprise-grade solution',
    monthlyPrice: 99.99,
    yearlyPrice: 999.99,
    currency: 'USD',
    features: [
      { id: 'f1', name: 'Unlimited apps', included: true },
      { id: 'f2', name: 'Advanced analytics', included: true },
      { id: 'f3', name: '24/7 phone support', included: true },
      { id: 'f4', name: 'Advanced features', included: true },
      { id: 'f5', name: 'Dedicated support', included: true },
      { id: 'f6', name: 'Custom branding', included: true },
    ],
  },
];

/**
 * Mock current subscription (stored in memory for demo)
 */
let mockCurrentSubscription: ActiveSubscription | null = {
  id: 'sub_123456',
  userId: 'user_1',
  planId: 'plan_pro',
  plan: MOCK_PLANS[2], // Pro plan
  status: 'active',
  billingCycle: 'monthly',
  currentPeriodStart: '2026-03-01T00:00:00Z',
  currentPeriodEnd: '2026-04-01T00:00:00Z',
  nextBillingDate: '2026-04-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
};

/**
 * Mock billing history
 */
const MOCK_BILLING_HISTORY: BillingHistoryItem[] = [
  {
    id: 'inv_001',
    date: '2026-03-01T00:00:00Z',
    amount: 29.99,
    currency: 'USD',
    description: 'Pro Plan - Monthly',
    status: 'paid',
    plan: 'Pro',
    billingCycle: 'monthly',
  },
  {
    id: 'inv_002',
    date: '2026-02-01T00:00:00Z',
    amount: 29.99,
    currency: 'USD',
    description: 'Pro Plan - Monthly',
    status: 'paid',
    plan: 'Pro',
    billingCycle: 'monthly',
  },
  {
    id: 'inv_003',
    date: '2026-01-15T00:00:00Z',
    amount: 29.99,
    currency: 'USD',
    description: 'Pro Plan - Monthly (First payment)',
    status: 'paid',
    plan: 'Pro',
    billingCycle: 'monthly',
  },
];

/**
 * Mock API Service
 */
export class MockSubscriptionAPI {
  /**
   * Get current subscription
   */
  async getCurrentSubscription(): Promise<ActiveSubscription | null> {
    await delay(800);
    return mockCurrentSubscription;
  }

  /**
   * Get all available plans
   */
  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    await delay(500);
    return MOCK_PLANS;
  }

  /**
   * Get billing history
   */
  async getBillingHistory(): Promise<BillingHistoryItem[]> {
    await delay(600);
    return MOCK_BILLING_HISTORY;
  }

  /**
   * Change subscription plan
   */
  async changePlan(newPlanId: string, billingCycle: BillingCycle): Promise<ActiveSubscription> {
    await delay(1200);

    const newPlan = MOCK_PLANS.find((p) => p.id === newPlanId);
    if (!newPlan) {
      throw new Error('Plan not found');
    }

    const now = new Date();
    const nextBilling = new Date(now);
    nextBilling.setMonth(nextBilling.getMonth() + (billingCycle === 'monthly' ? 1 : 12));

    mockCurrentSubscription = {
      id: mockCurrentSubscription?.id || 'sub_new',
      userId: 'user_1',
      planId: newPlanId,
      plan: newPlan,
      status: 'active',
      billingCycle,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: nextBilling.toISOString(),
      nextBillingDate: nextBilling.toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: mockCurrentSubscription?.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
    };

    return mockCurrentSubscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<ActiveSubscription> {
    await delay(1000);

    if (!mockCurrentSubscription) {
      throw new Error('No active subscription');
    }

    mockCurrentSubscription = {
      ...mockCurrentSubscription,
      status: 'cancelled',
      cancelAtPeriodEnd: true,
      updatedAt: new Date().toISOString(),
    };

    return mockCurrentSubscription;
  }

  /**
   * Process payment
   */
  async processPayment(
    planId: string,
    billingCycle: BillingCycle,
    paymentDetails: PaymentDetails
  ): Promise<ActiveSubscription> {
    await delay(2000);

    // Simulate payment failure for specific card number
    if (paymentDetails.cardNumber === '4000000000000002') {
      throw new Error('Payment declined. Please check your card details.');
    }

    // Simulate payment processing
    const plan = MOCK_PLANS.find((p) => p.id === planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const now = new Date();
    const nextBilling = new Date(now);
    nextBilling.setMonth(nextBilling.getMonth() + (billingCycle === 'monthly' ? 1 : 12));

    mockCurrentSubscription = {
      id: 'sub_' + Date.now(),
      userId: 'user_1',
      planId,
      plan,
      status: 'active',
      billingCycle,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: nextBilling.toISOString(),
      nextBillingDate: nextBilling.toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    return mockCurrentSubscription;
  }

  /**
   * Get proration preview
   */
  async getProrationPreview(newPlanId: string, billingCycle: BillingCycle): Promise<ProrationPreview> {
    await delay(500);

    const currentSub = mockCurrentSubscription;
    if (!currentSub) {
      throw new Error('No active subscription');
    }

    const newPlan = MOCK_PLANS.find((p) => p.id === newPlanId);
    if (!newPlan) {
      throw new Error('Plan not found');
    }

    const currentPrice =
      currentSub.billingCycle === 'monthly' ? currentSub.plan.monthlyPrice : currentSub.plan.yearlyPrice;
    const newPrice = billingCycle === 'monthly' ? newPlan.monthlyPrice : newPlan.yearlyPrice;

    // Calculate proration (simplified)
    const daysInPeriod = 30;
    const daysRemaining = 15; // Mock
    const credit = (currentPrice / daysInPeriod) * daysRemaining;
    const charge = newPrice;
    const net = charge - credit;

    const now = new Date();
    const nextBilling = new Date(now);
    nextBilling.setMonth(nextBilling.getMonth() + (billingCycle === 'monthly' ? 1 : 12));

    return {
      creditAmount: Math.max(0, credit),
      chargeAmount: charge,
      netAmount: Math.max(0, net),
      effectiveDate: now.toISOString(),
      newBillingDate: nextBilling.toISOString(),
    };
  }
}

export const mockSubscriptionAPI = new MockSubscriptionAPI();
