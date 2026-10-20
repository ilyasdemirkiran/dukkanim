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
import { Product } from '../../types/product';
import { DiscountType } from '../../types/sale';
import { formatCurrency } from '../../services/api';

export interface AddSaleItemFormData {
  productId: string;
  quantity: string;
  discountType: DiscountType;
  discountValue: string;
  vatRate: string;
}

interface AddSaleItemFormProps {
  products: Product[];
  onSubmit: (data: AddSaleItemFormData) => void;
  isLoading?: boolean;
  onNavigateToProducts?: () => void;
}

export const AddSaleItemForm: React.FC<AddSaleItemFormProps> = ({
  products,
  onSubmit,
  isLoading = false,
  onNavigateToProducts,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AddSaleItemFormData>({
    defaultValues: {
      productId: products[0]?._id || '',
      quantity: '1',
      discountType: 'PERCENTAGE',
      discountValue: '0',
      vatRate: '20',
    },
  });

  const selectedDiscountType = watch('discountType');

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Satışa Ürün Ekle</Text>

      {/* Ürün Seçimi Dropdown */}
      <Controller
        control={control}
        name="productId"
        rules={{ required: 'Lütfen bir ürün seçiniz' }}
        render={({ field: { onChange, value } }) => (
          <CustomDropdown
            label="Satılacak Ürün"
            required
            placeholder="Ürün Seçiniz..."
            items={products.map((p) => ({
              id: p._id,
              label: p.name,
              subtitle: `Birim Fiyat: ${formatCurrency(p.price)} • Birim: ${p.unitId?.name || '-'}`,
            }))}
            selectedId={value}
            onSelect={onChange}
            emptyActionText="Ürünler Sekmesinden Ürün Ekle"
            onEmptyAction={onNavigateToProducts}
          />
        )}
      />
      {errors.productId && (
        <Text style={styles.errorText}>{errors.productId.message}</Text>
      )}

      {/* Miktar & KDV Oranı */}
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Miktar *</Text>
          <Controller
            control={control}
            name="quantity"
            rules={{
              required: 'Miktar zorunludur',
              validate: (v) => Number(v) > 0 || 'Miktar 0 dan büyük olmalıdır',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.quantity && styles.inputError]}
                keyboardType="numeric"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
          {errors.quantity && (
            <Text style={styles.errorTextSmall}>{errors.quantity.message}</Text>
          )}
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>KDV (%)</Text>
          <Controller
            control={control}
            name="vatRate"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
        </View>
      </View>

      {/* İndirim Türü ve Değeri */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Kalem İndirimi</Text>
        <Controller
          control={control}
          name="discountType"
          render={({ field: { onChange, value } }) => (
            <View style={styles.discountRow}>
              <TouchableOpacity
                style={[
                  styles.discountTypeBtn,
                  value === 'PERCENTAGE' && styles.discountTypeBtnActive,
                ]}
                onPress={() => onChange('PERCENTAGE')}
              >
                <Text
                  style={[
                    styles.discountTypeText,
                    value === 'PERCENTAGE' && styles.discountTypeTextActive,
                  ]}
                >
                  % Yüzde
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.discountTypeBtn,
                  value === 'AMOUNT' && styles.discountTypeBtnActive,
                ]}
                onPress={() => onChange('AMOUNT')}
              >
                <Text
                  style={[
                    styles.discountTypeText,
                    value === 'AMOUNT' && styles.discountTypeTextActive,
                  ]}
                >
                  Tutar (Kuruş)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <Controller
          control={control}
          name="discountValue"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              keyboardType="numeric"
              placeholder={selectedDiscountType === 'PERCENTAGE' ? 'Örn: 10' : 'Örn: 5000'}
              placeholderTextColor={COLORS.border}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
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
          <Text style={styles.submitBtnText}>Ürünü Satışa Ekle</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surface,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
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
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: -8,
    marginBottom: 10,
    fontWeight: '500',
  },
  errorTextSmall: {
    fontSize: 11,
    color: COLORS.error,
    marginTop: 4,
    fontWeight: '500',
  },
  discountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  discountTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    backgroundColor: '#FFFFFF',
  },
  discountTypeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlueBg,
  },
  discountTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  discountTypeTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.positive,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
