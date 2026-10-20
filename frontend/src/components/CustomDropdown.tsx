import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { ChevronDown, Search, X, Check, AlertCircle } from 'lucide-react-native';

export interface DropdownItem {
  id: string;
  label: string;
  subtitle?: string;
}

interface CustomDropdownProps {
  label: string;
  items: DropdownItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  required?: boolean;
  emptyActionText?: string;
  onEmptyAction?: () => void;
  searchable?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  items,
  selectedId,
  onSelect,
  placeholder = 'Seçiniz...',
  required = false,
  emptyActionText,
  onEmptyAction,
  searchable = true,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedItem = items.find((it) => it.id === selectedId);

  const filteredItems = items.filter(
    (it) =>
      it.label.toLowerCase().includes(search.toLowerCase()) ||
      (it.subtitle && it.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.requiredAsterisk}>*</Text>}
      </Text>

      {/* Açılır Tetikleyici Buton */}
      <TouchableOpacity
        style={[
          styles.triggerButton,
          selectedItem ? styles.triggerButtonSelected : null,
        ]}
        onPress={() => {
          setSearch('');
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedItem && styles.triggerTextPlaceholder,
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <ChevronDown size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {/* Eğer henüz kayıt yoksa gösterilen bilgilendirme & hızlı ekleme */}
      {items.length === 0 && (
        <View style={styles.emptyWarningBox}>
          <AlertCircle size={14} color={COLORS.warning} />
          <Text style={styles.emptyWarningText}>Kayıtlı seçenek bulunamadı.</Text>
          {emptyActionText && onEmptyAction && (
            <TouchableOpacity onPress={onEmptyAction}>
              <Text style={styles.emptyActionLink}>{emptyActionText}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Seçim Modalı (Bottom Sheet) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.modalContent}>
            {/* Tutamaç (Drag Handle Indicator) */}
            <View style={styles.handleBarContainer}>
              <View style={styles.handleBar} />
            </View>

            {/* Modal Başlık */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label} Seçin</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Arama Alanı */}
            {searchable && items.length > 5 && (
              <View style={styles.searchBox}>
                <Search size={18} color={COLORS.border} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ara..."
                  placeholderTextColor={COLORS.border}
                  value={search}
                  onChangeText={setSearch}
                  autoFocus
                />
              </View>
            )}

            {/* Seçenek Listesi */}
            {items.length === 0 ? (
              <View style={styles.modalEmptyBox}>
                <AlertCircle size={32} color={COLORS.warning} />
                <Text style={styles.modalEmptyTitle}>Henüz seçenek eklenmemiş</Text>
                <Text style={styles.modalEmptyDesc}>
                  Önce "Tanımlar" sekmesinden yeni bir kayıt ekleyin.
                </Text>
                {emptyActionText && onEmptyAction && (
                  <TouchableOpacity
                    style={styles.modalActionBtn}
                    onPress={() => {
                      setModalVisible(false);
                      onEmptyAction();
                    }}
                  >
                    <Text style={styles.modalActionBtnText}>{emptyActionText}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedId;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.listItem,
                        isSelected && styles.listItemSelected,
                      ]}
                      onPress={() => {
                        onSelect(item.id);
                        setModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.listItemTitle,
                            isSelected && styles.listItemTitleSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {item.subtitle ? (
                          <Text style={styles.listItemSub}>{item.subtitle}</Text>
                        ) : null}
                      </View>
                      {isSelected && <Check size={18} color={COLORS.primary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: COLORS.error,
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  triggerText: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  triggerTextPlaceholder: {
    color: COLORS.border,
    fontWeight: '400',
  },
  emptyWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  emptyWarningText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  emptyActionLink: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '80%',
    paddingHorizontal: 20,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 15,
    color: COLORS.textDark,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  listItemSelected: {
    backgroundColor: COLORS.lightBlueBg,
    borderRadius: 8,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  listItemTitleSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  listItemSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalEmptyBox: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  modalEmptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 4,
  },
  modalEmptyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalActionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
