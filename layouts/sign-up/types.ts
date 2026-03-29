import { RegisterFormData } from "@/validation/authSchemas";

export interface UseSignupContainerReturn {
  // Form control
  control: any;
  errors: any;
  handleSubmit: any;
  onSubmit: (data: RegisterFormData) => void;

  // Auth state
  isLoading: boolean;
  isAuthenticated: boolean;
}
