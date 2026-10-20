import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Minus, Edit3, Trash2 } from 'lucide-react-native';
import { useDebouncedCallback } from 'use-debounce';
import { COLORS } from '../theme/colors';
import { formatCurrency } from '../services/api';
import { SaleItem } from '../types/sale';

interface SaleItemRowProps {
  item: SaleItem;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onEdit: (item: SaleItem) => void;
  onDelete: (itemId: string, productName?: string) => void;
}

export const SaleItemRow: React.FC<SaleItemRowProps> = ({
  item,
  onUpdateQuantity,
  onEdit,
  onDelete,
}) => {
  // Local quantity for immediate optimistic UI feedback
  const [localQuantity, setLocalQuantity] = useState<number>(item.quantity);

  // Sync if item from server/parent changes
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  // Debounced server/parent update callback (500ms)
  const debouncedUpdateQuantity = useDebouncedCallback((itemId: string, nextQty: number) => {
    onUpdateQuantity(itemId, nextQty);
  }, 500);

  const handleQuantityChange = (delta: number) => {
    const nextQty = Math.max(1, localQuantity + delta);
    if (nextQty === localQuantity) return;

    setLocalQuantity(nextQty);

    if (item._id) {
      debouncedUpdateQuantity(item._id, nextQty);
    }
  };

  // Local calculation preview for smoother UX
  const estimatedNet = item.unitPrice
    ? (item.netTotal / (item.quantity || 1)) * localQuantity
    : item.netTotal;

  return (
    <View style={styles.cardContainer}>
      {/* 1. Üst Satır: Başlık ve Fiyat Bilgisi */}
      <View style={styles.topRow}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.totalPrice}>{formatCurrency(estimatedNet)}</Text>
      </View>

      {/* 2. İkinci Satır: Adet/Birim Çarpanı ve KDV Dahil İbaresi */}
      <View style={styles.subRow}>
        <Text style={styles.unitMultiplier}>
          {localQuantity} {item.unitName || 'Adet'} × {formatCurrency(item.unitPrice)}
        </Text>
        <Text style={styles.vatIncludedLabel}>KDV Dahil</Text>
      </View>

      {/* 3. Üçüncü Satır: Sol Stepper ve Sağ Aksiyon Butonları (Düzenle / Sil) */}
      <View style={styles.controlsRow}>
        {/* Stepper Buton Kapsayıcısı */}
        <View style={styles.stepperPill}>
          <TouchableOpacity
            style={[styles.stepperActionBtn, localQuantity <= 1 && styles.stepperActionBtnDisabled]}
            onPress={() => handleQuantityChange(-1)}
            activeOpacity={0.65}
            disabled={localQuantity <= 1}
          >
            <Minus size={15} color={localQuantity <= 1 ? '#94A3B8' : '#0B4F6C'} />
          </TouchableOpacity>

          <View style={styles.stepperCenterInfo}>
            <Text style={styles.stepperQtyText}>{localQuantity}</Text>
            <Text style={styles.stepperUnitText}>{item.unitName || 'Adet'}</Text>
          </View>

          <TouchableOpacity
            style={styles.stepperActionBtn}
            onPress={() => handleQuantityChange(1)}
            activeOpacity={0.65}
          >
            <Plus size={15} color="#0B4F6C" />
          </TouchableOpacity>
        </View>

        {/* Aksiyon Butonları (Düzenle & Sil) */}
        <View style={styles.actionsRight}>
          <TouchableOpacity
            onPress={() => onEdit(item)}
            style={styles.iconEditBtn}
            activeOpacity={0.7}
          >
            <Edit3 size={15} color="#0284C7" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => item._id && onDelete(item._id, item.productName)}
            style={styles.iconDeleteBtn}
            activeOpacity={0.7}
          >
            <Trash2 size={15} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* İnce Ayırıcı Çizgi */}
      <View style={styles.divider} />

      {/* 4. Alt Kısım: Noktalı Rozetler (İndirim ve KDV) */}
      <View style={styles.tagsContainer}>
        {/* İndirim Rozeti */}
        <View style={styles.discountPill}>
          <View style={styles.discountDot} />
          <Text style={styles.discountPillText}>
            İndirim:{' '}
            {item.discountType === 'PERCENTAGE'
              ? `%${item.discountValue}`
              : formatCurrency(item.discountValue)}{' '}
            (-{formatCurrency(item.discountAmount)})
          </Text>
        </View>

        {/* KDV Rozeti */}
        <View style={styles.vatPill}>
          <View style={styles.vatDot} />
          <Text style={styles.vatPillText}>
            KDV %{item.vatRate} (+{formatCurrency(item.vatAmount)})
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B4F6C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    paddingRight: 8,
  },
  totalPrice: {
    fontSize: 19,
    fontWeight: '900',
    color: '#10B981', // Canlı Fındık Yeşili
    textAlign: 'right',
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  unitMultiplier: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  vatIncludedLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 6,
  },
  stepperActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperActionBtnDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.5,
  },
  stepperCenterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  stepperQtyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperUnitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  actionsRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconEditBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  iconDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 12,
    marginBottom: 10,
  },
  tagsContainer: {
    gap: 6,
    alignItems: 'flex-start',
  },
  discountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  discountDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E11D48',
  },
  discountPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#E11D48',
  },
  vatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  vatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
  },
  vatPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
  },
});
