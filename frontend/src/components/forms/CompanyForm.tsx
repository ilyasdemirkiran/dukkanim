import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { LocationPicker } from '../LocationPicker';
import { COLORS } from '../../theme/colors';
import { CompanyInfo } from '../../types/currentAccount';

export interface CompanyFormData {
  companyName: string;
  city: string;
  district: string;
  address: string;
  taxNumber: string;
  taxOffice: string;
}

interface CompanyFormProps {
  initialData?: CompanyInfo;
  onSubmit: (data: CompanyFormData) => void;
  isLoading?: boolean;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
  } = useForm<CompanyFormData>({
    defaultValues: {
      companyName: initialData?.companyName || '',
      city: initialData?.city || '',
      district: initialData?.district || '',
      address: initialData?.address || '',
      taxNumber: initialData?.taxNumber || '',
      taxOffice: initialData?.taxOffice || '',
    },
  });

  const cityVal = watch('city');
  const districtVal = watch('district');

  return (
    <View style={styles.container}>
      {/* Firma Resmi Ünvanı */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Resmi Şirket / Firma Ünvanı</Text>
        <Controller
          control={control}
          name="companyName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Örn: Özyurt Zahire Tic. Ltd. Şti."
              placeholderTextColor={COLORS.border}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      {/* İl ve İlçe Seçici */}
      <LocationPicker
        city={cityVal}
        district={districtVal}
        onCityChange={(c) => setValue('city', c)}
        onDistrictChange={(d) => setValue('district', d)}
      />

      {/* Açık Adres */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Açık Adres (Opsiyonel)</Text>
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Cadde, sokak, mahalle, no..."
              placeholderTextColor={COLORS.border}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              multiline
            />
          )}
        />
      </View>

      {/* Vergi No & Vergi Dairesi */}
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Vergi No</Text>
          <Controller
            control={control}
            name="taxNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Vergi Numarası"
                placeholderTextColor={COLORS.border}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Vergi Dairesi</Text>
          <Controller
            control={control}
            name="taxOffice"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Vergi Dairesi"
                placeholderTextColor={COLORS.border}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
        </View>
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
          <Text style={styles.submitBtnText}>Firma Bilgilerini Kaydet</Text>
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
  formRow: {
    flexDirection: 'row',
    gap: 12,
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
  submitBtn: {
    backgroundColor: COLORS.primary,
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
