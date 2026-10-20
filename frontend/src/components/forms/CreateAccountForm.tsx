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
import { CurrentCategory } from '../../types/currentAccount';

export interface CreateAccountFormData {
  title: string;
  categoryId: string;
  notes: string;
}

interface CreateAccountFormProps {
  categories: CurrentCategory[];
  nextCode?: number | null;
  onSubmit: (data: CreateAccountFormData) => void;
  isLoading?: boolean;
}

export const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  categories,
  nextCode,
  onSubmit,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    defaultValues: {
      title: '',
      categoryId: categories[0]?._id || '',
      notes: '',
    },
  });

  const selectedCategoryId = watch('categoryId');
  const selectedCat = categories.find((c) => c._id === selectedCategoryId);

  return (
    <View style={styles.container}>
      {/* Cari Ünvanı */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Cari Ünvanı / Adı (İsteğe Bağlı)</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder={
                selectedCat
                  ? `Boş bırakılırsa: "${selectedCat.name} #${nextCode || 1}"`
                  : 'Örn: Ahmet Zahirecilik'
              }
              placeholderTextColor={COLORS.border}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        <Text style={styles.helperText}>
          Boş bırakırsanız sistem kategori adıyla otomatik ünvan atar.
        </Text>
      </View>

      {/* Kategori Seçimi */}
      <Controller
        control={control}
        name="categoryId"
        rules={{ required: 'Lütfen cari kategorisi seçiniz' }}
        render={({ field: { onChange, value } }) => (
          <CustomDropdown
            label="Cari Kategorisi"
            required
            placeholder="Kategori Seçiniz..."
            items={categories.map((c) => ({
              id: c._id,
              label: c.name,
              subtitle: c.description,
            }))}
            selectedId={value}
            onSelect={onChange}
          />
        )}
      />
      {errors.categoryId && (
        <Text style={styles.errorText}>{errors.categoryId.message}</Text>
      )}

      {/* Notlar */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Notlar (Opsiyonel)</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Cari hakkında özel notlar..."
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
          <Text style={styles.submitBtnText}>Cariyi Oluştur</Text>
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
  helperText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
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
    marginBottom: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
