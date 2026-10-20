import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { User, Phone, Save, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { apiClient, USER_KEY, formatPhoneNumber } from '../services/api';
import { SafeStorage } from '../services/storage';
import { showToast } from '../services/toast';

interface ProfileScreenProps {
  currentUser: any;
  onUserUpdated: (updatedUser: any) => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  onUserUpdated,
  onLogout,
}) => {
  const [fullName, setFullName] = useState<string>(currentUser?.fullName || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const formattedPhone = formatPhoneNumber(currentUser?.phone) || '-';

  const handleSave = async () => {
    if (!fullName.trim()) {
      showToast.error('Hata', 'Ad Soyad alanı boş bırakılamaz.');
      return;
    }

    try {
      setIsSaving(true);
      const res = await apiClient.put<{ user: any; message: string }>('/api/auth/profile', {
        fullName: fullName.trim(),
      });

      const updated = {
        ...currentUser,
        ...res.data.user,
      };

      await SafeStorage.setItem(USER_KEY, JSON.stringify(updated));
      onUserUpdated(updated);
      showToast.success('Başarılı', 'Profil bilgileri güncellendi.');
    } catch (err: any) {
      showToast.error('Hata', err.response?.data?.error || err.message || 'Güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Profil Başlık Kartı */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <User size={38} color="#0B4F6C" />
          </View>
          <Text style={styles.profileName}>{currentUser?.fullName || 'Kullanıcı'}</Text>
          <View style={styles.phoneBadge}>
            <Phone size={13} color="#64748B" />
            <Text style={styles.phoneBadgeText}>{formattedPhone}</Text>
          </View>
        </View>

        {/* Bilgileri Düzenleme Kartı */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Hesap Bilgileri</Text>
          </View>

          {/* Ad Soyad Girişi */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ad Soyad</Text>
            <View style={styles.inputBox}>
              <User size={18} color="#94A3B8" />
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Adınız Soyadınız"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Telefon Numarası (Salt Okunur) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefon Numarası (Değiştirilemez)</Text>
            <View style={[styles.inputBox, styles.inputBoxDisabled]}>
              <Phone size={18} color="#94A3B8" />
              <Text style={styles.disabledText}>{formattedPhone}</Text>
            </View>
          </View>

          {/* Kaydet Butonu */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Save size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Çıkış Yap Kartı */}
        <View style={styles.logoutCard}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <LogOut size={18} color={COLORS.error} />
            <Text style={styles.logoutBtnText}>Oturumu Kapat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  avatarCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B4F6C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  phoneBadgeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B4F6C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    height: 48,
  },
  inputBoxDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  disabledText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  logoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF1F2',
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutBtnText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '700',
  },
});
