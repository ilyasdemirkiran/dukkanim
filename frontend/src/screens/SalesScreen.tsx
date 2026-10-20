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
} from 'react-native';
import { formatCurrency } from '../services/api';
import { COLORS } from '../theme/colors';
import {
  Plus,
  Trash2,
  Receipt,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { Sale } from '../types/sale';
import { useSalesQuery, useCreateSaleMutation, useDeleteSaleMutation } from '../services/saleApiHooks';
import { useCurrentAccountsQuery } from '../services/currentAccountApiHooks';
import { CreateSaleForm, CreateSaleFormData } from '../components/forms/CreateSaleForm';
import { SaleDetailScreen } from './SaleDetailScreen';
import { showToast } from '../services/toast';

interface SalesScreenProps {
  onNavigateToAccounts?: () => void;
  onNavigateToProducts?: () => void;
}

export const SalesScreen: React.FC<SalesScreenProps> = ({
  onNavigateToAccounts,
  onNavigateToProducts,
}) => {
  // Seçili satış detay ekranı görünümü
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  // Yeni Satış Başlatma Modalı
  const [createSaleModal, setCreateSaleModal] = useState(false);

  // 1. TanStack Query ile Satışları Çekme (Model Hook)
  const { data: sales = [], isLoading: loading } = useSalesQuery();

  // 2. TanStack Query ile Carileri Çekme (Model Hook)
  const { data: accounts = [] } = useCurrentAccountsQuery();

  // 3. Satış Oluşturma Mutation (Model Hook)
  const createSaleMutation = useCreateSaleMutation();

  // 4. Satış Silme Mutation (Model Hook)
  const deleteSaleMutation = useDeleteSaleMutation();

  const handleOpenCreateSale = () => {
    setCreateSaleModal(true);
  };

  const handleCreateSale = (formData: CreateSaleFormData) => {
    createSaleMutation.mutate(
      {
        currentAccountId: formData.currentAccountId,
        note: formData.note.trim(),
      },
      {
        onSuccess: (newSale) => {
          setCreateSaleModal(false);
          setSelectedSaleId(newSale._id);
          showToast.success('Fatura Oluşturuldu', `"${newSale.saleNumber}" faturası açıldı.`);
        },
        onError: (err) => showToast.error('Hata', err.message),
      }
    );
  };

  const handleDeleteSale = (sale: Sale) => {
    Alert.alert('Satışı Sil', `"${sale.saleNumber}" faturası silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          deleteSaleMutation.mutate(sale._id, {
            onSuccess: () => {
              showToast.success('Silindi', `"${sale.saleNumber}" faturası silindi.`);
            },
            onError: (err) => showToast.error('Hata', err.message),
          });
        },
      },
    ]);
  };

  // Eğer bir satış seçilmişse, ayrı SaleDetailScreen ekranını göster
  if (selectedSaleId) {
    return (
      <SaleDetailScreen
        saleId={selectedSaleId}
        onBack={() => setSelectedSaleId(null)}
        onNavigateToProducts={onNavigateToProducts}
      />
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 90 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedSaleId(item._id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleArea}>
                  <View style={styles.iconCircle}>
                    <Receipt size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.saleNumber}>{item.saleNumber}</Text>
                    <Text style={styles.cariName}>
                      {item.currentAccountId?.title || item.currentAccountSnapshot?.title || 'Bilinmeyen Cari'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteSale(item)}
                  style={styles.deleteSaleBtn}
                >
                  <Trash2 size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.saleStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Ürün Adedi</Text>
                  <Text style={styles.statVal}>{item.items?.length || 0} Kalem</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Toplam İndirim</Text>
                  <Text style={[styles.statVal, { color: COLORS.error }]}>
                    -{formatCurrency(item.totalDiscount)}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Toplam KDV</Text>
                  <Text style={[styles.statVal, { color: COLORS.hover }]}>
                    +{formatCurrency(item.totalVat)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : '-'}
                </Text>
                <View style={styles.totalArea}>
                  <Text style={styles.totalText}>{formatCurrency(item.grandTotal)}</Text>
                  <ChevronRight size={18} color={COLORS.primary} />
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz kaydedilmiş satış bulunmuyor.</Text>
            </View>
          }
        />
      )}

      {/* FAB: Yeni Satış */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenCreateSale} activeOpacity={0.8}>
        <Plus size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Yeni Satış</Text>
      </TouchableOpacity>

      {/* YENİ SATIŞ BAŞLATMA AYRILMIŞ FORM MODALI */}
      <Modal visible={createSaleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Satış Faturası</Text>
              <TouchableOpacity onPress={() => setCreateSaleModal(false)}>
                <X size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <CreateSaleForm
              accounts={accounts}
              onSubmit={handleCreateSale}
              isLoading={createSaleMutation.isPending}
              onNavigateToAccounts={() => {
                setCreateSaleModal(false);
                if (onNavigateToAccounts) onNavigateToAccounts();
              }}
            />
          </View>
        </View>
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
    alignItems: 'center',
  },
  cardTitleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.lightBlueBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saleNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cariName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  deleteSaleBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  saleStats: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  totalArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.positive,
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
});
