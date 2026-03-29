/**
 * Plan Card Component
 * Displays a subscription plan with pricing, features, and action button
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from '../Themed';
import { Ionicons } from '@expo/vector-icons';
import type { SubscriptionPlan, BillingCycle } from '@/types/subscription';

interface PlanCardProps {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  isCurrentPlan?: boolean;
  onSelect: () => void;
  disabled?: boolean;
  buttonText?: string;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  billingCycle,
  isCurrentPlan,
  onSelect,
  disabled,
  buttonText = 'Select Plan',
}) => {
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const pricePerMonth = billingCycle === 'yearly' ? (plan.yearlyPrice / 12).toFixed(2) : price.toFixed(2);

  return (
    <View style={[styles.card, plan.popular && styles.popularCard]}>
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.headerSection}>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planDescription}>{plan.description}</Text>
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.currency}>{plan.currency}</Text>
        <Text style={styles.price}>${price}</Text>
        <Text style={styles.billingPeriod}>/{billingCycle === 'monthly' ? 'month' : 'year'}</Text>
      </View>

      {billingCycle === 'yearly' && (
        <Text style={styles.savings}>
          ${pricePerMonth}/mo · Save {Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)}%
        </Text>
      )}

      <View style={styles.featuresSection}>
        {plan.features.map((feature) => (
          <View key={feature.id} style={styles.featureRow}>
            <Ionicons
              name={feature.included ? 'checkmark-circle' : 'close-circle-outline'}
              size={20}
              color={feature.included ? '#4CAF50' : '#999'}
              style={styles.featureIcon}
            />
            <Text style={[styles.featureText, !feature.included && styles.featureTextDisabled]}>
              {feature.name}
            </Text>
          </View>
        ))}
      </View>

      {isCurrentPlan ? (
        <View style={[styles.button, styles.currentPlanButton]}>
          <Text style={styles.currentPlanText}>Current Plan</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={onSelect}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  popularCard: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headerSection: {
    marginBottom: 20,
  },
  planName: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 4,
    marginTop: 8,
  },
  price: {
    fontSize: 42,
    fontWeight: '700',
  },
  billingPeriod: {
    fontSize: 16,
    opacity: 0.6,
    marginLeft: 4,
  },
  savings: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 24,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  featureTextDisabled: {
    opacity: 0.4,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  currentPlanButton: {
    backgroundColor: '#F0F0F0',
  },
  currentPlanText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
