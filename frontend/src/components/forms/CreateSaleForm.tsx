import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { CustomDropdown } from '../CustomDropdown';
import { COLORS } from '../../theme/colors';
import { CurrentAccount } from '../../types/currentAccount';
import { formatPhoneNumber } from '../../services/api';
import { DatePickerModal } from '../common/DatePickerModal';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Building2, Phone, User, CheckCircle2, Calendar } from 'lucide-react-native';

export interface CreateSaleFormData {
  currentAccountId: string;
  note: string;
  date: string; // 'YYYY-MM-DD' LocalDate formatı
}

interface CreateSaleFormProps {
  accounts: CurrentAccount[];
  initialAccountId?: string;
  initialDate?: string;
  onSubmit: (data: CreateSaleFormData) => void;
  isLoading?: boolean;
  onNavigateToAccounts?: () => void;
}

export const CreateSaleForm: React.FC<CreateSaleFormProps> = ({
  accounts,
  initialAccountId,
  initialDate,
  onSubmit,
  isLoading = false,
  onNavigateToAccounts,
}) => {
  const todayLocalDate = format(new Date(), 'yyyy-MM-dd');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateSaleFormData>({
    defaultValues: {
      currentAccountId: initialAccountId || accounts[0]?._id || '',
      note: '',
      date: initialDate || todayLocalDate,
    },
  });

  const selectedAccountId = watch('currentAccountId');
  const selectedAccount = accounts.find((a) => a._id === selectedAccountId);

  // Cari için firma veya iletişim özeti hazırlama
  const getAccountDetailSubtitle = (acc: CurrentAccount) => {
    const comp = acc.company;
    const contact = acc.contacts && acc.contacts.length > 0 ? acc.contacts[0] : null;

    if (comp?.companyName) {
      const loc = [comp.district, comp.city].filter(Boolean).join(', ');
      return loc ? `${comp.companyName} (${loc})` : comp.companyName;
    }
    if (comp?.city || comp?.district) {
      return [comp.district, comp.city].filter(Boolean).join(', ');
    }
    if (contact) {
      const formattedPhone = formatPhoneNumber(contact.phone);
      return `${contact.fullName}${formattedPhone ? ` • ${formattedPhone}` : ''}`;
    }
    return acc.categoryId?.name ? `Kategori: ${acc.categoryId.name}` : undefined;
  };

  const selectedCompany = selectedAccount?.company;
  const selectedContact =
    selectedAccount?.contacts && selectedAccount.contacts.length > 0
      ? selectedAccount.contacts[0]
      : null;
  const hasCompany = !!(selectedCompany?.companyName || selectedCompany?.city || selectedCompany?.district);

  return (
    <View style={styles.container}>
      {/* Cari Seçimi */}
      <Controller
        control={control}
        name="currentAccountId"
        rules={{ required: 'Lütfen bir cari seçiniz' }}
        render={({ field: { onChange, value } }) => (
          <CustomDropdown
            label="Satış Yapılacak Cari"
            required
            placeholder="Cari Seçiniz..."
            items={accounts.map((acc) => ({
              id: acc._id,
              label: acc.code ? `#${acc.code} - ${acc.title}` : acc.title,
              subtitle: getAccountDetailSubtitle(acc),
            }))}
            selectedId={value}
            onSelect={onChange}
            emptyActionText="Cariler Sekmesinden Cari Ekle"
            onEmptyAction={onNavigateToAccounts}
          />
        )}
      />
      {errors.currentAccountId && (
        <Text style={styles.errorText}>{errors.currentAccountId.message}</Text>
      )}

      {/* Seçilen Cari Bilgi Özeti Kartı */}
      {selectedAccount && (hasCompany || selectedContact) && (
        <View style={styles.selectedAccountCard}>
          {hasCompany ? (
            <View style={styles.accountDetailRow}>
              <View style={styles.accountDetailIconCircle}>
                <Building2 size={15} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountDetailLabel}>Firma Bilgisi</Text>
                <Text style={styles.accountDetailValue}>
                  {selectedCompany?.companyName || selectedAccount.title}
                  {(selectedCompany?.district || selectedCompany?.city) ? (
                    ` (${[selectedCompany?.district, selectedCompany?.city].filter(Boolean).join(', ')})`
                  ) : ''}
                </Text>
              </View>
            </View>
          ) : null}

          {selectedContact ? (
            <View style={[styles.accountDetailRow, hasCompany && { marginTop: 8 }]}>
              <View style={[styles.accountDetailIconCircle, { backgroundColor: '#E8F5E9' }]}>
                {selectedContact.phone ? (
                  <Phone size={14} color="#10B981" />
                ) : (
                  <User size={14} color="#10B981" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountDetailLabel}>İletişim Yetkilisi</Text>
                <Text style={styles.accountDetailValue}>
                  {selectedContact.fullName}
                  {selectedContact.duty ? ` (${selectedContact.duty})` : ''}
                  {selectedContact.phone ? ` • ${formatPhoneNumber(selectedContact.phone)}` : ''}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {/* Satış Tarihi (LocalDate: YYYY-MM-DD) */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Satış Tarihi <Text style={{ color: COLORS.error }}>*</Text>
        </Text>
        <Controller
          control={control}
          name="date"
          rules={{
            required: 'Tarih seçimi zorunludur',
            pattern: {
              value: /^\d{4}-\d{2}-\d{2}$/,
              message: 'Tarih YYYY-AA-GG formatında olmalıdır',
            },
          }}
          render={({ field: { onChange, value } }) => {
            const formattedDisplay = (() => {
              try {
                if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                  const dateObj = new Date(value + 'T00:00:00');
                  return format(dateObj, 'd MMMM yyyy, EEEE', { locale: tr });
                }
              } catch (_) {}
              return value || 'Tarih Seçiniz';
            })();

            return (
              <>
                <TouchableOpacity
                  style={styles.datePickerBtn}
                  onPress={() => setIsDatePickerOpen(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.datePickerBtnLeft}>
                    <View style={styles.datePickerIconCircle}>
                      <Calendar size={18} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.dateValueText}>{formattedDisplay}</Text>
                      <Text style={styles.dateIsoSubtext}>
                        {value} {value === todayLocalDate ? '(Bugün)' : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.todayQuickBtnWrapper}>
                    <TouchableOpacity
                      style={[
                        styles.todayQuickBtn,
                        value === todayLocalDate && styles.todayQuickBtnActive,
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        onChange(todayLocalDate);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.todayQuickBtnText,
                          value === todayLocalDate && styles.todayQuickBtnTextActive,
                        ]}
                      >
                        Bugün
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                <DatePickerModal
                  visible={isDatePickerOpen}
                  onClose={() => setIsDatePickerOpen(false)}
                  selectedDate={value}
                  onSelectDate={(newDate) => onChange(newDate)}
                  title="Satış Tarihi Seçin"
                />
              </>
            );
          }}
        />
        {errors.date && (
          <Text style={[styles.errorText, { marginTop: 4 }]}>{errors.date.message}</Text>
        )}
      </View>

      {/* Not Alanı */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Satış Notu (Opsiyonel)</Text>
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Ödeme vadesi, teslim şekli vb..."
              placeholderTextColor={COLORS.border}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              multiline
            />
          )}
        />
      </View>

      {/* Gönder Butonu */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => handleSubmit(onSubmit)()}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitBtnText}>Satışı Başlat ve Ürün Ekle</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
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
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datePickerBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  datePickerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  dateIsoSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  todayQuickBtnWrapper: {
    marginLeft: 8,
  },
  todayQuickBtn: {
    backgroundColor: COLORS.lightBlueBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  todayQuickBtnActive: {
    backgroundColor: COLORS.primary,
  },
  todayQuickBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  todayQuickBtnTextActive: {
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: -8,
    marginBottom: 12,
    fontWeight: '500',
  },
  selectedAccountCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: -4,
    marginBottom: 16,
  },
  accountDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accountDetailIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountDetailLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  accountDetailValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 1,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

