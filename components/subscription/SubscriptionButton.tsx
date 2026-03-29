/**
 * Subscription Button Component
 * Reusable button with loading state and variants
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, View as RNView } from 'react-native';
import { Text } from '../Themed';

interface SubscriptionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: any;
}

export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.button,
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
    isDisabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
    isDisabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#007AFF' : '#fff'} />
      ) : (
        <RNView style={styles.content}>
          {icon && <RNView style={styles.iconContainer}>{icon}</RNView>}
          <Text style={textStyles}>{title}</Text>
        </RNView>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#5856D6',
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: '#fff',
  },
  textDanger: {
    color: '#fff',
  },
  textOutline: {
    color: '#007AFF',
  },
  textDisabled: {
    opacity: 1,
  },
});
