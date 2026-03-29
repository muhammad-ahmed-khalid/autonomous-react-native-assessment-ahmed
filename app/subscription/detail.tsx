/**
 * Subscription Detail Screen
 * Displays current subscription information with management options
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  View as RNView,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { StatusBadge } from '@/components/subscription/StatusBadge';
import { FeatureList } from '@/components/subscription/FeatureList';
import { SubscriptionButton } from '@/components/subscription/SubscriptionButton';
import { SubscriptionDetailSkeleton } from '@/components/subscription/LoadingSkeleton';

export default function SubscriptionDetailScreen() {
  const {
    currentSubscription,
    loading,
    error,
    initialize,
    refresh,
    cancelSubscription,
    dismissError,
    formattedNextBillingDate,
    trialDaysRemaining,
  } = useSubscription();

  const [refreshing, setRefreshing] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: dismissError }]);
    }
  }, [error, dismissError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleUpgradePlan = () => {
    router.push('/subscription/plans?type=upgrade');
  };

  const handleDowngradePlan = () => {
    router.push('/subscription/plans?type=downgrade');
  };

  const handleManageSubscription = () => {
    router.push('/subscription/plans');
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            setCanceling(true);
            const success = await cancelSubscription();
            setCanceling(false);

            if (success) {
              Alert.alert(
                'Subscription Cancelled',
                'Your subscription has been cancelled. You will have access until the end of your billing period.'
              );
            }
          },
        },
      ]
    );
  };

  const handleViewBillingHistory = () => {
    router.push('/subscription/billing-history');
  };

  if (loading && !currentSubscription) {
    return (
      <View style={styles.container}>
        <SubscriptionDetailSkeleton />
      </View>
    );
  }

  const hasActiveSubscription = currentSubscription && currentSubscription.status !== 'none';
  const isTrialActive = currentSubscription?.status === 'trial';
  const isCancelled = currentSubscription?.cancelAtPeriodEnd;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Subscription</Text>
          <Text style={styles.headerSubtitle}>Manage your subscription and billing</Text>
        </View>

        {hasActiveSubscription ? (
          <>
            {/* Current Plan Card */}
            <SubscriptionCard
              title="Current Plan"
              icon="star"
              style={styles.planCard}
            >
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planName}>{currentSubscription.plan.name}</Text>
                  <Text style={styles.planPrice}>
                    ${currentSubscription.billingCycle === 'monthly'
                      ? currentSubscription.plan.monthlyPrice
                      : currentSubscription.plan.yearlyPrice}
                    /{currentSubscription.billingCycle === 'monthly' ? 'month' : 'year'}
                  </Text>
                </View>
                <StatusBadge status={currentSubscription.status} />
              </View>

              {isTrialActive && trialDaysRemaining() !== null && (
                <View style={styles.trialBanner}>
                  <Ionicons name="time-outline" size={20} color="#2196F3" />
                  <Text style={styles.trialText}>
                    {trialDaysRemaining()} days remaining in trial
                  </Text>
                </View>
              )}

              {isCancelled && (
                <View style={styles.warningBanner}>
                  <Ionicons name="warning-outline" size={20} color="#FF9800" />
                  <Text style={styles.warningText}>
                    Subscription will cancel on {formattedNextBillingDate()}
                  </Text>
                </View>
              )}
            </SubscriptionCard>

            {/* Billing Information Card */}
            <SubscriptionCard
              title="Billing Information"
              icon="card-outline"
            >
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Next Billing Date</Text>
                <Text style={styles.infoValue}>{formattedNextBillingDate()}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Billing Cycle</Text>
                <Text style={styles.infoValue}>
                  {currentSubscription.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                </Text>
              </View>

              <TouchableOpacity style={styles.linkButton} onPress={handleViewBillingHistory}>
                <Text style={styles.linkText}>View Billing History</Text>
                <Ionicons name="chevron-forward" size={20} color="#007AFF" />
              </TouchableOpacity>
            </SubscriptionCard>

            {/* Features Card */}
            <SubscriptionCard
              title="Plan Features"
              icon="checkmark-circle-outline"
            >
              <FeatureList features={currentSubscription.plan.features} />
            </SubscriptionCard>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {!isCancelled && (
                <>
                  <SubscriptionButton
                    title="Upgrade Plan"
                    onPress={handleUpgradePlan}
                    variant="primary"
                    icon={<Ionicons name="arrow-up-circle" size={20} color="#fff" />}
                    style={styles.actionButton}
                  />

                  <SubscriptionButton
                    title="Change Plan"
                    onPress={handleManageSubscription}
                    variant="outline"
                    style={styles.actionButton}
                  />

                  <SubscriptionButton
                    title="Cancel Subscription"
                    onPress={handleCancelSubscription}
                    variant="danger"
                    loading={canceling}
                    style={styles.actionButton}
                  />
                </>
              )}

              {isCancelled && (
                <SubscriptionButton
                  title="Resubscribe"
                  onPress={handleManageSubscription}
                  variant="primary"
                  icon={<Ionicons name="refresh-circle" size={20} color="#fff" />}
                />
              )}
            </View>
          </>
        ) : (
          <>
            {/* No Subscription State */}
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={80} color="#CCC" />
              <Text style={styles.emptyTitle}>No Active Subscription</Text>
              <Text style={styles.emptyMessage}>
                Subscribe to unlock premium features and take your experience to the next level.
              </Text>

              <SubscriptionButton
                title="View Plans"
                onPress={handleManageSubscription}
                variant="primary"
                style={styles.emptyButton}
                icon={<Ionicons name="rocket" size={20} color="#fff" />}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  planCard: {
    marginHorizontal: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  trialText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 15,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginTop: 8,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    width: '100%',
  },
});
