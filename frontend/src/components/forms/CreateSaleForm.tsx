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
import { CustomDropdown } from '../CustomDropdown';
import { COLORS } from '../../theme/colors';
import { CurrentAccount } from '../../types/currentAccount';

export interface CreateSaleFormData {
  currentAccountId: string;
  note: string;
}

interface CreateSaleFormProps {
  accounts: CurrentAccount[];
  onSubmit: (data: CreateSaleFormData) => void;
  isLoading?: boolean;
  onNavigateToAccounts?: () => void;
}

export const CreateSaleForm: React.FC<CreateSaleFormProps> = ({
  accounts,
  onSubmit,
  isLoading = false,
  onNavigateToAccounts,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSaleFormData>({
    defaultValues: {
      currentAccountId: accounts[0]?._id || '',
      note: '',
    },
  });

  return (
    <View style={styles.container}>
      {/* Cari Seçimi */}
      <Controller
        control={control}
        name="currentAccountId"
        rules={{ required: 'Lütfen bir cari seçiniz' }}
        render={({ field: { onChange, value } }) => (
          <CustomDropdown
            label="Satış Yapılacak Cari"
            required
            placeholder="Cari Seçiniz..."
            items={accounts.map((acc) => ({
              id: acc._id,
              label: acc.code ? `#${acc.code} - ${acc.title}` : acc.title,
              subtitle: `Kategori: ${acc.categoryId?.name || 'Kategorisiz'}`,
            }))}
            selectedId={value}
            onSelect={onChange}
            emptyActionText="Cariler Sekmesinden Cari Ekle"
            onEmptyAction={onNavigateToAccounts}
          />
        )}
      />
      {errors.currentAccountId && (
        <Text style={styles.errorText}>{errors.currentAccountId.message}</Text>
      )}

      {/* Not Alanı */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Satış Notu (Opsiyonel)</Text>
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Ödeme vadesi, teslim şekli vb..."
              placeholderTextColor={COLORS.border}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              multiline
            />
          )}
        />
      </View>

      {/* Gönder Butonu */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => handleSubmit(onSubmit)()}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitBtnText}>Satışı Başlat ve Ürün Ekle</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
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
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: -8,
    marginBottom: 12,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
