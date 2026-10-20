import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { Plus, Trash2, Edit3, X, Tag } from 'lucide-react-native';
import { Unit } from '../types/product';
import { CurrentCategory } from '../types/currentAccount';
import { useUnitsQuery, useSaveUnitMutation, useDeleteUnitMutation } from '../services/unitApiHooks';
import {
  useCurrentCategoriesQuery,
  useSaveCurrentCategoryMutation,
  useDeleteCurrentCategoryMutation,
} from '../services/currentCategoryApiHooks';
import { showToast } from '../services/toast';

export const CategoriesAndUnitsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'units' | 'categories'>('units');

  // Modal Durumları
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Unit | CurrentCategory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // 1. Birimler Query & Mutations
  const { data: units = [], isLoading: isUnitsLoading } = useUnitsQuery();
  const saveUnitMutation = useSaveUnitMutation();
  const deleteUnitMutation = useDeleteUnitMutation();

  // 2. Cari Kategorileri Query & Mutations
  const { data: categories = [], isLoading: isCategoriesLoading } = useCurrentCategoriesQuery();
  const saveCategoryMutation = useSaveCurrentCategoryMutation();
  const deleteCategoryMutation = useDeleteCurrentCategoryMutation();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setModalVisible(true);
  };

  const handleOpenEdit = (item: Unit | CurrentCategory) => {
    setEditingItem(item);
    setName(item.name);
    setDescription((item as CurrentCategory).description || '');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToast.warning('Eksik Bilgi', 'Lütfen bir isim giriniz.');
      return;
    }

    if (activeTab === 'units') {
      saveUnitMutation.mutate(
        { id: editingItem?._id, name: name.trim() },
        {
          onSuccess: () => {
            setModalVisible(false);
            showToast.success('Başarılı', editingItem ? 'Birim güncellendi.' : 'Yeni birim eklendi.');
          },
          onError: (err) => showToast.error('İşlem Başarısız', err.message),
        }
      );
    } else {
      saveCategoryMutation.mutate(
        { id: editingItem?._id, name: name.trim(), description: description.trim() },
        {
          onSuccess: () => {
            setModalVisible(false);
            showToast.success('Başarılı', editingItem ? 'Kategori güncellendi.' : 'Yeni kategori eklendi.');
          },
          onError: (err) => showToast.error('İşlem Başarısız', err.message),
        }
      );
    }
  };

  const handleDelete = (id: string, itemName: string) => {
    Alert.alert('Silme Onayı', `"${itemName}" silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          if (activeTab === 'units') {
            deleteUnitMutation.mutate(id, {
              onSuccess: () => {
                showToast.success('Silindi', `"${itemName}" birimi silindi.`);
              },
              onError: (err) => showToast.error('Silinemedi', err.message),
            });
          } else {
            deleteCategoryMutation.mutate(id, {
              onSuccess: () => {
                showToast.success('Silindi', `"${itemName}" kategorisi silindi.`);
              },
              onError: (err) => showToast.error('Silinemedi', err.message),
            });
          }
        },
      },
    ]);
  };

  const currentList = activeTab === 'units' ? units : categories;
  const isLoading = activeTab === 'units' ? isUnitsLoading : isCategoriesLoading;

  return (
    <View style={styles.container}>
      {/* Üst Sekmeler */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'units' && styles.activeTabButton]}
          onPress={() => setActiveTab('units')}
        >
          <Text style={[styles.tabText, activeTab === 'units' && styles.activeTabText]}>
            Birimler ({units.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'categories' && styles.activeTabButton]}
          onPress={() => setActiveTab('categories')}
        >
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
            Cari Kategorileri ({categories.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.iconCircle}>
                  <Tag size={18} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleOpenEdit(item)} style={styles.actionBtn}>
                  <Edit3 size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id, item.name)} style={styles.actionBtn}>
                  <Trash2 size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz kayıt bulunmuyor.</Text>
            </View>
          }
        />
      )}

      {/* Ekleme Butonu */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenAdd} activeOpacity={0.8}>
        <Plus size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>
          {activeTab === 'units' ? 'Birim Ekle' : 'Kategori Ekle'}
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Düzenle' : activeTab === 'units' ? 'Yeni Birim' : 'Yeni Cari Kategori'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {activeTab === 'units' ? 'Birim Adı *' : 'Kategori Adı *'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={activeTab === 'units' ? 'Örn: Kg, Çuval, Ton' : 'Örn: Müstahsil, Fabrika'}
                placeholderTextColor={COLORS.border}
                value={name}
                onChangeText={setName}
              />
            </View>

            {activeTab === 'categories' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Açıklama (Opsiyonel)</Text>
                <TextInput
                  style={[styles.input, { height: 70 }]}
                  placeholder="Kategori hakkında kısa bilgi"
                  placeholderTextColor={COLORS.border}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saveUnitMutation.isPending || saveCategoryMutation.isPending}
            >
              {saveUnitMutation.isPending || saveCategoryMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Kaydet</Text>
              )}
            </TouchableOpacity>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.lightBlueBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  itemDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
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
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  formGroup: {
    marginBottom: 14,
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
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
