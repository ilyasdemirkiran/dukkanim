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
import {
  ArrowLeft,
  Building2,
  UserCheck,
  Phone,
  Edit3,
  Plus,
  Trash2,
  X,
  MapPin,
  FileText,
  Users,
  Receipt,
  ChevronRight,
  Calendar,
} from 'lucide-react-native';
import { CurrentAccount, ContactCard } from '../types/currentAccount';
import {
  useUpdateCompanyMutation,
  useAddContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} from '../services/currentAccountApiHooks';
import { useSalesQuery } from '../services/saleApiHooks';
import { SaleDetailScreen } from './SaleDetailScreen';
import { CompanyForm, CompanyFormData } from '../components/forms/CompanyForm';
import { ContactModalForm, ContactFormData } from '../components/forms/ContactModalForm';
import { formatCurrency } from '../services/api';
import { showToast } from '../services/toast';

interface CurrentAccountDetailScreenProps {
  account: CurrentAccount;
  onBack: () => void;
  onAccountUpdated?: (updated: CurrentAccount) => void;
  onNavigateToProducts?: () => void;
}

export const CurrentAccountDetailScreen: React.FC<CurrentAccountDetailScreenProps> = ({
  account: initialAccount,
  onBack,
  onAccountUpdated,
  onNavigateToProducts,
}) => {
  const [account, setAccount] = useState<CurrentAccount>(initialAccount);
  const [activeTab, setActiveTab] = useState<'info' | 'sales'>('info');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  // Bu cariye ait satışlar
  const { data: sales = [], isLoading: isSalesLoading } = useSalesQuery({
    currentAccountId: account._id,
  });

  // Modallar
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactCard | null>(null);

  // Mutations
  const updateCompanyMutation = useUpdateCompanyMutation();
  const addContactMutation = useAddContactMutation();
  const updateContactMutation = useUpdateContactMutation();
  const deleteContactMutation = useDeleteContactMutation();

  const syncAccount = (updated: CurrentAccount) => {
    setAccount(updated);
    if (onAccountUpdated) onAccountUpdated(updated);
  };

  // Firma Bilgilerini Kaydetme
  const handleSaveCompany = (formData: CompanyFormData) => {
    updateCompanyMutation.mutate(
      {
        accountId: account._id,
        company: formData,
      },
      {
        onSuccess: (updated) => {
          syncAccount(updated);
          setCompanyModalVisible(false);
          showToast.success('Başarılı', 'Firma bilgileri güncellendi.');
        },
        onError: (err) => showToast.error('Hata', err.message),
      }
    );
  };

  // Yeni İletişim Kartı Açma
  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactModalVisible(true);
  };

  // İletişim Kartı Düzenleme Açma
  const handleOpenEditContact = (contact: ContactCard) => {
    setEditingContact(contact);
    setContactModalVisible(true);
  };

  // İletişim Kartı Kaydetme / Güncelleme
  const handleSaveContact = (formData: ContactFormData) => {
    if (editingContact && editingContact._id) {
      updateContactMutation.mutate(
        {
          accountId: account._id,
          contactId: editingContact._id,
          contact: formData,
        },
        {
          onSuccess: (updated) => {
            syncAccount(updated);
            setContactModalVisible(false);
            setEditingContact(null);
            showToast.success('Başarılı', 'İletişim kartı güncellendi.');
          },
          onError: (err) => showToast.error('Hata', err.message),
        }
      );
    } else {
      addContactMutation.mutate(
        {
          accountId: account._id,
          contact: formData,
        },
        {
          onSuccess: (updated) => {
            syncAccount(updated);
            setContactModalVisible(false);
            showToast.success('Başarılı', 'İletişim kartı başarıyla eklendi.');
          },
          onError: (err) => showToast.error('Hata', err.message),
        }
      );
    }
  };

  // İletişim Kartı Silme
  const handleDeleteContact = (contactId: string, contactName: string) => {
    Alert.alert('Kişiyi Sil', `"${contactName}" silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          deleteContactMutation.mutate(
            {
              accountId: account._id,
              contactId,
            },
            {
              onSuccess: (updated) => {
                syncAccount(updated);
                showToast.success('Silindi', `"${contactName}" silindi.`);
              },
              onError: (err) => showToast.error('Hata', err.message),
            }
          );
        },
      },
    ]);
  };

  const categoryName =
    typeof account.categoryId === 'object' && account.categoryId
      ? account.categoryId.name
      : 'Kategorisiz';

  if (selectedSaleId) {
    return (
      <SaleDetailScreen
        saleId={selectedSaleId}
        onBack={() => setSelectedSaleId(null)}
        onNavigateToProducts={onNavigateToProducts}
      />
    );
  }

  // Cariye ait toplam satış cirosu
  const totalSalesRevenue = sales.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);

  return (
    <View style={styles.container}>
      {/* Üst Başlık & Geri Çubuğu */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleArea}>
          <View style={styles.headerIconCircle}>
            <Users size={18} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {account.code ? (
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>#{account.code}</Text>
                </View>
              ) : null}
              <Text style={styles.titleText} numberOfLines={1}>{account.title}</Text>
            </View>
            <Text style={styles.categoryText}>Kategori: {categoryName}</Text>
          </View>
        </View>
      </View>

      {/* Tab Değiştirici (Segmented Control) */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'info' && styles.tabItemActive]}
          onPress={() => setActiveTab('info')}
          activeOpacity={0.8}
        >
          <Building2 size={16} color={activeTab === 'info' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
            Bilgiler & İletişim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'sales' && styles.tabItemActive]}
          onPress={() => setActiveTab('sales')}
          activeOpacity={0.8}
        >
          <Receipt size={16} color={activeTab === 'sales' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'sales' && styles.tabTextActive]}>
            Satışlar ({sales.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'info' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 1. BÖLÜM: FİRMA BİLGİLERİ GÖRÜNTÜLEME */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleGroup}>
                <Building2 size={20} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Firma Bilgileri</Text>
              </View>
              <TouchableOpacity
                style={styles.editActionBtn}
                onPress={() => setCompanyModalVisible(true)}
                activeOpacity={0.8}
              >
                <Edit3 size={15} color={COLORS.primary} />
                <Text style={styles.editActionBtnText}>
                  {account.company?.companyName ? 'Düzenle' : 'Firma Ekle'}
                </Text>
              </TouchableOpacity>
            </View>

            {account.company?.companyName ? (
              <View style={styles.infoContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Firma Ünvanı:</Text>
                  <Text style={styles.infoValueBold}>{account.company.companyName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>İl / İlçe:</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MapPin size={14} color={COLORS.primary} />
                    <Text style={styles.infoValue}>
                      {account.company.city || '-'} / {account.company.district || '-'}
                    </Text>
                  </View>
                </View>

                {account.company.address ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Açık Adres:</Text>
                    <Text style={[styles.infoValue, { flex: 1 }]}>{account.company.address}</Text>
                  </View>
                ) : null}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Vergi Dairesi / No:</Text>
                  <Text style={styles.infoValue}>
                    {account.company.taxOffice || '-'} • {account.company.taxNumber || '-'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyCardBox}>
                <Text style={styles.emptyCardText}>Henüz firma bilgisi eklenmedi.</Text>
                <TouchableOpacity
                  style={styles.addMiniActionBtn}
                  onPress={() => setCompanyModalVisible(true)}
                >
                  <Plus size={14} color={COLORS.primary} />
                  <Text style={styles.addMiniActionBtnText}>Firma Bilgisi Ekle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 2. BÖLÜM: İLETİŞİM KİŞİLERİ KARTLARI GÖRÜNTÜLEME */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleGroup}>
                <UserCheck size={20} color={COLORS.primary} />
                <Text style={styles.cardTitle}>
                  İletişim Kişileri ({account.contacts?.length || 0})
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addContactActionBtn}
                onPress={handleOpenAddContact}
                activeOpacity={0.8}
              >
                <Plus size={15} color="#FFFFFF" />
                <Text style={styles.addContactActionBtnText}>Kişi Ekle</Text>
              </TouchableOpacity>
            </View>

            {account.contacts?.length === 0 ? (
              <View style={styles.emptyCardBox}>
                <Text style={styles.emptyCardText}>Henüz iletişim kişisi eklenmedi.</Text>
              </View>
            ) : (
              account.contacts?.map((contact, idx) => (
                <View key={contact._id || idx} style={styles.contactItemCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{contact.fullName}</Text>
                    {contact.duty ? (
                      <Text style={styles.contactDuty}>{contact.duty}</Text>
                    ) : null}

                    <View style={styles.contactPhoneRow}>
                      <Phone size={14} color={COLORS.primary} />
                      <Text style={styles.contactPhoneText}>{contact.phone}</Text>
                    </View>

                    {contact.description ? (
                      <Text style={styles.contactDescText}>{contact.description}</Text>
                    ) : null}
                  </View>

                  <View style={styles.contactItemActions}>
                    <TouchableOpacity
                      onPress={() => handleOpenEditContact(contact)}
                      style={styles.contactEditBtn}
                    >
                      <Edit3 size={15} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteContact(contact._id || '', contact.fullName)}
                      style={styles.contactDeleteBtn}
                    >
                      <Trash2 size={15} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* 3. BÖLÜM: CARİ NOTLARI */}
          {account.notes ? (
            <View style={styles.card}>
              <View style={styles.cardTitleGroup}>
                <FileText size={18} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Cari Notları</Text>
              </View>
              <Text style={styles.notesText}>{account.notes}</Text>
            </View>
          ) : null}
        </ScrollView>
      ) : (
        /* SATIŞLAR TABI: MÜŞTERİYE AİT TÜM SATIŞLARIN LİSTESİ */
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Toplam Satış Özeti Kartı */}
          <View style={styles.salesSummaryBanner}>
            <View>
              <Text style={styles.summaryBannerSub}>Toplam Satış Hacmi</Text>
              <Text style={styles.summaryBannerAmount}>{formatCurrency(totalSalesRevenue)}</Text>
            </View>
            <View style={styles.summaryBannerCountBadge}>
              <Receipt size={16} color="#0B4F6C" />
              <Text style={styles.summaryBannerCountText}>{sales.length} Fatura / Sipariş</Text>
            </View>
          </View>

          {isSalesLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 32 }} />
          ) : sales.length === 0 ? (
            <View style={styles.emptySalesContainer}>
              <Receipt size={42} color={COLORS.surface} />
              <Text style={styles.emptySalesTitle}>Kayıtlı Satış Bulunamadı</Text>
              <Text style={styles.emptySalesSubtitle}>
                Bu cari hesaba ait henüz herhangi bir satış işlemi oluşturulmamış.
              </Text>
            </View>
          ) : (
            sales.map((sale) => (
              <TouchableOpacity
                key={sale._id}
                style={styles.saleItemCard}
                onPress={() => setSelectedSaleId(sale._id)}
                activeOpacity={0.8}
              >
                <View style={styles.saleCardTop}>
                  <View style={styles.saleNumberGroup}>
                    <View style={styles.saleIconBox}>
                      <Receipt size={18} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.saleNumberText}>{sale.saleNumber}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Calendar size={12} color="#94A3B8" />
                        <Text style={styles.saleDateText}>
                          {new Date(sale.createdAt || sale.date).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.saleTotalBox}>
                    <Text style={styles.saleTotalText}>{formatCurrency(sale.grandTotal)}</Text>
                    <View
                      style={[
                        styles.saleStatusBadge,
                        sale.status === 'COMPLETED'
                          ? styles.statusBadgeCompleted
                          : styles.statusBadgeDraft,
                      ]}
                    >
                      <Text
                        style={[
                          styles.saleStatusText,
                          sale.status === 'COMPLETED'
                            ? styles.statusTextCompleted
                            : styles.statusTextDraft,
                        ]}
                      >
                        {sale.status === 'COMPLETED' ? 'Tamamlandı' : 'Açık / Taslak'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Satış Detay İstatistikleri */}
                <View style={styles.saleStatsRow}>
                  <View style={styles.saleStatPill}>
                    <Text style={styles.saleStatLabel}>Kalem:</Text>
                    <Text style={styles.saleStatVal}>{sale.items?.length || 0} Adet</Text>
                  </View>
                  {sale.totalDiscount > 0 ? (
                    <View style={styles.saleStatPill}>
                      <Text style={styles.saleStatLabel}>İndirim:</Text>
                      <Text style={[styles.saleStatVal, { color: COLORS.error }]}>
                        -{formatCurrency(sale.totalDiscount)}
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.saleStatPill}>
                    <Text style={styles.saleStatLabel}>KDV:</Text>
                    <Text style={[styles.saleStatVal, { color: COLORS.hover }]}>
                      +{formatCurrency(sale.totalVat)}
                    </Text>
                  </View>
                </View>

                {/* Detay Ok Çubuğu */}
                <View style={styles.saleCardFooter}>
                  <Text style={styles.saleCardFooterText}>Satış Detayını ve Kalemleri Gör</Text>
                  <ChevronRight size={15} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* FİRMA BİLGİLERİ DÜZENLEME BOTTOM SHEET MODALI */}
      <Modal
        visible={companyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCompanyModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottomSheetOverlay}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={() => setCompanyModalVisible(false)}
          />

          <View style={styles.bottomSheetContainer}>
            {/* Tutamaç (Drag Handle Indicator) */}
            <View style={styles.handleBarContainer}>
              <View style={styles.handleBar} />
            </View>

            {/* Header */}
            <View style={styles.bottomSheetHeader}>
              <View>
                <Text style={styles.bottomSheetTitle}>Firma Bilgilerini Düzenle</Text>
                <Text style={styles.bottomSheetSubtitle}>
                  Vergi dairesi, VKN ve adres bilgilerini güncelleyin
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCompanyModalVisible(false)}
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
              <CompanyForm
                initialData={account.company}
                onSubmit={handleSaveCompany}
                isLoading={updateCompanyMutation.isPending}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* İLETİŞİM KİŞİSİ EKLEME / DÜZENLEME BOTTOM SHEET MODALI */}
      <Modal
        visible={contactModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setContactModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottomSheetOverlay}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={() => setContactModalVisible(false)}
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
                  {editingContact ? 'İletişim Kişisini Düzenle' : 'Yeni İletişim Kartı'}
                </Text>
                <Text style={styles.bottomSheetSubtitle}>
                  Yetkili kişi adı, unvanı ve telefon numarasını girin
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setContactModalVisible(false)}
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
              <ContactModalForm
                initialData={editingContact}
                onSubmit={handleSaveContact}
                isLoading={addContactMutation.isPending || updateContactMutation.isPending}
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
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
    gap: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItemActive: {
    backgroundColor: COLORS.lightBlueBg,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  salesSummaryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B4F6C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryBannerSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  summaryBannerAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.positive,
  },
  summaryBannerCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  summaryBannerCountText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0B4F6C',
  },
  emptySalesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surface,
    gap: 8,
    marginTop: 8,
  },
  emptySalesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 6,
  },
  emptySalesSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  saleItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  saleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  saleNumberGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  saleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saleNumberText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  saleDateText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  saleTotalBox: {
    alignItems: 'flex-end',
  },
  saleTotalText: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.positive,
  },
  saleStatusBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeCompleted: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeDraft: {
    backgroundColor: '#FFFBEB',
  },
  saleStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  statusTextCompleted: {
    color: '#059669',
  },
  statusTextDraft: {
    color: '#D97706',
  },
  saleStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  saleStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saleStatLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  saleStatVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  saleCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  saleCardFooterText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  cardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  editActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.lightBlueBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addContactActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addContactActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoContent: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  infoValueBold: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  emptyCardBox: {
    paddingVertical: 14,
    alignItems: 'center',
    gap: 8,
  },
  emptyCardText: {
    fontSize: 13,
    color: COLORS.border,
  },
  addMiniActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.lightBlueBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addMiniActionBtnText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  contactItemCard: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.surface,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  contactDuty: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  contactPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contactPhoneText: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  contactDescText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  contactItemActions: {
    flexDirection: 'row',
    gap: 6,
  },
  contactEditBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  contactDeleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  notesText: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 18,
    marginTop: 8,
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
