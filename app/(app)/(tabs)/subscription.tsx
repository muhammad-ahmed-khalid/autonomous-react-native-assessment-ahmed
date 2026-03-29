/**
 * Subscription Tab Screen
 * Main entry point for subscription management from tab navigation
 */

import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from '@/components/subscription/StatusBadge';
import { SubscriptionButton } from '@/components/subscription/SubscriptionButton';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { useSubscriptionTabContainer } from '@/layouts/subscription-tab/useSubscriptionTabContainer';

export default function SubscriptionTabScreen() {
  const {
    currentSubscription,
    loading,
    initialize,
    formattedNextBillingDate,
    trialDaysRemaining,
    hasActiveSubscription,
    isTrialActive,
    handleViewDetails,
    handleViewPlans,
    handleUpgrade,
  } = useSubscriptionTabContainer();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="star" size={48} color="#007AFF" />
          <Text style={styles.headerTitle}>Subscription</Text>
          <Text style={styles.headerSubtitle}>
            Unlock premium features and grow your business
          </Text>
        </View>

        {loading && !currentSubscription ? (
          <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
          </View>
        ) : hasActiveSubscription ? (
          <>
            {/* Current Plan Overview */}
            <SubscriptionCard
              title="Current Plan"
              icon="checkmark-circle"
              style={styles.card}
            >
              <View style={styles.planContainer}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{currentSubscription.plan.name}</Text>
                  <Text style={styles.planPrice}>
                    ${currentSubscription.billingCycle === 'monthly'
                      ? currentSubscription.plan.monthlyPrice
                      : currentSubscription.plan.yearlyPrice}
                    <Text style={styles.planPeriod}>
                      /{currentSubscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </Text>
                  </Text>
                </View>
                <StatusBadge status={currentSubscription.status} />
              </View>

              {isTrialActive && trialDaysRemaining() !== null && (
                <View style={styles.trialBanner}>
                  <Ionicons name="time-outline" size={20} color="#2196F3" />
                  <Text style={styles.trialText}>
                    {trialDaysRemaining()} days left in trial
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Next Billing</Text>
                <Text style={styles.infoValue}>{formattedNextBillingDate()}</Text>
              </View>
            </SubscriptionCard>

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionCard} onPress={handleViewDetails}>
                <Ionicons name="document-text-outline" size={32} color="#007AFF" />
                <Text style={styles.actionTitle}>View Details</Text>
                <Text style={styles.actionDescription}>Manage your subscription</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={handleUpgrade}>
                <Ionicons name="trending-up-outline" size={32} color="#4CAF50" />
                <Text style={styles.actionTitle}>Upgrade Plan</Text>
                <Text style={styles.actionDescription}>Unlock more features</Text>
              </TouchableOpacity>
            </View>

            {/* Features Overview */}
            <View style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>Your Plan Includes</Text>
              {currentSubscription.plan.features.filter(f => f.included).slice(0, 4).map((feature) => (
                <View key={feature.id} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.featureText}>{feature.name}</Text>
                </View>
              ))}
              <TouchableOpacity onPress={handleViewDetails}>
                <Text style={styles.viewAllLink}>View all features →</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* No Subscription State */}
            <View style={styles.emptyState}>
              <Ionicons name="rocket-outline" size={80} color="#CCC" />
              <Text style={styles.emptyTitle}>Start Your Journey</Text>
              <Text style={styles.emptyMessage}>
                Choose a plan that fits your needs and unlock powerful features to grow your business.
              </Text>
            </View>

            {/* Plan Highlights */}
            <View style={styles.highlightsContainer}>
              <View style={styles.highlightCard}>
                <Ionicons name="apps" size={28} color="#007AFF" />
                <Text style={styles.highlightTitle}>Unlimited Apps</Text>
                <Text style={styles.highlightText}>Create as many apps as you need</Text>
              </View>

              <View style={styles.highlightCard}>
                <Ionicons name="analytics" size={28} color="#FF9800" />
                <Text style={styles.highlightTitle}>Advanced Analytics</Text>
                <Text style={styles.highlightText}>Track your app performance</Text>
              </View>

              <View style={styles.highlightCard}>
                <Ionicons name="headset" size={28} color="#4CAF50" />
                <Text style={styles.highlightTitle}>Priority Support</Text>
                <Text style={styles.highlightText}>Get help when you need it</Text>
              </View>

              <View style={styles.highlightCard}>
                <Ionicons name="brush" size={28} color="#9C27B0" />
                <Text style={styles.highlightTitle}>Custom Branding</Text>
                <Text style={styles.highlightText}>Make it yours</Text>
              </View>
            </View>

            {/* CTA Button */}
            <View style={styles.ctaContainer}>
              <SubscriptionButton
                title="View All Plans"
                onPress={handleViewPlans}
                variant="primary"
                icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
              />
            </View>
          </>
        )}

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>30-Day Money-Back Guarantee</Text>
            <Text style={styles.infoBannerDescription}>
              Try any plan risk-free. Not satisfied? Get a full refund.
            </Text>
          </View>
        </View>
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
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  planContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
  },
  planPeriod: {
    fontSize: 16,
    opacity: 0.7,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  trialText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 15,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
  },
  featuresCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    marginLeft: 12,
  },
  viewAllLink: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 24,
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  highlightCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  highlightText: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
  },
  ctaContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  infoBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoBannerDescription: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
  },
});
