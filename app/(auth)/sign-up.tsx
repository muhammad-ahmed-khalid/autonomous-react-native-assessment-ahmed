import { StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';
import { ControlledInput } from '@/components/ControlledInput';
import { useSignupContainer } from '@/layouts/sign-up/useSignupContainer';

/**
 * Sign Up Screen
 * Handles user registration with form validation
 */
export default function SignUpScreen() {
  const {
    control,
    errors,
    handleSubmit,
    onSubmit,
    isLoading,
  } = useSignupContainer();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Note: This is a demo using DummyJSON API</Text>
          <Text style={styles.infoDetail}>Registration will log you in with a demo account</Text>
        </View>
        
        <View style={styles.form}>
          <ControlledInput
            control={control}
            name="firstName"
            placeholder="First Name"
            placeholderTextColor="#999"
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="givenName"
            editable={!isLoading}
            error={errors.firstName?.message}
          />
          
          <ControlledInput
            control={control}
            name="lastName"
            placeholder="Last Name"
            autoCorrect={false}
            textContentType="familyName"
            placeholderTextColor="#999"
            autoCapitalize="words"
            editable={!isLoading}
            error={errors.lastName?.message}
          />
          
          <ControlledInput
            control={control}
            autoCorrect={false}
            textContentType="username"
            name="username"
            placeholder="Username"
            placeholderTextColor="#999"
            autoCapitalize="none"
            editable={!isLoading}
            error={errors.username?.message}
          />
          
          <ControlledInput
            control={control}
            name="email"
            autoCorrect={false}
            textContentType="emailAddress"
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            error={errors.email?.message}
          />
          
          <ControlledInput
            autoCorrect={false}
            textContentType="newPassword"
            control={control}
            name="password"
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
            error={errors.password?.message}
          />
          
          <ControlledInput
            autoCorrect={false}
            textContentType="newPassword"
            control={control}
            name="confirmPassword"
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
            error={errors.confirmPassword?.message}
          />
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            accessibilityLabel="Sign up"
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
          
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity 
              style={styles.linkButton} 
              disabled={isLoading}
              accessibilityLabel="Sign in to existing account"
              accessibilityRole="link"
            >
              <Text style={styles.linkText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    alignItems: 'center',
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
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
