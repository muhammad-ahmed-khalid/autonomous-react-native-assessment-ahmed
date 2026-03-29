import { useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import { useSubscription } from '@/hooks/useSubscription';
import { UseSubscriptionTabContainerReturn } from './types';

export function useSubscriptionTabContainer(): UseSubscriptionTabContainerReturn {
  const {
    currentSubscription,
    loading,
    initialize,
    formattedNextBillingDate,
    trialDaysRemaining,
  } = useSubscription();

  const hasActiveSubscription = useMemo(() => 
    currentSubscription && currentSubscription.status !== 'none',
    [currentSubscription]
  );

  const isTrialActive = useMemo(() => 
    currentSubscription?.status === 'trial',
    [currentSubscription]
  );

  const handleViewDetails = useCallback(() => {
    router.push('/subscription/detail');
  }, []);

  const handleViewPlans = useCallback(() => {
    router.push('/subscription/plans');
  }, []);

  const handleUpgrade = useCallback(() => {
    router.push('/subscription/plans?type=upgrade');
  }, []);

  return {
    // Subscription Hook
    currentSubscription,
    loading,
    initialize,
    formattedNextBillingDate: formattedNextBillingDate as () => string | null,
    trialDaysRemaining,
    
    // Computed State
    hasActiveSubscription: hasActiveSubscription as boolean | null,
    isTrialActive,
    
    // Handlers
    handleViewDetails,
    handleViewPlans,
    handleUpgrade,
  };
}