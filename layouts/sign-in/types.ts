import { LoginFormData } from "@/validation/authSchemas";

export interface BiometricState {
  isAvailable: boolean;
  isEnabled: boolean;
  type: string;
  isLoading: boolean;
}

export interface UseSignInReturn {
  // Form control
  control: any;
  errors: any;
  handleSubmit: any;
  onSubmit: (data: LoginFormData) => void;

  // Auth state
  isLoading: boolean;
  isAuthenticated: boolean;

  // Biometric state
  biometric: BiometricState;
  handleBiometricLogin: () => Promise<void>;
}
