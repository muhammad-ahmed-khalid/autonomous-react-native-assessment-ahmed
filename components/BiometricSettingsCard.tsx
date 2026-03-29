/**
 * OPTIONAL: Biometric Settings Component
 * 
 * Add this to your settings/profile screen to let users manage biometric authentication
 * 
 * Usage:
 * Import this component and add it to your settings screen:
 * <BiometricSettingsCard />
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  checkBiometricAvailability,
  isBiometricLoginEnabled,
  disableBiometricLogin,
  enableBiometricLogin,
} from '@/utils/biometricAuth';
import { useAppSelector } from '@/store/hooks';

export default function BiometricSettingsCard() {
  const { user, token } = useAppSelector((state) => state.auth);
  
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    const { isAvailable, biometricType: type } = await checkBiometricAvailability();
    setBiometricAvailable(isAvailable);
    setBiometricType(type);

    if (isAvailable) {
      const enabled = await isBiometricLoginEnabled();
      setBiometricEnabled(enabled);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (loading) return;

    if (value) {
      // Enable biometric
      if (!user || !token) {
        Alert.alert('Error', 'User session not found. Please log in again.');
        return;
      }

      Alert.alert(
        `Enable ${biometricType}?`,
        `This will allow you to log in quickly using ${biometricType} instead of your password.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              setLoading(true);
              const success = await enableBiometricLogin(user, token);
              setLoading(false);
              
              if (success) {
                setBiometricEnabled(true);
                Alert.alert('Success', `${biometricType} has been enabled.`);
              }
            },
          },
        ]
      );
    } else {
      // Disable biometric
      Alert.alert(
        `Disable ${biometricType}?`,
        'You will need to use your password to log in next time.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              const success = await disableBiometricLogin();
              setLoading(false);
              
              if (success) {
                setBiometricEnabled(false);
                Alert.alert('Disabled', `${biometricType} login has been disabled.`);
              }
            },
          },
        ]
      );
    }
  };

  // Don't show if biometric is not available
  if (!biometricAvailable) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={biometricType === 'Face ID' ? 'scan' : 'finger-print'}
            size={24}
            color="#007AFF"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{biometricType} Login</Text>
          <Text style={styles.subtitle}>
            {biometricEnabled
              ? `Use ${biometricType} to log in quickly`
              : `Enable ${biometricType} for faster login`}
          </Text>
        </View>
        <Switch
          value={biometricEnabled}
          onValueChange={handleToggleBiometric}
          disabled={loading}
          trackColor={{ false: '#d1d1d6', true: '#007AFF' }}
          thumbColor="#fff"
        />
      </View>

      {biometricEnabled && (
        <View style={styles.statusContainer}>
          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          <Text style={styles.statusText}>Active</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  statusText: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 6,
  },
});
