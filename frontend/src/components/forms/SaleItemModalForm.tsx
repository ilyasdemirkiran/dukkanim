import React, { useEffect, useMemo } from 'react';
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
import { DiscountType, SaleItem } from '../../types/sale';
import { formatCurrency } from '../../services/api';
import { Scale, PackageCheck } from 'lucide-react-native';

export interface SaleItemFormData {
  productId: string;
  quantity: string;
  discountType: DiscountType;
  discountValue: string;
  vatRate: string;
}

interface SaleItemModalFormProps {
  products: Product[];
  editingItem?: SaleItem | null;
  onSubmit: (data: SaleItemFormData) => void;
  isLoading?: boolean;
  onNavigateToProducts?: () => void;
}

export const SaleItemModalForm: React.FC<SaleItemModalFormProps> = ({
  products,
  editingItem,
  onSubmit,
  isLoading = false,
  onNavigateToProducts,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SaleItemFormData>({
    defaultValues: {
      productId: editingItem?.productId || products[0]?._id || '',
      quantity: editingItem ? String(editingItem.quantity) : '1',
      discountType: editingItem?.discountType || 'PERCENTAGE',
      discountValue: editingItem ? String(editingItem.discountValue) : '0',
      vatRate: editingItem ? String(editingItem.vatRate) : '20',
    },
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        productId: editingItem.productId,
        quantity: String(editingItem.quantity),
        discountType: editingItem.discountType || 'PERCENTAGE',
        discountValue: String(editingItem.discountValue ?? 0),
        vatRate: String(editingItem.vatRate ?? 20),
      });
    } else {
      reset({
        productId: products[0]?._id || '',
        quantity: '1',
        discountType: 'PERCENTAGE',
        discountValue: '0',
        vatRate: '20',
      });
    }
  }, [editingItem, products, reset]);

  const selectedProductId = watch('productId');
  const selectedDiscountType = watch('discountType');

  // Seçilen ürünü ve birim bilgisini anlık tespit etme
  const selectedProduct = useMemo(() => {
    return products.find((p) => p._id === selectedProductId);
  }, [products, selectedProductId]);

  const unitName = useMemo(() => {
    if (selectedProduct) {
      if (typeof selectedProduct.unitId === 'object' && selectedProduct.unitId) {
        return selectedProduct.unitId.name;
      }
    }
    if (editingItem?.unitName) return editingItem.unitName;
    return 'Birim Belirtilmemiş';
  }, [selectedProduct, editingItem]);

  return (
    <View style={styles.container}>
      {/* 1. Ürün Seçimi Dropdown (Düzenleme durumunda ürün sabit veya değiştirilebilir) */}
      <Controller
        control={control}
        name="productId"
        rules={{ required: 'Lütfen bir ürün seçiniz' }}
        render={({ field: { onChange, value } }) => (
          <CustomDropdown
            label="Satılacak Ürün"
            required
            placeholder="Ürün Seçiniz..."
            items={products.map((p) => {
              const uName = typeof p.unitId === 'object' && p.unitId ? p.unitId.name : '-';
              return {
                id: p._id,
                label: p.name,
                subtitle: `Fiyat: ${formatCurrency(p.price)} • Birim: ${uName}`,
              };
            })}
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

      {/* 2. Seçilen Ürünün Birim ve Fiyat Kartı (Kullanıcı Talebi: Mutlaka birimi görünmeli) */}
      <View style={styles.unitInfoCard}>
        <View style={styles.unitBadge}>
          <Scale size={16} color={COLORS.primary} />
          <Text style={styles.unitBadgeLabel}>Ürün Birimi:</Text>
          <Text style={styles.unitBadgeValue}>{unitName}</Text>
        </View>

        {selectedProduct && (
          <View style={styles.priceBadge}>
            <PackageCheck size={16} color={COLORS.positive} />
            <Text style={styles.priceBadgeLabel}>Birim Fiyat:</Text>
            <Text style={styles.priceBadgeValue}>{formatCurrency(selectedProduct.price)}</Text>
          </View>
        )}
      </View>

      {/* 3. Miktar (Yanında birim etiketi ile) & KDV Oranı */}
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>
            Miktar ({unitName}) *
          </Text>
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
                placeholder="Örn: 10"
                placeholderTextColor={COLORS.border}
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
          <Text style={styles.label}>KDV Oranı (%)</Text>
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

      {/* 4. Kalem İndirimi Türü ve Değeri */}
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

      {/* 5. Kaydet / Güncelle Butonu */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => handleSubmit(onSubmit)()}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitBtnText}>
            {editingItem ? 'Kalemi Güncelle' : 'Ürünü Satışa Ekle'}
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
  unitInfoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.surface,
    padding: 10,
    marginBottom: 14,
    gap: 6,
  },
  unitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unitBadgeLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  unitBadgeValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: COLORS.lightBlueBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceBadgeLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priceBadgeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.positive,
  },
  discountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  discountTypeBtn: {
    flex: 1,
    paddingVertical: 9,
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
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
