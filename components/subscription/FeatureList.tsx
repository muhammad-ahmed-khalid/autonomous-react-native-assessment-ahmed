/**
 * Feature List Component
 * Displays a list of features with checkmarks
 */

import React from 'react';
import { StyleSheet, View as RNView } from 'react-native';
import { Text, View } from '../Themed';
import { Ionicons } from '@expo/vector-icons';
import type { SubscriptionFeature } from '@/types/subscription';

interface FeatureListProps {
  features: SubscriptionFeature[];
  compact?: boolean;
}

export const FeatureList: React.FC<FeatureListProps> = ({ features, compact = false }) => {
  return (
    <View style={styles.container}>
      {features.map((feature) => (
        <View key={feature.id} style={[styles.featureRow, compact && styles.featureRowCompact]}>
          <Ionicons
            name={feature.included ? 'checkmark-circle' : 'close-circle-outline'}
            size={compact ? 18 : 22}
            color={feature.included ? '#4CAF50' : '#E0E0E0'}
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={[styles.featureName, !feature.included && styles.featureDisabled]}>
              {feature.name}
              {feature.limit && (
                <Text style={styles.limit}> ({feature.limit})</Text>
              )}
            </Text>
            {feature.description && !compact && (
              <Text style={styles.description}>{feature.description}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  featureRowCompact: {
    marginBottom: 10,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  featureName: {
    fontSize: 15,
    fontWeight: '500',
  },
  featureDisabled: {
    opacity: 0.4,
  },
  limit: {
    fontSize: 13,
    opacity: 0.6,
  },
  description: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
  },
});
