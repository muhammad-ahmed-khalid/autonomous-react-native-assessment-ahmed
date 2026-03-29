/**
 * useSubscription Hook
 * Custom hook for managing subscription state and actions
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchSubscription,
  fetchPlans,
  fetchBillingHistory,
  changePlan,
  cancelSubscription,
  getProrationPreview,
  clearError,
  clearProrationPreview,
} from '@/store/slices/subscriptionSlice';
import type { BillingCycle } from '@/types/subscription';

export const useSubscription = () => {
  const dispatch = useAppDispatch();
  const {
    currentSubscription,
    availablePlans,
    billingHistory,
    loading,
    error,
    prorationPreview,
  } = useAppSelector((state) => state.subscription);

  /**
   * Initialize subscription data
   */
  const initialize = useCallback(() => {
    dispatch(fetchSubscription());
    dispatch(fetchPlans());
  }, [dispatch]);

  /**
   * Refresh subscription data
   */
  const refresh = useCallback(() => {
    dispatch(fetchSubscription());
  }, [dispatch]);

  /**
   * Load billing history
   */
  const loadBillingHistory = useCallback(() => {
    dispatch(fetchBillingHistory());
  }, [dispatch]);

  /**
   * Change subscription plan
   */
  const handleChangePlan = useCallback(
    async (newPlanId: string, billingCycle: BillingCycle) => {
      const result = await dispatch(changePlan({ newPlanId, billingCycle }));
      return result.meta.requestStatus === 'fulfilled';
    },
    [dispatch]
  );

  /**
   * Cancel current subscription
   */
  const handleCancelSubscription = useCallback(async () => {
    const result = await dispatch(cancelSubscription());
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  /**
   * Get proration preview for plan change
   */
  const loadProrationPreview = useCallback(
    async (newPlanId: string, billingCycle: BillingCycle) => {
      await dispatch(getProrationPreview({ newPlanId, billingCycle }));
    },
    [dispatch]
  );

  /**
   * Clear error state
   */
  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Clear proration preview
   */
  const dismissProrationPreview = useCallback(() => {
    dispatch(clearProrationPreview());
  }, [dispatch]);

  /**
   * Get plan by ID
   */
  const getPlanById = useCallback(
    (planId: string) => {
      return availablePlans.find((plan) => plan.id === planId);
    },
    [availablePlans]
  );

  /**
   * Check if a plan is an upgrade
   */
  const isUpgrade = useCallback(
    (planId: string) => {
      if (!currentSubscription) return true;

      const planTiers = ['free', 'basic', 'pro', 'premium'];
      const currentIndex = planTiers.indexOf(currentSubscription.plan.tier);
      const newPlan = getPlanById(planId);

      if (!newPlan) return false;

      const newIndex = planTiers.indexOf(newPlan.tier);
      return newIndex > currentIndex;
    },
    [currentSubscription, getPlanById]
  );

  /**
   * Check if a plan is a downgrade
   */
  const isDowngrade = useCallback(
    (planId: string) => {
      if (!currentSubscription) return false;

      const planTiers = ['free', 'basic', 'pro', 'premium'];
      const currentIndex = planTiers.indexOf(currentSubscription.plan.tier);
      const newPlan = getPlanById(planId);

      if (!newPlan) return false;

      const newIndex = planTiers.indexOf(newPlan.tier);
      return newIndex < currentIndex;
    },
    [currentSubscription, getPlanById]
  );

  /**
   * Get formatted next billing date
   */
  const formattedNextBillingDate = useCallback(() => {
    if (!currentSubscription) return null;

    const date = new Date(currentSubscription.nextBillingDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [currentSubscription]);

  /**
   * Calculate days remaining in trial
   */
  const trialDaysRemaining = useCallback(() => {
    if (!currentSubscription?.trialEnd) return null;

    const trialEnd = new Date(currentSubscription.trialEnd);
    const now = new Date();
    const diff = trialEnd.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  }, [currentSubscription]);

  return {
    // State
    currentSubscription,
    availablePlans,
    billingHistory,
    loading,
    error,
    prorationPreview,

    // Actions
    initialize,
    refresh,
    loadBillingHistory,
    changePlan: handleChangePlan,
    cancelSubscription: handleCancelSubscription,
    loadProrationPreview,
    dismissError,
    dismissProrationPreview,

    // Helpers
    getPlanById,
    isUpgrade,
    isDowngrade,
    formattedNextBillingDate,
    trialDaysRemaining,
  };
};
