/**
 * Biometric Authentication Utility - Refactored
 * 
 * Handles Face ID / Touch ID authentication for secure login.
 * Refactored with:
 * - Centralized secure storage
 * - Structured logging
 * - Separated UI concerns
 * - Better type safety
 * - Constants usage
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';
import secureStorage from './secureStorage';
import { logger } from './logger';
import { handleError } from './errorHandler';
import { STORAGE_KEYS, BIOMETRIC_CONFIG } from '@/constants/AppConstants';

/**
 * Biometric availability result
 */
export interface BiometricAvailability {
  isAvailable: boolean;
  biometricType: 'Face ID' | 'Touch ID' | 'Iris' | 'Biometric' | 'none';
}

/**
 * Biometric credentials
 */
export interface BiometricCredentials {
  user: any;
  token: string;
}

/**
 * ============================================================================
 * Core Biometric Functions (No UI)
 * ============================================================================
 */

/**
 * Check if biometric authentication is available on the device
 */
export const checkBiometricAvailability = async (): Promise<BiometricAvailability> => {
  try {
    // Check hardware support
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      logger.debug('Biometric hardware not available');
      return { isAvailable: false, biometricType: 'none' };
    }

    // Check enrollment
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      logger.debug('No biometric credentials enrolled');
      return { isAvailable: false, biometricType: 'none' };
    }

    // Get supported types
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    let biometricType: BiometricAvailability['biometricType'] = 'Biometric';
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'Face ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'Touch ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'Iris';
    }

    logger.success(`Biometric available: ${biometricType}`, { context: 'Biometric' });
    return { isAvailable: true, biometricType };
  } catch (error) {
    handleError(error, 'checkBiometricAvailability');
    return { isAvailable: false, biometricType: 'none' };
  }
};

/**
 * Enable biometric login by securely storing credentials
 */
export const enableBiometricLogin = async (
  userObject: any,
  token: string
): Promise<boolean> => {
  try {
    logger.info('Enabling biometric login', { context: 'Biometric' });
    
    const success = await secureStorage.saveBatch({
      [STORAGE_KEYS.BIOMETRIC_USER]: JSON.stringify(userObject),
      [STORAGE_KEYS.BIOMETRIC_TOKEN]: token,
      [STORAGE_KEYS.BIOMETRIC_ENABLED]: 'true',
    });

    if (success) {
      logger.success('Biometric login enabled', { context: 'Biometric' });
    }
    
    return success;
  } catch (error) {
    handleError(error, 'enableBiometricLogin');
    return false;
  }
};

/**
 * Check if biometric login is enabled
 */
export const isBiometricLoginEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await secureStorage.get(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return enabled === 'true';
  } catch (error) {
    handleError(error, 'isBiometricLoginEnabled');
    return false;
  }
};

/**
 * Perform biometric authentication
 * Returns true if successful, false otherwise
 */
export const authenticateWithBiometric = async (
  biometricType: string = 'Biometric'
): Promise<boolean> => {
  try {
    logger.info('Requesting biometric authentication', { context: 'Biometric' });
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: BIOMETRIC_CONFIG.PROMPT_MESSAGE,
      fallbackLabel: BIOMETRIC_CONFIG.FALLBACK_LABEL,
      cancelLabel: BIOMETRIC_CONFIG.CANCEL_LABEL,
      disableDeviceFallback: BIOMETRIC_CONFIG.DISABLE_DEVICE_FALLBACK,
    });

    if (result.success) {
      logger.success('Biometric authentication successful', { context: 'Biometric' });
      return true;
    } else {
      if (result.error !== 'user_cancel') {
        logger.warning('Biometric authentication failed', { 
          context: 'Biometric',
          data: { error: result.error } 
        });
      }
      return false;
    }
  } catch (error) {
    handleError(error, 'authenticateWithBiometric');
    return false;
  }
};

/**
 * Get stored biometric credentials
 */
export const getStoredBiometricCredentials = async (): Promise<BiometricCredentials | null> => {
  try {
    const batch = await secureStorage.getBatch([
      STORAGE_KEYS.BIOMETRIC_USER,
      STORAGE_KEYS.BIOMETRIC_TOKEN,
    ]);

    const userStr = batch[STORAGE_KEYS.BIOMETRIC_USER];
    const token = batch[STORAGE_KEYS.BIOMETRIC_TOKEN];

    if (!userStr || !token) {
      logger.warning('Stored biometric credentials not found', { context: 'Biometric' });
      return null;
    }

    const user = JSON.parse(userStr);
    logger.debug('Retrieved stored biometric credentials', { context: 'Biometric' });
    
    return { user, token };
  } catch (error) {
    handleError(error, 'getStoredBiometricCredentials');
    return null;
  }
};

