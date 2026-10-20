import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { FormPhoneInput } from '../FormPhoneInput';
import { COLORS } from '../../theme/colors';
import { ContactCard } from '../../types/currentAccount';

export interface ContactFormData {
  fullName: string;
  phone: string;
  duty: string;
  description: string;
}

interface ContactModalFormProps {
  initialData?: ContactCard | null;
  onSubmit: (data: ContactFormData) => void;
  isLoading?: boolean;
}

export const ContactModalForm: React.FC<ContactModalFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    defaultValues: {
      fullName: initialData?.fullName || '',
      phone: initialData?.phone || '',
      duty: initialData?.duty || '',
      description: initialData?.description || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName,
        phone: initialData.phone,
        duty: initialData.duty || '',
        description: initialData.description || '',
      });
    } else {
      reset({
        fullName: '',
        phone: '',
        duty: '',
        description: '',
      });
    }
  }, [initialData, reset]);

  return (
    <View style={styles.container}>
      {/* Ad Soyad */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Ad Soyad *</Text>
        <Controller
          control={control}
          name="fullName"
          rules={{ required: 'İletişim kişisi ad-soyad zorunludur' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="Örn: Ahmet Yılmaz"
              placeholderTextColor={COLORS.border}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.fullName && (
          <Text style={styles.errorText}>{errors.fullName.message}</Text>
        )}
      </View>

      {/* Telefon Numarası (libphonenumber-js doğrulamalı FormPhoneInput) */}
      <FormPhoneInput<ContactFormData>
        name="phone"
        control={control}
        label="Telefon Numarası"
        required
      />

      {/* Görev / Yetki */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Görevi / Yetkisi (Opsiyonel)</Text>
        <Controller
          control={control}
          name="duty"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Örn: Muhasebe Sorumlusu, Depo Müdürü..."
              placeholderTextColor={COLORS.border}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      {/* Açıklama */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Açıklama (Opsiyonel)</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Kişi hakkında özel notlar..."
              placeholderTextColor={COLORS.border}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              multiline
            />
          )}
        />
      </View>

      {/* Kaydet Butonu */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => handleSubmit(onSubmit)()}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitBtnText}>
            {initialData ? 'Kişi Kartını Güncelle' : 'Kişi Kartını Ekle'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textDark,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: COLORS.positive,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
