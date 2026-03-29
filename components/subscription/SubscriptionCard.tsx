/**
 * Subscription Card Component
 * Displays subscription plan information with proper styling
 */

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '../Themed';
import { Ionicons } from '@expo/vector-icons';

interface SubscriptionCardProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: any;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  title,
  description,
  icon,
  onPress,
  children,
  style,
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.cardHeader}>
        {icon && (
          <Ionicons name={icon} size={24} color="#007AFF" style={styles.icon} />
        )}
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>
      {children && <View style={styles.cardContent}>{children}</View>}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.6,
  },
  cardContent: {
    marginTop: 16,
  },
});
