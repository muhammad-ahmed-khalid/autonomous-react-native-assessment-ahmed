/**
 * useSignIn Hook
 * Custom hook for managing sign-in logic including form handling,
 * authentication, and biometric login functionality
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser, loginWithBiometric } from "@/store/slices/authSlice";
import type { User } from "@/types/auth";
import {
  checkBiometricAvailability,
  isBiometricLoginEnabled,
  loginWithBiometrics,
  promptEnableBiometrics,
} from "@/utils/biometricAuth";
import { LoginFormData, loginSchema } from "@/validation/authSchemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import { BiometricState, UseSignInReturn } from "./types";

/**
 * Custom hook for Sign In screen business logic
 */
export const useSignInContainer = (): UseSignInReturn => {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user, token } = useAppSelector(
    (state) => state.auth,
  );

  // Biometric state
  const [biometricState, setBiometricState] = useState<BiometricState>({
    isAvailable: false,
    isEnabled: false,
    type: "Biometric",
    isLoading: false,
  });

  // Track previous authentication state for biometric prompt
  const [previousAuthState, setPreviousAuthState] = useState(false);

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  /**
   * Check biometric availability and enabled status
   */
  const checkBiometrics = useCallback(async () => {
    try {
      const { isAvailable, biometricType } = await checkBiometricAvailability();

      let isEnabled = false;
      if (isAvailable) {
        isEnabled = await isBiometricLoginEnabled();
      }

      setBiometricState({
        isAvailable,
        isEnabled,
        type: biometricType,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error checking biometrics:", error);
      setBiometricState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Handle form submission with credentials
   */
  const onSubmit = useCallback(
    (data: LoginFormData) => {
      dispatch(loginUser(data));
    },
    [dispatch],
  );

  /**
   * Handle biometric authentication login
   */
  const handleBiometricLogin = useCallback(async () => {
    setBiometricState((prev) => ({ ...prev, isLoading: true }));

    try {
      const credentials = await loginWithBiometrics();

      if (credentials) {
        // Dispatch biometric login action with retrieved credentials
        dispatch(loginWithBiometric(credentials));
      }
    } catch (error) {
      console.error("Biometric login error:", error);
      Alert.alert(
        "Authentication Error",
        "An unexpected error occurred during biometric authentication.",
      );
    } finally {
      setBiometricState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [dispatch]);

  /**
   * Prompt for biometric enrollment after successful login
   */
  const handleBiometricPrompt = useCallback(
    async (
      authState: boolean,
      userData: User | null,
      authToken: string | null,
    ) => {
      // Check if login just succeeded (transition from false to true)
      if (authState && !previousAuthState && userData && authToken) {
        await promptEnableBiometrics(userData, authToken);
        // Refresh biometric status after enrollment prompt
        await checkBiometrics();
      }
      setPreviousAuthState(authState);
    },
    [previousAuthState, checkBiometrics],
  );

  /**
   * Initialize biometric check on mount
   */
  useEffect(() => {
    checkBiometrics();
  }, [checkBiometrics]);

  /**
   * Navigate to app when authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(app)/(tabs)" as any);
    }
  }, [isAuthenticated]);

  /**
   * Display error alerts
   */
  useEffect(() => {
    if (error) {
      Alert.alert("Login Failed", error);
    }
  }, [error]);

  /**
   * Handle biometric enrollment prompt after successful login
   */
  useEffect(() => {
    handleBiometricPrompt(isAuthenticated, user, token);
  }, [isAuthenticated, user, token, handleBiometricPrompt]);

  return {
    // Form control
    control,
    errors,
    handleSubmit,
    onSubmit,

    // Auth state
    isLoading,
    isAuthenticated,

    // Biometric
    biometric: biometricState,
    handleBiometricLogin,
  };
};
