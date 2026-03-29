import * as yup from 'yup';

export const loginSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export const forgotPasswordEmailSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email'),
});

export const resetPasswordSchema = yup.object({
  resetCode: yup
    .string()
    .required('Reset code is required')
    .length(6, 'Reset code must be 6 digits')
    .matches(/^\d+$/, 'Reset code must be numeric'),
  newPassword: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type ForgotPasswordEmailFormData = yup.InferType<typeof forgotPasswordEmailSchema>;
export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;
