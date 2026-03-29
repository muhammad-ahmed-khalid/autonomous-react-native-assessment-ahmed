import * as yup from 'yup';

export const appSchema = yup.object({
  name: yup
    .string()
    .required('App name is required')
    .min(2, 'App name must be at least 2 characters')
    .max(50, 'App name must not exceed 50 characters'),
  description: yup
    .string()
    .notRequired()
    .max(500, 'Description must not exceed 500 characters'),
  subscriptionStatus: yup
    .string()
    .oneOf(['active', 'inactive', 'trial', 'expired'], 'Invalid subscription status')
    .required('Subscription status is required'),
  logo: yup
    .string()
    .required('App logo is required')
    .test('is-valid-uri', 'Logo must be a valid URL or image', (value) => {
      if (!value) return false;
      // Accept local file URIs (file://, content://, ph://) or valid URLs
      return value.startsWith('file://') || 
             value.startsWith('content://') || 
             value.startsWith('ph://') ||
             /^https?:\/\/.+/.test(value);
    }),
}).required();

export type AppFormData = {
  name: string;
  description?: string;
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'expired';
  logo: string;
};

