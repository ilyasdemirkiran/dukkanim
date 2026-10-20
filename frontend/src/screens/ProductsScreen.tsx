import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { formatCurrency } from '../services/api';
import { useProductsQuery, useSaveProductMutation, useDeleteProductMutation } from '../services/productApiHooks';
import { useUnitsQuery } from '../services/unitApiHooks';
import { COLORS } from '../theme/colors';
import { Plus, Trash2, Edit3, X, Package, Filter } from 'lucide-react-native';
import { Product, ProductStatus } from '../types/product';
import { showToast } from '../services/toast';
import { ProductModalForm } from '../components/forms/ProductModalForm';

export const ProductsScreen: React.FC = () => {
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('');

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 1. TanStack Query ile Birimleri Çekme (Model Hook)
  const { data: units = [] } = useUnitsQuery();

  // 2. TanStack Query ile Ürünleri Çekme (Model Hook - Filtreli)
  const { data: products = [], isLoading: loading } = useProductsQuery(selectedUnitFilter);

  // 3. Ürün Ekle / Güncelle Mutation (Model Hook)
  const saveMutation = useSaveProductMutation();

  // 4. Ürün Silme (Soft-delete) Mutation (Model Hook)
  const deleteMutation = useDeleteProductMutation();

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setModalVisible(true);
  };

  // Ürün Kaydetme İşleyicisi
  const handleSaveProduct = (payload: {
    name: string;
    description: string;
    price: number;
    unitId: string;
    stockQuantity: number;
    vatRate: number;
    status: ProductStatus;
  }) => {
    const isEdit = !!editingProduct;
    const prodName = payload.name;

    saveMutation.mutate(
      {
        id: editingProduct?._id,
        payload,
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          setEditingProduct(null);
          showToast.success(
            'Başarılı',
            isEdit ? `"${prodName}" güncellendi.` : `"${prodName}" kaydedildi.`
          );
        },
        onError: (err) => showToast.error('Hata', err.message),
      }
    );
  };

  const handleDelete = (prod: Product) => {
    Alert.alert(
      'Ürünü Sil',
      `"${prod.name}" pasif duruma alınıp sistemden kaldırılacak (status=DELETED). Emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(prod._id, {
              onSuccess: () => {
                showToast.success('Silindi', `"${prod.name}" ürünü silindi.`);
              },
              onError: (err) => showToast.error('Hata', err.message),
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Birime Göre Filtre Çubuğu */}
      <View style={styles.filterBar}>
        <Filter size={16} color={COLORS.textSecondary} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedUnitFilter === '' && styles.activeChip]}
            onPress={() => setSelectedUnitFilter('')}
          >
            <Text style={[styles.filterChipText, selectedUnitFilter === '' && styles.activeChipText]}>
              Tüm Birimler
            </Text>
          </TouchableOpacity>
          {units.map((u) => (
            <TouchableOpacity
              key={u._id}
              style={[styles.filterChip, selectedUnitFilter === u._id && styles.activeChip]}
              onPress={() => setSelectedUnitFilter(u._id)}
            >
              <Text style={[styles.filterChipText, selectedUnitFilter === u._id && styles.activeChipText]}>
                {u.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Ürün Listesi */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 90 }}
          renderItem={({ item }) => {
            const unitName = typeof item.unitId === 'object' && item.unitId ? item.unitId.name : '-';
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleArea}>
                    <View style={styles.prodIcon}>
                      <Package size={20} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.prodName}>{item.name}</Text>
                      <Text style={styles.prodUnit}>
                        Birim: <Text style={styles.unitBadge}>{unitName}</Text> • KDV: %{item.vatRate}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.priceTag}>{formatCurrency(item.price)}</Text>
                </View>

                {item.description ? (
                  <Text style={styles.prodDesc}>{item.description}</Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => handleOpenEdit(item)} style={styles.actionBtn}>
                      <Edit3 size={18} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                      <Trash2 size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz ürün bulunmuyor.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenAdd} activeOpacity={0.8}>
        <Plus size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Ürün Ekle</Text>
      </TouchableOpacity>

      {/* Ekleme/Düzenleme Bottom Sheet Modalı */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottomSheetOverlay}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.bottomSheetContainer}>
            {/* Tutamaç (Drag Handle Indicator) */}
            <View style={styles.handleBarContainer}>
              <View style={styles.handleBar} />
            </View>

            {/* Header */}
            <View style={styles.bottomSheetHeader}>
              <View>
                <Text style={styles.bottomSheetTitle}>
                  {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                </Text>
                <Text style={styles.bottomSheetSubtitle}>
                  {editingProduct
                    ? 'Ürün bilgilerini ve birim fiyatını güncelleyin'
                    : 'Katalogunuza yeni ürün veya hizmet tanımlayın'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeIconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.bottomSheetScrollContent}
            >
              <ProductModalForm
                editingProduct={editingProduct}
                units={units}
                onSubmit={handleSaveProduct}
                isLoading={saveMutation.isPending}
                onNavigateToUnits={() => {
                  setModalVisible(false);
                  showToast.info('Birim Tanımlama', 'Lütfen "Tanımlar" sekmesinden yeni bir birim ekleyiniz.');
                }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  prodIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.lightBlueBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prodName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  prodUnit: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  unitBadge: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  priceTag: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.positive, // Fındık Yeşili
  },
  prodDesc: {
    fontSize: 13,
    color: COLORS.textDark,
    marginTop: 8,
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  statusBadge: {
    backgroundColor: COLORS.lightBlueBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.border,
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 79, 108, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bottomSheetTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  bottomSheetSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  closeIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
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
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  statusOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlueBg,
  },
  statusOptionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statusOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
