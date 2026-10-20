import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useController, Control, FieldValues, Path } from 'react-hook-form';
import { parsePhoneNumberFromString, AsYouType, CountryCode } from 'libphonenumber-js';
import { COLORS } from '../theme/colors';

interface PhoneInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  defaultCountry?: CountryCode;
  required?: boolean;
}

export function FormPhoneInput<T extends FieldValues>({
  name,
  control,
  label = 'Telefon Numarası',
  defaultCountry = 'TR',
  required = false,
  ...textInputProps
}: PhoneInputProps<T>) {
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required: required ? 'Telefon numarası zorunludur' : false,
      validate: (val: string) => {
        if (!val && !required) return true;
        if (!val) return 'Telefon numarası zorunludur';
        try {
          const phoneNumber = parsePhoneNumberFromString(val, defaultCountry);
          if (!phoneNumber || !phoneNumber.isValid()) {
            return 'Geçerli bir telefon numarası giriniz (örn: +90 5XX XXX XX XX)';
          }
          return true;
        } catch {
          return 'Geçersiz telefon formatı';
        }
      },
    },
  });

  const handleChangeText = (text: string) => {
    const asYouType = new AsYouType(defaultCountry);
    const formatted = asYouType.input(text);
    onChange(formatted);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.requiredAsterisk}>*</Text>}
        </Text>
      )}

      <View style={[styles.inputWrapper, error ? styles.inputError : styles.inputNormal]}>
        <View style={styles.countryBadge}>
          <Text style={styles.countryFlag}>🇹🇷 +90</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="555 123 45 67"
          placeholderTextColor={COLORS.border}
          keyboardType="phone-pad"
          value={value || ''}
          onChangeText={handleChangeText}
          onBlur={onBlur}
          {...textInputProps}
        />
      </View>

      {error && <Text style={styles.errorText}>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  inputNormal: {
    borderColor: COLORS.surface,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  countryBadge: {
    backgroundColor: COLORS.background,
    borderRightWidth: 1,
    borderColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  countryFlag: {
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textDark,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});
