import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, StyleSheet } from 'react-native';
import { CITIES, getDistrictsByCity } from '../data/locationService';
import { COLORS } from '../theme/colors';
import { ChevronDown, Search, X } from 'lucide-react-native';

interface LocationPickerProps {
  city: string;
  district: string;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  city,
  district,
  onCityChange,
  onDistrictChange,
}) => {
  const [modalType, setModalType] = useState<'city' | 'district' | null>(null);
  const [search, setSearch] = useState('');

  const currentDistricts = city ? getDistrictsByCity(city) : [];

  const filteredCities = CITIES.filter((c) =>
    c.cityName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDistricts = currentDistricts.filter((d) =>
    d.toLowerCase().includes(search.toLowerCase())
  );

  const openPicker = (type: 'city' | 'district') => {
    setSearch('');
    setModalType(type);
  };

  return (
    <View style={styles.container}>
      {/* İl Seçici */}
      <View style={styles.field}>
        <Text style={styles.label}>İl (Opsiyonel)</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => openPicker('city')}
          activeOpacity={0.7}
        >
          <Text style={city ? styles.selectedText : styles.placeholderText}>
            {city || 'İl Seçiniz'}
          </Text>
          <ChevronDown size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* İlçe Seçici */}
      <View style={styles.field}>
        <Text style={styles.label}>İlçe (Opsiyonel)</Text>
        <TouchableOpacity
          style={[styles.selectButton, !city && styles.disabledButton]}
          onPress={() => city && openPicker('district')}
          disabled={!city}
          activeOpacity={0.7}
        >
          <Text style={district ? styles.selectedText : styles.placeholderText}>
            {!city ? 'Önce İl Seçiniz' : district || 'İlçe Seçiniz'}
          </Text>
          <ChevronDown size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Arama ve Seçim Modalı */}
      <Modal visible={modalType !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'city' ? 'İl Seçin' : `${city} - İlçe Seçin`}
              </Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <X size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

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

            {modalType === 'city' ? (
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => item.cityName}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => {
                      onCityChange(item.cityName);
                      onDistrictChange('');
                      setModalType(null);
                    }}
                  >
                    <Text style={styles.itemText}>{item.cityName}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <FlatList
                data={filteredDistricts}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => {
                      onDistrictChange(item);
                      setModalType(null);
                    }}
                  >
                    <Text style={styles.itemText}>{item}</Text>
                  </TouchableOpacity>
                )}
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
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disabledButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surface,
  },
  selectedText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.border,
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
    maxHeight: '80%',
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  itemText: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '500',
  },
});
