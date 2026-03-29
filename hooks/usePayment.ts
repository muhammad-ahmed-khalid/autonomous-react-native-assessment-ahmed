/**
 * usePayment Hook
 * Custom hook for handling payment processing
 */

import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { processPayment } from '@/store/slices/subscriptionSlice';
import type { PaymentDetails, BillingCycle } from '@/types/subscription';

export const usePayment = () => {
  const dispatch = useAppDispatch();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  /**
   * Validate card number (basic Luhn algorithm)
   */
  const validateCardNumber = useCallback((cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');

    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }, []);

  /**
   * Validate expiry date
   */
  const validateExpiry = useCallback((month: string, year: string): boolean => {
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (monthNum < 1 || monthNum > 12) {
      return false;
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (yearNum < currentYear) {
      return false;
    }

    if (yearNum === currentYear && monthNum < currentMonth) {
      return false;
    }

    return true;
  }, []);

  /**
   * Validate CVC
   */
  const validateCVC = useCallback((cvc: string): boolean => {
    return /^\d{3,4}$/.test(cvc);
  }, []);

  /**
   * Validate all payment details
   */
  const validatePaymentDetails = useCallback(
    (details: PaymentDetails): { valid: boolean; error?: string } => {
      if (!details.cardholderName.trim()) {
        return { valid: false, error: 'Please enter cardholder name' };
      }

      if (!validateCardNumber(details.cardNumber)) {
        return { valid: false, error: 'Invalid card number' };
      }

      if (!validateExpiry(details.expiryMonth, details.expiryYear)) {
        return { valid: false, error: 'Invalid expiry date' };
      }

      if (!validateCVC(details.cvc)) {
        return { valid: false, error: 'Invalid CVC' };
      }

      return { valid: true };
    },
    [validateCardNumber, validateExpiry, validateCVC]
  );

  /**
   * Process payment
   */
  const handlePayment = useCallback(
    async (planId: string, billingCycle: BillingCycle, paymentDetails: PaymentDetails) => {
      setProcessing(true);
      setPaymentError(null);

      try {
        // Validate payment details
        const validation = validatePaymentDetails(paymentDetails);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Process payment through Redux
        const result = await dispatch(
          processPayment({
            planId,
            billingCycle,
            paymentDetails,
          })
        );

        if (result.meta.requestStatus === 'rejected') {
          throw new Error(result.payload as string);
        }

        setProcessing(false);
        return { success: true };
      } catch (error: any) {
        const errorMessage = error.message || 'Payment failed. Please try again.';
        setPaymentError(errorMessage);
        setProcessing(false);
        return { success: false, error: errorMessage };
      }
    },
    [dispatch, validatePaymentDetails]
  );

  /**
   * Format card number for display
   */
  const formatCardNumber = useCallback((value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  }, []);

  /**
   * Get card brand from number
   */
  const getCardBrand = useCallback((cardNumber: string): string => {
    const cleaned = cardNumber.replace(/\s/g, '');

    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'Amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';

    return 'Unknown';
  }, []);

  /**
   * Clear payment error
   */
  const clearPaymentError = useCallback(() => {
    setPaymentError(null);
  }, []);

  return {
    // State
    processing,
    paymentError,

    // Actions
    handlePayment,
    clearPaymentError,

    // Validation
    validateCardNumber,
    validateExpiry,
    validateCVC,
    validatePaymentDetails,

    // Helpers
    formatCardNumber,
    getCardBrand,
  };
};
