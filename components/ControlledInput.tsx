import React from 'react';
import { 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  Text, 
  View 
} from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface ControlledInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  error?: string;
}

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  label,
  error,
  ...textInputProps
}: ControlledInputProps<T>) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            {...textInputProps}
          />
        )}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
