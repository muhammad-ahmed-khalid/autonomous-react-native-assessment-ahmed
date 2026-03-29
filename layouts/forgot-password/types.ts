import {
  ForgotPasswordEmailFormData,
  ResetPasswordFormData,
} from "@/validation/authSchemas";

export interface UseForgotPasswordContainerReturn {
  // Email form control
  emailForm: {
    control: any;
    errors: any;
    handleSubmit: any;
    reset: () => void;
  };

  // Reset form control
  resetForm: {
    control: any;
    errors: any;
    handleSubmit: any;
    reset: () => void;
  };

  // State
  isLoading: boolean;
  isCodeSent: boolean;

  // Actions
  onSendCode: (data: ForgotPasswordEmailFormData) => Promise<void>;
  onResetPassword: (data: ResetPasswordFormData) => Promise<void>;
  handleResendCode: () => void;
}
