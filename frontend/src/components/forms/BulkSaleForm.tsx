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
import { COLORS } from '../../theme/colors';
import { DiscountType } from '../../types/sale';

export interface BulkSaleFormData {
  bulkDiscountType: DiscountType;
  bulkDiscountValue: string;
  bulkVatRate: string;
}

interface BulkSaleFormProps {
  onSubmit: (data: BulkSaleFormData) => void;
  isLoading?: boolean;
}

export const BulkSaleForm: React.FC<BulkSaleFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const { control, handleSubmit, watch } = useForm<BulkSaleFormData>({
    defaultValues: {
      bulkDiscountType: 'PERCENTAGE',
      bulkDiscountValue: '10',
      bulkVatRate: '20',
    },
  });

  const selectedDiscountType = watch('bulkDiscountType');

  return (
    <View style={styles.container}>
      <Text style={styles.bulkInfo}>
        Bu işlem faturadaki tüm ürün kalemlerine belirlediğiniz oran/tutarları topluca uygular.
      </Text>

      {/* İndirim Türü */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Toplu İndirim Türü</Text>
        <Controller
          control={control}
          name="bulkDiscountType"
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
                  % Yüzde İndirimi
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
                  Sabit Tutar (Kuruş)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* İndirim Değeri & KDV */}
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>
            İndirim ({selectedDiscountType === 'PERCENTAGE' ? '%' : 'Kuruş'})
          </Text>
          <Controller
            control={control}
            name="bulkDiscountValue"
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

        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Toplu KDV Oranı (%)</Text>
          <Controller
            control={control}
            name="bulkVatRate"
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

      {/* Uygula Butonu */}
      <TouchableOpacity
        style={styles.applyBtn}
        onPress={() => handleSubmit(onSubmit)()}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.applyBtnText}>Tüm Kalemlere Uygula ve Hesapla</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  bulkInfo: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
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
  discountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  discountTypeBtn: {
    flex: 1,
    paddingVertical: 10,
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
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  discountTypeTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