/**
 * Disable biometric login and clear credentials
 */
export const disableBiometricLogin = async (): Promise<boolean> => {
  try {
    logger.info('Disabling biometric login', { context: 'Biometric' });
    
    const success = await secureStorage.clearMany([
      STORAGE_KEYS.BIOMETRIC_ENABLED,
      STORAGE_KEYS.BIOMETRIC_USER,
      STORAGE_KEYS.BIOMETRIC_TOKEN,
    ]);

    if (success) {
      logger.success('Biometric login disabled', { context: 'Biometric' });
    }
    
    return success;
  } catch (error) {
    handleError(error, 'disableBiometricLogin');
    return false;
  }
};

/**
 * ============================================================================
 * High-Level Functions (With UI)
 * ============================================================================
 */

/**
 * Authenticate user with biometrics and return credentials
 * Shows alerts on failures
 */
export const loginWithBiometrics = async (): Promise<BiometricCredentials | null> => {
  try {
    // Check availability
    const { isAvailable, biometricType } = await checkBiometricAvailability();
    if (!isAvailable) {
      Alert.alert(
        'Not Available',
        'Biometric authentication is not available on this device.'
      );
      return null;
    }

    // Check if enabled
    const enabled = await isBiometricLoginEnabled();
    if (!enabled) {
      Alert.alert(
        'Not Enabled',
        'Biometric login is not enabled. Please log in with your credentials first.'
      );
      return null;
    }

    // Authenticate
    const authenticated = await authenticateWithBiometric(biometricType);
    if (!authenticated) {
      return null; // User cancelled or failed
    }

    // Get credentials
    const credentials = await getStoredBiometricCredentials();
    if (!credentials) {
      Alert.alert(
        'Error',
        'Stored credentials not found. Please log in with your password.'
      );
      await disableBiometricLogin(); // Clean up invalid state
      return null;
    }

    return credentials;
  } catch (error) {
    handleError(error, 'loginWithBiometrics');
    Alert.alert(
      'Error',
      'An error occurred during authentication. Please try again.'
    );
    return null;
  }
};

/**
 * Prompt user to enable biometric authentication after login
 */
export const promptEnableBiometrics = async (
  userObject: any,
  token: string
): Promise<void> => {
  const { isAvailable, biometricType } = await checkBiometricAvailability();
  
  if (!isAvailable) {
    return; // Don't prompt if not available
  }

  // Check if already enabled
  const alreadyEnabled = await isBiometricLoginEnabled();
  if (alreadyEnabled) {
    return; // Don't prompt if already enabled
  }

  // Prompt user
  Alert.alert(
    `Enable ${biometricType}?`,
    `Would you like to enable ${biometricType} for faster login next time?`,
    [
      {
        text: 'Not Now',
        style: 'cancel',
      },
      {
        text: 'Enable',
        onPress: async () => {
          const success = await enableBiometricLogin(userObject, token);
          if (success) {
            Alert.alert(
              'Success',
              `${biometricType} has been enabled for future logins.`
            );
          } else {
            Alert.alert(
              'Error',
              'Failed to enable biometric authentication. Please try again.'
            );
          }
        },
      },
    ]
  );
};

/**
 * Prompt to disable biometric authentication
 */
export const promptDisableBiometrics = async (
  onSuccess?: () => void
): Promise<void> => {
  const enabled = await isBiometricLoginEnabled();
  if (!enabled) {
    return; // Nothing to disable
  }

  Alert.alert(
    'Disable Biometric Login?',
    'Are you sure you want to disable biometric login?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Disable',
        style: 'destructive',
        onPress: async () => {
          const success = await disableBiometricLogin();
          if (success) {
            Alert.alert('Success', 'Biometric login has been disabled.');
            onSuccess?.();
          } else {
            Alert.alert('Error', 'Failed to disable biometric authentication.');
          }
        },
      },
    ]
  );
};

export default {
  checkBiometricAvailability,
  enableBiometricLogin,
  isBiometricLoginEnabled,
  authenticateWithBiometric,
  getStoredBiometricCredentials,
  disableBiometricLogin,
  loginWithBiometrics,
  promptEnableBiometrics,
  promptDisableBiometrics,
};

