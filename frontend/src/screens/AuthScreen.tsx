import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { FormPhoneInput } from '../components/FormPhoneInput';
import { OttomanBackground, OttomanTughraLogo } from '../components/OttomanGraphics';
import { apiClient, TOKEN_KEY, USER_KEY } from '../services/api';
import { SafeStorage } from '../services/storage';
import { COLORS } from '../theme/colors';
import { Lock, User, ShieldCheck } from 'lucide-react-native';
import { showToast } from '../services/toast';

interface AuthFormData {
  phone: string;
  password: string;
  fullName?: string;
}

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [fullNameVal, setFullNameVal] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { control, handleSubmit, reset } = useForm<AuthFormData>({
    defaultValues: {
      phone: '',
      password: '',
      fullName: '',
    },
  });

  // TanStack Query useMutation ile Axios kimlik doğrulama isteği
  const authMutation = useMutation({
    mutationFn: async ({ endpoint, payload }: { endpoint: string; payload: any }) => {
      const response = await apiClient.post(endpoint, payload);
      return response.data;
    },
    onSuccess: async (data) => {
      if (data.token) {
        await SafeStorage.setItem(TOKEN_KEY, data.token);
        await SafeStorage.setItem(USER_KEY, JSON.stringify(data.user));
        showToast.success('Giriş Başarılı', `Hoş geldiniz, ${data.user?.fullName || data.user?.phone || ''}`);
        onLoginSuccess(data.user);
      }
    },
    onError: (err: any) => {
      const msg = err.message || 'İşlem başarısız oldu.';
      setErrorMessage(msg);
      showToast.error('Giriş Başarısız', msg);
    },
  });

  const onSubmit = (data: AuthFormData) => {
    setErrorMessage('');
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = {
      ...data,
      fullName: isRegister ? fullNameVal.trim() : undefined,
    };
    authMutation.mutate({ endpoint, payload });
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrorMessage('');
    authMutation.reset();
    reset();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <OttomanBackground opacity={0.05} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Başlık & Firma Adı */}
        <View style={styles.brandContainer}>
          <OttomanTughraLogo size={90} />
          <Text style={styles.companyName}>ÖZYURT ZAHİRE</Text>
          <Text style={styles.companySubtitle}>Ön Muhasebe & Zahire Ticaret Yönetimi</Text>
          <View style={styles.ornamentLine}>
            <View style={styles.line} />
            <Text style={styles.star}>✦</Text>
            <View style={styles.line} />
          </View>
        </View>

        {/* Form Kartı */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {isRegister ? 'Yeni Hesap Oluştur' : 'Kullanıcı Girişi'}
          </Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {isRegister && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ad Soyad</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="İlyas Demirkıran"
                  placeholderTextColor="#94A3B8"
                  value={fullNameVal}
                  onChangeText={setFullNameVal}
                />
              </View>
            </View>
          )}

          {/* Telefon Bileşeni */}
          <FormPhoneInput<AuthFormData>
            name="phone"
            control={control}
            label="Telefon Numarası"
            required
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre *</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                onChangeText={(val) => {
                  control._formValues.password = val;
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => handleSubmit(onSubmit)()}
            disabled={authMutation.isPending}
            activeOpacity={0.8}
          >
            {authMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonContent}>
                <ShieldCheck size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} style={styles.switchButton}>
            <Text style={styles.switchText}>
              {isRegister
                ? 'Zaten bir hesabınız var mı? Giriş Yapın'
                : 'Hesabınız yok mu? Hemen Kayıt Olun'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>© 2026 Özyurt Zahire Tic. Ltd. Şti.</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  companyName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    marginTop: 12,
  },
  companySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  ornamentLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    width: '60%',
  },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: COLORS.hover,
  },
  star: {
    color: COLORS.hover,
    marginHorizontal: 8,
    fontSize: 14,
  },
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderColor: COLORS.error,
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textDark,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: COLORS.hover,
    fontSize: 13,
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    color: COLORS.border,
    fontSize: 12,
    marginTop: 24,
  },
});
