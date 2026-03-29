import React, { useState } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  Text, 
  View,
  TouchableOpacity,
} from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';

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
  secureTextEntry,
  ...textInputProps
}: ControlledInputProps<T>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = secureTextEntry === true;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input, 
                error && styles.inputError,
                isPasswordField && styles.inputWithIcon,
              ]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry={isPasswordField && !isPasswordVisible}
              {...textInputProps}
            />
          )}
        />
        {isPasswordField && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
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
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputWithIcon: {
    paddingRight: 50,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 5,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
