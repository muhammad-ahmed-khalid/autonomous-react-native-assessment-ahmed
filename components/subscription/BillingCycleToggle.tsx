/**
 * Billing Cycle Toggle Component
 * Toggle between monthly and yearly billing
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from '../Themed';
import type { BillingCycle } from '@/types/subscription';

interface BillingCycleToggleProps {
  selected: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  showSavings?: boolean;
}

export const BillingCycleToggle: React.FC<BillingCycleToggleProps> = ({
  selected,
  onChange,
  showSavings = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, selected === 'monthly' && styles.toggleButtonActive]}
          onPress={() => onChange('monthly')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, selected === 'monthly' && styles.toggleTextActive]}>
            Monthly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, selected === 'yearly' && styles.toggleButtonActive]}
          onPress={() => onChange('yearly')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, selected === 'yearly' && styles.toggleTextActive]}>
            Yearly
          </Text>
          {showSavings && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Save 17%</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    position: 'relative',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
