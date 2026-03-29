export interface UseSubscriptionTabContainerReturn {
  // Subscription Hook
  currentSubscription: any;
  loading: boolean;
  initialize: () => void;
  formattedNextBillingDate: () => string | null;
  trialDaysRemaining: () => number | null;
  
  // Computed State
  hasActiveSubscription: boolean | null;
  isTrialActive: boolean;
  
  // Handlers
  handleViewDetails: () => void;
  handleViewPlans: () => void;
  handleUpgrade: () => void;
}
