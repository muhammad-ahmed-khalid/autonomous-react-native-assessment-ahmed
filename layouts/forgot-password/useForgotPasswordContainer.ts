/**
 * useForgotPasswordContainer Hook
 * Custom hook for managing forgot password flow including code sending and password reset
 */

import {
  ForgotPasswordEmailFormData,
  forgotPasswordEmailSchema,
  ResetPasswordFormData,
  resetPasswordSchema,
} from "@/validation/authSchemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import { UseForgotPasswordContainerReturn } from "./types";

/**
 * Custom hook for Forgot Password screen business logic
 */
export const useForgotPasswordContainer =
  (): UseForgotPasswordContainerReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);

    // Email form setup
    const emailForm = useForm<ForgotPasswordEmailFormData>({
      resolver: yupResolver(forgotPasswordEmailSchema),
      defaultValues: {
        email: "",
      },
      mode: "onBlur",
    });

    // Reset password form setup
    const resetForm = useForm<ResetPasswordFormData>({
      resolver: yupResolver(resetPasswordSchema),
      defaultValues: {
        resetCode: "",
        newPassword: "",
        confirmPassword: "",
      },
      mode: "onBlur",
    });

    /**
     * Send reset code to email
     */
    const onSendCode = useCallback(
      async (data: ForgotPasswordEmailFormData) => {
        setIsLoading(true);
        // Simulate API call to send reset code
        setTimeout(() => {
          setIsLoading(false);
          setIsCodeSent(true);
          Alert.alert(
            "Success",
            "Reset code sent to your email! (Demo code: 123456)",
          );
        }, 1500);
      },
      [],
    );

    /**
     * Reset password with code verification
     */
    const onResetPassword = useCallback(
      async (data: ResetPasswordFormData) => {
        // Simulate code verification (accept 123456 as valid)
        if (data.resetCode !== "123456") {
          Alert.alert("Error", "Invalid reset code");
          return;
        }

        setIsLoading(true);
        // Simulate API call to reset password
        setTimeout(() => {
          setIsLoading(false);
          Alert.alert(
            "Success",
            "Your password has been reset successfully!",
            [
              {
                text: "OK",
                onPress: () => router.replace("/(auth)/sign-in" as any),
              },
            ],
          );
        }, 1500);
      },
      [],
    );

    /**
     * Handle resend code action
     */
    const handleResendCode = useCallback(() => {
      setIsCodeSent(false);
      resetForm.reset();
    }, [resetForm]);

    return {
      // Email form
      emailForm: {
        control: emailForm.control,
        errors: emailForm.formState.errors,
        handleSubmit: emailForm.handleSubmit,
        reset: emailForm.reset,
      },

      // Reset form
      resetForm: {
        control: resetForm.control,
        errors: resetForm.formState.errors,
        handleSubmit: resetForm.handleSubmit,
        reset: resetForm.reset,
      },

      // State
      isLoading,
      isCodeSent,

      // Actions
      onSendCode,
      onResetPassword,
      handleResendCode,
    };
  };
