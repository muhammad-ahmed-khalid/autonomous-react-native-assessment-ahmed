/**
 * Subscription Status Badge Component
 * Displays subscription status with appropriate styling
 */

import React from 'react';
import { StyleSheet, View as RNView } from 'react-native';
import { Text, View } from '../Themed';
import type { SubscriptionStatus } from '@/types/subscription';

interface StatusBadgeProps {
  status: SubscriptionStatus;
}

const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Active', color: '#4CAF50', bgColor: '#E8F5E9' },
  cancelled: { label: 'Cancelled', color: '#FF9800', bgColor: '#FFF3E0' },
  expired: { label: 'Expired', color: '#F44336', bgColor: '#FFEBEE' },
  trial: { label: 'Trial', color: '#2196F3', bgColor: '#E3F2FD' },
  none: { label: 'No Plan', color: '#9E9E9E', bgColor: '#F5F5F5' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
