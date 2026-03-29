/**
 * Biometric Authentication Utility
 * 
 * Handles Face ID / Touch ID authentication for secure login
 * Uses expo-local-authentication and expo-secure-store
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

// SecureStore keys for biometric credentials
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_USER_KEY = 'biometric_user';
const BIOMETRIC_TOKEN_KEY = 'biometric_token';

/**
 * Check if biometric authentication is available on the device
 * and if the user has enrolled biometric credentials
 */
export const checkBiometricAvailability = async (): Promise<{
  isAvailable: boolean;
  biometricType: string;
}> => {
  try {
    // Check if hardware supports biometric authentication
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return { isAvailable: false, biometricType: 'none' };
    }

    // Check if user has enrolled biometric credentials (Face ID / Touch ID)
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      return { isAvailable: false, biometricType: 'none' };
    }

    // Get supported authentication types
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    let biometricType = 'Biometric';
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'Face ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'Touch ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'Iris';
    }

    return { isAvailable: true, biometricType };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return { isAvailable: false, biometricType: 'none' };
  }
};

/**
 * Enable biometric login by securely storing user credentials
 * Called after successful login
 */
export const enableBiometricLogin = async (
  userObject: any,
  token: string
): Promise<boolean> => {
  try {
    // Store credentials securely (store full user object)
    await SecureStore.setItemAsync(BIOMETRIC_USER_KEY, JSON.stringify(userObject));
    await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token);
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');

    return true;
  } catch (error) {
    console.error('Error enabling biometric login:', error);
    Alert.alert(
      'Error',
      'Failed to enable biometric authentication. Please try again.'
    );
    return false;
  }
};

/**
 * Check if biometric login is currently enabled
 */
export const isBiometricLoginEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometric status:', error);
    return false;
  }
};

/**
 * Authenticate user with biometrics and return stored credentials
 * Returns null if authentication fails or is cancelled
 */
export const loginWithBiometrics = async (): Promise<{
  user: any;
  token: string;
} | null> => {
  try {
    // First check if biometric is available
    const { isAvailable, biometricType } = await checkBiometricAvailability();
    if (!isAvailable) {
      Alert.alert(
        'Not Available',
        'Biometric authentication is not available on this device.'
      );
      return null;
    }

    // Check if biometric login is enabled
    const enabled = await isBiometricLoginEnabled();
    if (!enabled) {
      Alert.alert(
        'Not Enabled',
        'Biometric login is not enabled. Please log in with your credentials first.'
      );
      return null;
    }

    // Prompt for biometric authentication
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Authenticate with ${biometricType}`,
      fallbackLabel: 'Use Password',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });

    if (!result.success) {
      if (result.error === 'user_cancel') {
        // User cancelled, don't show error
        return null;
      }
      
      Alert.alert(
        'Authentication Failed',
        'Biometric authentication failed. Please try again or use your password.'
      );
      return null;
    }

    // Authentication successful - retrieve stored credentials
    const userStr = await SecureStore.getItemAsync(BIOMETRIC_USER_KEY);
    const token = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);

    if (!userStr || !token) {
      Alert.alert(
        'Error',
        'Stored credentials not found. Please log in with your password.'
      );
      await disableBiometricLogin(); // Clean up invalid state
      return null;
    }

    const user = JSON.parse(userStr);
    return { user, token };
  } catch (error) {
    console.error('Error during biometric authentication:', error);
    Alert.alert(
      'Error',
      'An error occurred during authentication. Please try again.'
    );
    return null;
  }
};

/**
 * Disable biometric login and clear stored credentials
 */
export const disableBiometricLogin = async (): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_USER_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error disabling biometric login:', error);
    Alert.alert(
      'Error',
      'Failed to disable biometric authentication.'
    );
    return false;
  }
};

/**
 * Prompt user to enable biometric authentication after successful login
 */
export const promptEnableBiometrics = async (
  userObject: any,
  token: string
): Promise<void> => {
  const { isAvailable, biometricType } = await checkBiometricAvailability();
  
  if (!isAvailable) {
    return; // Don't prompt if biometrics aren't available
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
          }
        },
      },
    ]
  );
};
