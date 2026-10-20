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
import { COLORS } from '../theme/colors';
import {
  Plus,
  Trash2,
  Users,
  Building2,
  Phone,
  ChevronRight,
  X,
} from 'lucide-react-native';
import { CurrentAccount } from '../types/currentAccount';
import {
  useCurrentAccountsQuery,
  useCreateCurrentAccountMutation,
  useDeleteCurrentAccountMutation,
} from '../services/currentAccountApiHooks';
import { useCurrentCategoriesQuery } from '../services/currentCategoryApiHooks';
import { apiClient } from '../services/api';
import { CreateAccountForm, CreateAccountFormData } from '../components/forms/CreateAccountForm';
import { CurrentAccountDetailScreen } from './CurrentAccountDetailScreen';
import { showToast } from '../services/toast';

export const CurrentAccountsScreen: React.FC = () => {
  // Seçili cari detay ekranı görünümü
  const [selectedAccount, setSelectedAccount] = useState<CurrentAccount | null>(null);

  // Cari Oluşturma Modalı
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [nextCode, setNextCode] = useState<number | null>(null);

  // 1. TanStack Query ile Carileri Çekme (Model Hook)
  const { data: accounts = [], isLoading: loading, refetch } = useCurrentAccountsQuery();

  // 2. TanStack Query ile Kategorileri Çekme (Model Hook)
  const { data: categories = [] } = useCurrentCategoriesQuery();

  // 3. Cari Oluşturma Mutation (Model Hook)
  const createAccountMutation = useCreateCurrentAccountMutation();

  // 4. Cari Silme Mutation (Model Hook)
  const deleteAccountMutation = useDeleteCurrentAccountMutation();

  const handleOpenCreate = async () => {
    setCreateModalVisible(true);
    try {
      const res = await apiClient.get<{ nextCode: number }>('/api/current-accounts/next-code');
      setNextCode(res.data.nextCode);
    } catch {
      setNextCode(null);
    }
  };

  const handleCreateAccount = (formData: CreateAccountFormData) => {
    createAccountMutation.mutate(
      {
        title: formData.title.trim(),
        categoryId: formData.categoryId,
        notes: formData.notes.trim(),
      },
      {
        onSuccess: (newAccount) => {
          setCreateModalVisible(false);
          setSelectedAccount(newAccount);
          showToast.success('Cari Oluşturuldu', `"${newAccount.title}" hesabı açıldı.`);
        },
        onError: (err) => showToast.error('Hata', err.message),
      }
    );
  };

  const handleDeleteAccount = (acc: CurrentAccount) => {
    Alert.alert('Cariyi Sil', `"${acc.title}" silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          deleteAccountMutation.mutate(acc._id, {
            onSuccess: () => {
              showToast.success('Silindi', `"${acc.title}" cari hesabı silindi.`);
            },
            onError: (err) => showToast.error('Hata', err.message),
          });
        },
      },
    ]);
  };

  // Eğer bir cari seçilmişse, detay ve modal düzenleme ekranına geç
  if (selectedAccount) {
    return (
      <CurrentAccountDetailScreen
        account={selectedAccount}
        onBack={() => {
          setSelectedAccount(null);
          refetch();
        }}
        onAccountUpdated={(updated) => setSelectedAccount(updated)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 90 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedAccount(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleGroup}>
                  <View style={styles.iconCircle}>
                    <Users size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {item.code ? (
                        <View style={styles.codeBadge}>
                          <Text style={styles.codeBadgeText}>#{item.code}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.cardTitle}>{item.title}</Text>
                    </View>
                    <View style={styles.catBadge}>
                      <Text style={styles.catBadgeText}>
                        {typeof item.categoryId === 'object' && item.categoryId
                          ? item.categoryId.name
                          : 'Kategorisiz'}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteAccount(item)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              {/* Firma veya İletişim Özeti */}
              <View style={styles.cardSummary}>
                {item.company?.companyName ? (
                  <View style={styles.summaryRow}>
                    <Building2 size={14} color={COLORS.textSecondary} />
                    <Text style={styles.summaryText}>
                      {item.company.companyName} ({item.company.city || '-'}/{item.company.district || '-'})
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.missingBadge}>Firma bilgisi eklenmedi</Text>
                )}

                <View style={styles.summaryRow}>
                  <Phone size={14} color={COLORS.textSecondary} />
                  <Text style={styles.summaryText}>
                    {item.contacts?.length || 0} İletişim Kartı
                  </Text>
                </View>
              </View>

              <View style={styles.cardArrow}>
                <Text style={styles.cardArrowText}>Detay ve İletişim Yönetimi</Text>
                <ChevronRight size={16} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz cari hesap eklenmemiş.</Text>
            </View>
          }
        />
      )}

      {/* FAB: Yeni Cari Ekle */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenCreate} activeOpacity={0.8}>
        <Plus size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Cari Ekle</Text>
      </TouchableOpacity>

      {/* CARİ OLUŞTURMA BOTTOM SHEET MODALI */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottomSheetOverlay}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={() => setCreateModalVisible(false)}
          />

          <View style={styles.bottomSheetContainer}>
            {/* Tutamaç (Drag Handle Indicator) */}
            <View style={styles.handleBarContainer}>
              <View style={styles.handleBar} />
            </View>

            {/* Header */}
            <View style={styles.bottomSheetHeader}>
              <View>
                <Text style={styles.bottomSheetTitle}>Yeni Cari Hesap</Text>
                <Text style={styles.bottomSheetSubtitle}>
                  Müşteri veya tedarikçi hesabı tanımlayın
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCreateModalVisible(false)}
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
              <CreateAccountForm
                categories={categories}
                nextCode={nextCode}
                onSubmit={handleCreateAccount}
                isLoading={createAccountMutation.isPending}
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
  titleGroup: {
    flexDirection: 'row',
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
  codeBadge: {
    backgroundColor: COLORS.lightBlueBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  catBadge: {
    backgroundColor: COLORS.lightBlueBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  catBadgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  cardSummary: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  missingBadge: {
    fontSize: 12,
    color: COLORS.border,
    fontStyle: 'italic',
  },
  cardArrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  cardArrowText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
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
});
