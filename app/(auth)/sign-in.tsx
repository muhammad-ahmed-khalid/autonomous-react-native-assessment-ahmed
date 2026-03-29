import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ControlledInput } from '@/components/ControlledInput';
import { AuthWrapper } from '@/components/AuthWrapper';
import { useSignInContainer } from '@/layouts/sign-in/useSignInContainer';

/**
 * Sign In Screen
 * Handles user authentication with credentials and biometric login
 */
export default function SignInScreen() {
  const {
    control,
    errors,
    handleSubmit,
    onSubmit,
    isLoading,
    biometric,
    handleBiometricLogin,
  } = useSignInContainer();

  const showBiometric = biometric.isAvailable && biometric.isEnabled;
  const isBiometricLoading = biometric.isLoading;

  return (
    <AuthWrapper>
      <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Sign In</Text>
      
      {/* Demo Credentials Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Demo Credentials:</Text>
        <Text style={styles.infoDetail}>Username: emilys</Text>
        <Text style={styles.infoDetail}>Password: emilyspass</Text>
      </View>
      
      {/* Form Container */}
      <View style={styles.form}>
        {/* Biometric Login Button - Show only when available and enabled */}
        {showBiometric && (
          <>
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={isBiometricLoading || isLoading}
              accessibilityLabel={`Login with ${biometric.type}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: isBiometricLoading || isLoading }}
            >
              {isBiometricLoading ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <View style={styles.biometricContent}>
                  <Ionicons 
                    name={biometric.type === 'Face ID' ? 'scan' : 'finger-print'} 
                    size={24} 
                    color="#007AFF" 
                  />
                  <Text style={styles.biometricText}>
                    Login with {biometric.type}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Separator */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.separatorLine} />
            </View>
          </>
        )}
        
        {/* Username Input */}
        <ControlledInput
          control={control}
          name="username"
          placeholder="Username"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
          editable={!isLoading}
          error={errors.username?.message}
        />
        
        {/* Password Input */}
        <ControlledInput
          control={control}
          name="password"
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          editable={!isLoading}
          error={errors.password?.message}
        />
        
        {/* Sign In Button */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          accessibilityLabel="Sign in"
          accessibilityRole="button"
          accessibilityState={{ disabled: isLoading }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
        
        {/* Forgot Password Link */}
        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity 
            style={styles.forgotButton} 
            disabled={isLoading}
            accessibilityLabel="Forgot password"
            accessibilityRole="link"
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </Link>
        
        {/* Sign Up Link */}
        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity 
            style={styles.linkButton} 
            disabled={isLoading}
            accessibilityLabel="Sign up for a new account"
            accessibilityRole="link"
          >
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
      </View>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
  },
  
  // Header
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  
  // Demo Info Box
  infoBox: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  infoDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  // Form Container
  form: {
    width: '100%',
    maxWidth: 400,
  },
  
  // Biometric Login
  biometricButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 52,
    justifyContent: 'center',
  },
  biometricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  biometricText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Separator
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  separatorText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Primary Button
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 52,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Links
  forgotButton: {
    marginTop: 15,
    alignItems: 'center',
    paddingVertical: 5,
  },
  forgotText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 5,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
