/**
 * Subscription Plans Screen
 * Displays all available subscription plans with comparison
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  View as RNView,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '@/hooks/useSubscription';
import { PlanCard } from '@/components/subscription/PlanCard';
import { BillingCycleToggle } from '@/components/subscription/BillingCycleToggle';
import { SubscriptionButton } from '@/components/subscription/SubscriptionButton';
import type { BillingCycle, SubscriptionPlan } from '@/types/subscription';

export default function SubscriptionPlansScreen() {
  const {
    currentSubscription,
    availablePlans,
    loading,
    error,
    prorationPreview,
    initialize,
    loadProrationPreview,
    dismissProrationPreview,
    isUpgrade,
    isDowngrade,
  } = useSubscription();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showProrationModal, setShowProrationModal] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (currentSubscription) {
      setBillingCycle(currentSubscription.billingCycle);
    }
  }, [currentSubscription]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    // If no active subscription, go directly to payment
    if (!currentSubscription || currentSubscription.status === 'none') {
      setSelectedPlan(plan);
      router.push({
        pathname: '/subscription/payment',
        params: { planId: plan.id, billingCycle },
      });
      return;
    }

    // If selecting current plan, do nothing
    if (plan.id === currentSubscription.planId && billingCycle === currentSubscription.billingCycle) {
      Alert.alert('Current Plan', 'You are already subscribed to this plan.');
      return;
    }

    // Load proration preview
    setSelectedPlan(plan);
    await loadProrationPreview(plan.id, billingCycle);
    setShowProrationModal(true);
  };

  const handleConfirmPlanChange = () => {
    setShowProrationModal(false);
    dismissProrationPreview();

    if (selectedPlan) {
      // Navigate to payment for plan change
      router.push({
        pathname: '/subscription/payment',
        params: {
          planId: selectedPlan.id,
          billingCycle,
          isChange: 'true',
        },
      });
    }
  };

  const getButtonText = (plan: SubscriptionPlan): string => {
    if (!currentSubscription || currentSubscription.status === 'none') {
      return 'Subscribe';
    }

    if (plan.id === currentSubscription.planId) {
      if (billingCycle !== currentSubscription.billingCycle) {
        return `Switch to ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`;
      }
      return 'Current Plan';
    }

    if (isUpgrade(plan.id)) {
      return 'Upgrade';
    }

    if (isDowngrade(plan.id)) {
      return 'Downgrade';
    }

    return 'Select Plan';
  };

  const isCurrentPlan = (plan: SubscriptionPlan): boolean => {
    return (
      !!currentSubscription &&
      plan.id === currentSubscription.planId &&
      billingCycle === currentSubscription.billingCycle
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Choose Your Plan</Text>
            <Text style={styles.headerSubtitle}>
              Select the perfect plan for your needs
            </Text>
          </View>
        </View>

        {/* Billing Cycle Toggle */}
        <BillingCycleToggle
          selected={billingCycle}
          onChange={setBillingCycle}
          showSavings={true}
        />

        {/* Plans List */}
        <View style={styles.plansContainer}>
          {loading && availablePlans.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text>Loading plans...</Text>
            </View>
          ) : (
            availablePlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                isCurrentPlan={isCurrentPlan(plan)}
                onSelect={() => handleSelectPlan(plan)}
                buttonText={getButtonText(plan)}
                disabled={loading}
              />
            ))
          )}
        </View>

        {/* Money-back Guarantee */}
        <View style={styles.guaranteeBox}>
          <Ionicons name="shield-checkmark" size={32} color="#4CAF50" />
          <View style={styles.guaranteeText}>
            <Text style={styles.guaranteeTitle}>30-Day Money-Back Guarantee</Text>
            <Text style={styles.guaranteeDescription}>
              Try any plan risk-free. If you're not satisfied, get a full refund within 30 days.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Proration Modal */}
      <Modal
        visible={showProrationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowProrationModal(false);
          dismissProrationPreview();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Plan Change Summary</Text>

            {selectedPlan && (
              <>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>New Plan</Text>
                  <Text style={styles.modalValue}>{selectedPlan.name}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Billing Cycle</Text>
                  <Text style={styles.modalValue}>
                    {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                  </Text>
                </View>

                {prorationPreview && (
                  <>
                    <View style={styles.divider} />

                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Credit from current plan</Text>
                      <Text style={styles.modalValueGreen}>
                        -${prorationPreview.creditAmount.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>New plan charge</Text>
                      <Text style={styles.modalValue}>
                        ${prorationPreview.chargeAmount.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabelBold}>Amount due today</Text>
                      <Text style={styles.modalValueBold}>
                        ${prorationPreview.netAmount.toFixed(2)}
                      </Text>
                    </View>

                    <Text style={styles.modalNote}>
                      Your next billing date will be{' '}
                      {new Date(prorationPreview.newBillingDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </>
                )}
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowProrationModal(false);
                  dismissProrationPreview();
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleConfirmPlanChange}
              >
                <Text style={styles.modalButtonTextPrimary}>Continue to Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.6,
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  guaranteeBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  guaranteeText: {
    flex: 1,
    marginLeft: 16,
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  guaranteeDescription: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 15,
    opacity: 0.7,
  },
  modalLabelBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalValueBold: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  modalValueGreen: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  modalNote: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonSecondary: {
    backgroundColor: '#F0F0F0',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalButtonTextSecondary: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
