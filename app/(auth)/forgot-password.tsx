import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';
import { ControlledInput } from '@/components/ControlledInput';
import { AuthWrapper } from '@/components/AuthWrapper';
import { useForgotPasswordContainer } from '@/layouts/forgot-password/useForgotPasswordContainer';

/**
 * Forgot Password Screen
 * Handles password reset flow with email verification and code entry
 */
export default function ForgotPasswordScreen() {
  const {
    emailForm,
    resetForm,
    isLoading,
    isCodeSent,
    onSendCode,
    onResetPassword,
    handleResendCode,
  } = useForgotPasswordContainer();

  return (
    <AuthWrapper>
      <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      
      {!isCodeSent ? (
        <>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Enter your email address</Text>
            <Text style={styles.infoDetail}>
              We'll send you a code to reset your password
            </Text>
          </View>
          
          <View style={styles.form}>
            <ControlledInput
              control={emailForm.control}
              name="email"
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              editable={!isLoading}
              error={emailForm.errors.email?.message}
            />
            
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={emailForm.handleSubmit(onSendCode)}
              disabled={isLoading}
              accessibilityLabel="Send reset code"
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Code</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Demo Reset Code: 123456</Text>
            <Text style={styles.infoDetail}>
              Enter the code and your new password
            </Text>
          </View>
          
          <View style={styles.form}>
            <ControlledInput
              control={resetForm.control}
              name="resetCode"
              placeholder="Reset Code"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={6}
              autoCorrect={false}
              textContentType="oneTimeCode"
              editable={!isLoading}
              error={resetForm.errors.resetCode?.message}
            />
            
            <ControlledInput
              control={resetForm.control}
              name="newPassword"
              placeholder="New Password"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              editable={!isLoading}
              error={resetForm.errors.newPassword?.message}
            />
            
            <ControlledInput
              control={resetForm.control}
              name="confirmPassword"
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              editable={!isLoading}
              error={resetForm.errors.confirmPassword?.message}
            />
            
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={resetForm.handleSubmit(onResetPassword)}
              disabled={isLoading}
              accessibilityLabel="Reset password"
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.linkButton} 
              onPress={handleResendCode}
              disabled={isLoading}
              accessibilityLabel="Resend reset code"
              accessibilityRole="button"
            >
              <Text style={styles.linkText}>Resend Code</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      
      <Link href="/(auth)/sign-in" asChild>
        <TouchableOpacity 
          style={styles.backButton} 
          disabled={isLoading}
          accessibilityLabel="Back to sign in"
          accessibilityRole="link"
        >
          <Text style={styles.linkText}>← Back to Sign In</Text>
        </TouchableOpacity>
      </Link>
      </View>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
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
  },
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
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 5,
  },
  backButton: {
    marginTop: 30,
    alignItems: 'center',
    paddingVertical: 5,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
