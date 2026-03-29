/**
 * Payment Screen
 * Mock payment processing with card input and success animation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  View as RNView,
  TouchableOpacity,
  Animated,
  Keyboard,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePayment } from '@/hooks/usePayment';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionButton } from '@/components/subscription/SubscriptionButton';
import type { PaymentDetails, BillingCycle } from '@/types/subscription';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const planId = params.planId as string;
  const billingCycle = (params.billingCycle as BillingCycle) || 'monthly';
  const isChange = params.isChange === 'true';

  const { getPlanById } = useSubscription();
  const {
    processing,
    paymentError,
    handlePayment,
    clearPaymentError,
    formatCardNumber,
    getCardBrand,
  } = usePayment();

  const plan = getPlanById(planId);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation values
  const successScale = useRef(new Animated.Value(0)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (paymentError) {
      Alert.alert('Payment Failed', paymentError, [{ text: 'OK', onPress: clearPaymentError }]);
    }
  }, [paymentError, clearPaymentError]);

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length <= 16) {
      setCardNumber(cleaned);
    }
  };

  const handleExpiryMonthChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) {
      setExpiryMonth(cleaned);
    }
  };

  const handleExpiryYearChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) {
      setExpiryYear(cleaned);
    }
  };

  const handleCvcChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCvc(cleaned);
    }
  };

  const handleSubmitPayment = async () => {
    Keyboard.dismiss();

    const paymentDetails: PaymentDetails = {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvc,
      cardholderName,
    };

    const result = await handlePayment(planId, billingCycle, paymentDetails);

    if (result.success) {
      // Show success animation
      setShowSuccess(true);

      // Animate success checkmark
      Animated.sequence([
        Animated.timing(successScale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(successScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate confetti
      Animated.timing(confettiOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Navigate back after delay
      setTimeout(() => {
        router.replace('/subscription/detail');
      }, 2500);
    }
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Plan not found</Text>
        </View>
      </View>
    );
  }

  const amount = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

  if (showSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          {/* Confetti Background */}
          <Animated.View style={[styles.confettiContainer, { opacity: confettiOpacity }]}>
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.confetti,
                  {
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][
                      Math.floor(Math.random() * 5)
                    ],
                    transform: [{ rotate: `${Math.random() * 360}deg` }],
                  },
                ]}
              />
            ))}
          </Animated.View>

          {/* Success Icon */}
          <Animated.View style={[styles.successIcon, { transform: [{ scale: successScale }] }]}>
            <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
          </Animated.View>

          {/* Success Message */}
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successMessage}>
            Your subscription to {plan.name} has been activated.
          </Text>

          {/* Amount */}
          <View style={styles.successAmountBox}>
            <Text style={styles.successAmountLabel}>Amount Charged</Text>
            <Text style={styles.successAmount}>${amount.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Payment Details</Text>
            <Text style={styles.headerSubtitle}>Complete your subscription</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan</Text>
            <Text style={styles.summaryValue}>{plan.name}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Billing</Text>
            <Text style={styles.summaryValue}>
              {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>${amount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Card Information</Text>

          {/* Card Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <View style={styles.cardNumberContainer}>
              <TextInput
                style={styles.input}
                value={formatCardNumber(cardNumber)}
                onChangeText={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                keyboardType="number-pad"
                maxLength={19}
                placeholderTextColor="#999"
              />
              {cardNumber.length >= 4 && (
                <Text style={styles.cardBrand}>{getCardBrand(cardNumber)}</Text>
              )}
            </View>
          </View>

          {/* Expiry and CVC */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, styles.inputGroupHalf]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <View style={styles.expiryContainer}>
                <TextInput
                  style={[styles.input, styles.expiryInput]}
                  value={expiryMonth}
                  onChangeText={handleExpiryMonthChange}
                  placeholder="MM"
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholderTextColor="#999"
                />
                <Text style={styles.expirySeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.expiryInput]}
                  value={expiryYear}
                  onChangeText={handleExpiryYearChange}
                  placeholder="YY"
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.inputGroupHalf]}>
              <Text style={styles.inputLabel}>CVC</Text>
              <TextInput
                style={styles.input}
                value={cvc}
                onChangeText={handleCvcChange}
                placeholder="123"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Cardholder Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              value={cardholderName}
              onChangeText={setCardholderName}
              placeholder="John Doe"
              autoCapitalize="words"
              placeholderTextColor="#999"
            />
          </View>

          {/* Test Card Info */}
          <View style={styles.testCardInfo}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.testCardText}>
              Test card: 4242 4242 4242 4242 (Success) or 4000 0000 0000 0002 (Decline)
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <SubscriptionButton
            title={`Pay $${amount.toFixed(2)}`}
            onPress={handleSubmitPayment}
            variant="primary"
            loading={processing}
            disabled={
              !cardNumber ||
              !expiryMonth ||
              !expiryYear ||
              !cvc ||
              !cardholderName ||
              processing
            }
            icon={<Ionicons name="lock-closed" size={20} color="#fff" />}
          />
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure
          </Text>
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
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardNumberContainer: {
    position: 'relative',
  },
  cardBrand: {
    position: 'absolute',
    right: 16,
    top: 14,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryInput: {
    flex: 1,
  },
  expirySeparator: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  testCardInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  testCardText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 8,
    color: '#007AFF',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  securityText: {
    fontSize: 13,
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.6,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    position: 'relative',
  },
  confettiContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  successAmountBox: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  successAmountLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  successAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4CAF50',
  },
});
