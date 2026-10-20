import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { formatCurrency } from '../services/api';
import { Plus, Sliders, Trash2, ArrowLeft, X, Receipt, Edit3, FileText } from 'lucide-react-native';
import { Sale, SaleItem } from '../types/sale';
import {
  useSaleDetailQuery,
  useAddSaleItemMutation,
  useUpdateSaleItemMutation,
  useDeleteSaleItemMutation,
  useApplyBulkSaleMutation,
} from '../services/saleApiHooks';
import { useProductsQuery } from '../services/productApiHooks';
import { SaleItemModalForm, SaleItemFormData } from '../components/forms/SaleItemModalForm';
import { BulkSaleForm, BulkSaleFormData } from '../components/forms/BulkSaleForm';
import { SaleItemRow } from '../components/SaleItemRow';
import { SaleReceiptModal } from '../components/SaleReceiptModal';
import { showToast } from '../services/toast';

interface SaleDetailScreenProps {
  saleId: string;
  onBack: () => void;
  onNavigateToProducts?: () => void;
}

export const SaleDetailScreen: React.FC<SaleDetailScreenProps> = ({
  saleId,
  onBack,
  onNavigateToProducts,
}) => {
  // Modal Durumları
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<SaleItem | null>(null);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);

  // 1. TanStack Query ile Satış Detayını Çekme
  const { data: sale, isLoading: isSaleLoading, refetch } = useSaleDetailQuery(saleId);

  // 2. Ürünleri Çekme (Dropdown için)
  const { data: products = [] } = useProductsQuery();

  // 3. Kalem Ekleme Mutation
  const addItemMutation = useAddSaleItemMutation(saleId);

  // 4. Kalem Güncelleme Mutation
  const updateItemMutation = useUpdateSaleItemMutation(saleId);

  // 5. Kalem Silme Mutation
  const deleteItemMutation = useDeleteSaleItemMutation(saleId);

  // 6. Toplu İndirim / KDV Mutation
  const applyBulkMutation = useApplyBulkSaleMutation(saleId);

  // Modal Açılışları
  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemModalVisible(true);
  };

  const handleOpenEditItem = (item: SaleItem) => {
    setEditingItem(item);
    setItemModalVisible(true);
  };

  // Kalem Kaydetme / Güncelleme İşleyicisi
  const handleSaveItem = (formData: SaleItemFormData) => {
    const payload = {
      productId: formData.productId,
      quantity: Number(formData.quantity) || 1,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue) || 0,
      vatRate: Number(formData.vatRate) || 20,
    };

    if (editingItem && editingItem._id) {
      updateItemMutation.mutate(
        {
          itemId: editingItem._id,
          payload,
        },
        {
          onSuccess: () => {
            setItemModalVisible(false);
            setEditingItem(null);
            refetch();
            showToast.success('Başarılı', 'Kalem güncellendi.');
          },
          onError: (err) => showToast.error('Hata', err.message),
        }
      );
    } else {
      addItemMutation.mutate(payload, {
        onSuccess: () => {
          setItemModalVisible(false);
          refetch();
          showToast.success('Başarılı', 'Ürün faturaya eklendi.');
        },
        onError: (err) => showToast.error('Hata', err.message),
      });
    }
  };

  // Miktar Güncelleme (Debounced Stepper tarafından tetiklenir)
  const handleUpdateItemQuantity = (itemId: string, newQuantity: number) => {
    updateItemMutation.mutate(
      {
        itemId,
        payload: { quantity: newQuantity },
      },
      {
        onSuccess: () => {
          showToast.info('Miktar Güncellendi', `Adet ${newQuantity} olarak ayarlandı.`);
        },
        onError: (err) => {
          showToast.error('Hata', err.message || 'Miktar güncellenemedi.');
        },
      }
    );
  };

  // Kalem Silme İşleyicisi
  const handleDeleteItem = (itemId: string, productName?: string) => {
    Alert.alert('Kalemi Sil', `"${productName || 'Bu kalem'}" faturadan çıkarılsın mı?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          deleteItemMutation.mutate(itemId, {
            onSuccess: () => {
              refetch();
              showToast.success('Silindi', `"${productName || 'Kalem'}" faturadan kaldırıldı.`);
            },
            onError: (err) => showToast.error('Hata', err.message),
          });
        },
      },
    ]);
  };

  // Toplu İndirim/KDV Uygulama İşleyicisi
  const handleApplyBulk = (formData: BulkSaleFormData) => {
    applyBulkMutation.mutate(
      {
        bulkDiscountType: formData.bulkDiscountType,
        bulkDiscountValue: Number(formData.bulkDiscountValue) || 0,
        bulkVatRate: Number(formData.bulkVatRate) || 20,
      },
      {
        onSuccess: () => {
          setBulkModalVisible(false);
          refetch();
          showToast.success('Başarılı', 'Toplu İndirim ve KDV tüm ürünlere uygulandı.');
        },
        onError: (err) => showToast.error('Hata', err.message),
      }
    );
  };

  if (isSaleLoading && !sale) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Satış detayları yükleniyor...</Text>
      </View>
    );
  }

  const cariTitle =
    sale?.currentAccountId?.title || sale?.currentAccountSnapshot?.title || 'Bilinmeyen Cari';

  return (
    <View style={styles.container}>
      {/* Üst Başlık & Geri Çubuğu */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleArea}>
          <View style={styles.headerIconCircle}>
            <Receipt size={18} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.saleNumberText}>{sale?.saleNumber || 'Satış Detayı'}</Text>
            <Text style={styles.cariNameText} numberOfLines={1}>{cariTitle}</Text>
          </View>
        </View>

        {/* Fiş Oluştur Butonu */}
        <TouchableOpacity
          style={styles.headerReceiptBtn}
          onPress={() => setReceiptModalVisible(true)}
          activeOpacity={0.8}
        >
          <FileText size={15} color="#0B4F6C" />
          <Text style={styles.headerReceiptBtnText}>Fiş Oluştur</Text>
        </TouchableOpacity>
      </View>

      {/* Kaydırılabilir Ürün Listesi Bölümü */}
      <View style={styles.scrollWrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Satıştaki Kalemler Başlığı */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Satıştaki Kalemler</Text>
            <Text style={styles.itemCountBadge}>{sale?.items?.length || 0} Kalem</Text>
          </View>

          {sale?.items?.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.noItemsText}>Bu satışta henüz ürün yok.</Text>
              <Text style={styles.noItemsSubText}>Aşağıdaki "Ürün Ekle" butonuna basarak kalem ekleyebilirsiniz.</Text>
            </View>
          ) : (
            sale?.items?.map((item: SaleItem, idx: number) => (
              <SaleItemRow
                key={item._id || idx}
                item={item}
                onUpdateQuantity={handleUpdateItemQuantity}
                onEdit={handleOpenEditItem}
                onDelete={handleDeleteItem}
              />
            ))
          )}
        </ScrollView>
      </View>

      {/* Sabit Alt Panel: Ürün Ekle + Toplu İndirim & KDV ve Toplam Tutar Özeti */}
      <View style={styles.fixedBottomContainer}>
        {/* İşlem Butonları Çubuğu (Toplam Tutarın Hemen Üstünde) */}
        <View style={styles.actionButtonBar}>
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={handleOpenAddItem}
            activeOpacity={0.8}
          >
            <Plus size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonSecondaryText}>Ürün Ekle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => setBulkModalVisible(true)}
            activeOpacity={0.8}
          >
            <Sliders size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonPrimaryText}>Toplu İndirim & KDV</Text>
          </TouchableOpacity>
        </View>

        {/* Fatura Özeti & Sabit Toplam Tutar Kartı */}
        <View style={styles.invoiceSummary}>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Ara Toplam (Brüt):</Text>
            <Text style={styles.summaryVal}>{formatCurrency(sale?.totalGross || 0)}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Toplam İndirim:</Text>
            <Text style={[styles.summaryVal, { color: COLORS.error }]}>
              -{formatCurrency(sale?.totalDiscount || 0)}
            </Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Toplam KDV:</Text>
            <Text style={[styles.summaryVal, { color: COLORS.hover }]}>
              +{formatCurrency(sale?.totalVat || 0)}
            </Text>
          </View>
          <View style={[styles.summaryLine, styles.grandTotalLine]}>
            <Text style={styles.grandTotalLabel}>Ödenecek Tutar:</Text>
            <Text style={styles.grandTotalVal}>{formatCurrency(sale?.grandTotal || 0)}</Text>
          </View>
        </View>
      </View>

      {/* 1. ÜRÜN EKLEME / DÜZENLEME BOTTOM SHEET MODALI */}
      <Modal
        visible={itemModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setItemModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottomSheetOverlay}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={() => setItemModalVisible(false)}
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
                  {editingItem ? 'Kalemi Düzenle' : 'Satışa Ürün Ekle'}
                </Text>
                <Text style={styles.bottomSheetSubtitle}>
                  {editingItem ? 'Miktar, indirim veya KDV oranını güncelleyin' : 'Satış sepetine yeni ürün kalemi ekleyin'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setItemModalVisible(false)}
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
              <SaleItemModalForm
                products={products}
                editingItem={editingItem}
                onSubmit={handleSaveItem}
                isLoading={addItemMutation.isPending || updateItemMutation.isPending}
                onNavigateToProducts={() => {
                  setItemModalVisible(false);
                  if (onNavigateToProducts) onNavigateToProducts();
                }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 2. TOPLU İNDİRİM & TOPLU KDV MODALI */}
      <Modal visible={bulkModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.bulkModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Toplu İndirim & KDV</Text>
              <TouchableOpacity onPress={() => setBulkModalVisible(false)}>
                <X size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <BulkSaleForm
              onSubmit={handleApplyBulk}
              isLoading={applyBulkMutation.isPending}
            />
          </View>
        </View>
      </Modal>

      {/* 3. SATIŞ FİŞİ BOTTOM SHEET MODALI */}
      {sale ? (
        <SaleReceiptModal
          visible={receiptModalVisible}
          sale={sale}
          onClose={() => setReceiptModalVisible(false)}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
    gap: 12,
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  headerTitleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.lightBlueBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  headerReceiptBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0B4F6C',
  },
  saleNumberText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cariNameText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  fixedBottomContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonBar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonSecondaryText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  itemCountBadge: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface,
    marginBottom: 16,
  },
  noItemsText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  noItemsSubText: {
    fontSize: 13,
    color: COLORS.border,
    marginTop: 4,
    textAlign: 'center',
  },
  invoiceSummary: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  summaryVal: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  grandTotalLine: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.positive,
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
  bulkModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
