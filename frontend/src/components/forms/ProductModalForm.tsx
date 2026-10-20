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
import { CustomDropdown } from '../CustomDropdown';
import { COLORS } from '../../theme/colors';
import { Product, ProductFormData, ProductStatus, Unit } from '../../types/product';
import { tlToKurus } from '../../services/api';
import { showToast } from '../../services/toast';

interface ProductModalFormProps {
  editingProduct?: Product | null;
  units: Unit[];
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    unitId: string;
    stockQuantity: number;
    vatRate: number;
    status: ProductStatus;
  }) => void;
  isLoading?: boolean;
  onNavigateToUnits?: () => void;
}

export const ProductModalForm: React.FC<ProductModalFormProps> = ({
  editingProduct,
  units,
  onSubmit,
  isLoading = false,
  onNavigateToUnits,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      priceTL: '',
      unitId: '',
      stockQuantity: '0',
      vatRate: '20',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (editingProduct) {
      const resolvedUnitId =
        typeof editingProduct.unitId === 'object' && editingProduct.unitId
          ? editingProduct.unitId._id
          : editingProduct.unitId || '';

      reset({
        name: editingProduct.name,
        description: editingProduct.description || '',
        priceTL: ((editingProduct.price || 0) / 100).toString(),
        unitId: resolvedUnitId,
        stockQuantity: String(editingProduct.stockQuantity ?? 0),
        vatRate: String(editingProduct.vatRate ?? 20),
        status: (editingProduct.status as 'ACTIVE' | 'PASSIVE') || 'ACTIVE',
      });
    } else {
      reset({
        name: '',
        description: '',
        priceTL: '',
        unitId: units[0]?._id || '',
        stockQuantity: '0',
        vatRate: '20',
        status: 'ACTIVE',
      });
    }
  }, [editingProduct, units, reset]);

  const onValidSubmit = (data: ProductFormData) => {
    const kurus = tlToKurus(data.priceTL);
    if (isNaN(kurus) || kurus < 0) {
      showToast.warning('Geçersiz Fiyat', 'Lütfen geçerli bir fiyat giriniz.');
      return;
    }

    onSubmit({
      name: data.name.trim(),
      description: data.description.trim(),
      price: kurus,
      unitId: data.unitId,
      stockQuantity: Number(data.stockQuantity) || 0,
      vatRate: Number(data.vatRate) || 20,
      status: data.status,
    });
  };

  return (
    <View style={styles.container}>
      {/* Ürün Adı */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Ürün Adı *</Text>
        <Controller
          control={control}
          name="name"
          rules={{ required: 'Ürün adı zorunludur' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Örn: Ekmeklik Buğday Tip-1"
              placeholderTextColor={COLORS.border}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name.message}</Text>
        )}
      </View>

      {/* Fiyat ve KDV */}
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Fiyat (TL) *</Text>
          <Controller
            control={control}
            name="priceTL"
            rules={{ required: 'Fiyat zorunludur' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.priceTL && styles.inputError]}
                placeholder="850.00"
                placeholderTextColor={COLORS.border}
                keyboardType="decimal-pad"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
          {errors.priceTL && (
            <Text style={styles.errorText}>{errors.priceTL.message}</Text>
          )}
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>KDV Oranı (%)</Text>
          <Controller
            control={control}
            name="vatRate"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="20"
                placeholderTextColor={COLORS.border}
                keyboardType="number-pad"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
        </View>
      </View>

      {/* Birim Seçimi Dropdown */}
      <Controller
        control={control}
        name="unitId"
        rules={{ required: 'Lütfen birim seçiniz' }}
        render={({ field: { onChange, value } }) => (
          <CustomDropdown
            label="Birim Seçimi"
            required
            placeholder="Birim Seçiniz..."
            items={units.map((u) => ({
              id: u._id,
              label: u.name,
            }))}
            selectedId={value}
            onSelect={onChange}
            emptyActionText="Tanımlardan Birim Ekle"
            onEmptyAction={onNavigateToUnits}
          />
        )}
      />
      {errors.unitId && (
        <Text style={[styles.errorText, { marginTop: -8, marginBottom: 12 }]}>
          {errors.unitId.message}
        </Text>
      )}

      {/* Stok Miktarı */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Stok Miktarı</Text>
        <Controller
          control={control}
          name="stockQuantity"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={COLORS.border}
              keyboardType="number-pad"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      {/* Açıklama */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Açıklama</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ürünle ilgili detaylar veya notlar..."
              placeholderTextColor={COLORS.border}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              multiline
            />
          )}
        />
      </View>

      {/* Durum Seçimi */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Durum</Text>
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <View style={styles.statusRow}>
              {(['ACTIVE', 'PASSIVE'] as const).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.statusOption, value === st && styles.statusOptionActive]}
                  onPress={() => onChange(st)}
                >
                  <Text style={[styles.statusOptionText, value === st && styles.statusOptionTextActive]}>
                    {st === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {/* Kaydet Butonu */}
      <TouchableOpacity
        style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]}
        onPress={() => {
          handleSubmit(onValidSubmit)();
        }}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.saveBtnText}>
            {editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Kaydet'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
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
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textDark,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.background,
  },
  statusOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlueBg,
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statusOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
