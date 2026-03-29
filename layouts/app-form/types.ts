import { Control, FieldErrors } from 'react-hook-form';
import { AppFormData } from '@/validation/appSchemas';

export interface UseAppFormContainerReturn {
  // Redux State
  loading: boolean;
  apps: any[];
  
  // Form State
  control: Control<AppFormData>;
  errors: FieldErrors<AppFormData>;
  imageUri: string;
  uploadingImage: boolean;
  isEditMode: boolean;
  existingApp: any | null;
  
  // Handlers
  showImagePickerOptions: () => void;
  onSubmit: (data: AppFormData) => Promise<void>;
  handleSubmit: any;
  handleBack: () => void;
}
