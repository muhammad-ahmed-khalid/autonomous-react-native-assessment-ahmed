import React from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Controller } from 'react-hook-form';
import { ControlledInput } from '@/components/ControlledInput';
import { useAppFormContainer } from '@/layouts/app-form/useAppFormContainer';

export default function AppFormScreen() {
  const {
    loading,
    control,
    errors,
    imageUri,
    uploadingImage,
    isEditMode,
    showImagePickerOptions,
    onSubmit,
    handleSubmit,
    handleBack,
  } = useAppFormContainer();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{isEditMode ? 'Edit App' : 'Create New App'}</Text>
        </View>

        {/* Image Upload Section */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>App Icon</Text>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={showImagePickerOptions}
            disabled={uploadingImage}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.appImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>+</Text>
                <Text style={styles.placeholderSubText}>Add Icon</Text>
              </View>
            )}
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          {errors.logo && <Text style={styles.errorText}>{errors.logo.message}</Text>}
        </View>

        {/* App Name */}
        <View style={styles.formGroup}>
          <ControlledInput
            control={control}
            name="name"
            label="App Name *"
            placeholder="Enter app name"
            error={errors.name?.message}
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <ControlledInput
            control={control}
            name="description"
            label="Description"
            placeholder="Enter description"
            error={errors.description?.message}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
        </View>

        {/* Subscription Status */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Subscription Status *</Text>
          <Controller
            control={control}
            name="subscriptionStatus"
            render={({ field: { onChange, value } }) => (
              <View style={styles.statusButtons}>
                {(['active', 'inactive', 'trial', 'expired'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      value === status && styles.statusButtonActive,
                    ]}
                    onPress={() => onChange(status)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        value === status && styles.statusButtonTextActive,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.subscriptionStatus && (
            <Text style={styles.errorText}>{errors.subscriptionStatus.message}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Update App' : 'Create App'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleBack}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  imageSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginTop: 8,
  },
  appImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 48,
    color: '#999',
  },
  placeholderSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
