/**
 * useSignupContainer Hook
 * Custom hook for managing sign-up logic including form handling and authentication
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerUser } from "@/store/slices/authSlice";
import { RegisterFormData, registerSchema } from "@/validation/authSchemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import { UseSignupContainerReturn } from "./types";

/**
 * Custom hook for Sign Up screen business logic
 */
export const useSignupContainer = (): UseSignupContainerReturn => {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  /**
   * Handle form submission with registration data
   */
  const onSubmit = useCallback(
    (data: RegisterFormData) => {
      dispatch(registerUser(data));
    },
    [dispatch],
  );

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
      Alert.alert("Registration Failed", error);
    }
  }, [error]);

  return {
    // Form control
    control,
    errors,
    handleSubmit,
    onSubmit,

    // Auth state
    isLoading,
    isAuthenticated,
  };
};
