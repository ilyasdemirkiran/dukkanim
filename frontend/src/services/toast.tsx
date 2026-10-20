import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast, { BaseToast, ErrorToast, InfoToast, ToastConfig } from 'react-native-toast-message';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

/**
 * Trabzon Mavisi ve kurumsal renklerle özelleştirilmiş şık Toast konfigürasyonu
 */
export const toastConfig: ToastConfig = {
  success: (props) => (
    <View style={[styles.toastContainer, styles.successBorder]}>
      <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
        <CheckCircle2 size={20} color={COLORS.positive} />
      </View>
      <View style={styles.textContainer}>
        {props.text1 ? <Text style={styles.titleText}>{props.text1}</Text> : null}
        {props.text2 ? <Text style={styles.messageText}>{props.text2}</Text> : null}
      </View>
    </View>
  ),

  error: (props) => (
    <View style={[styles.toastContainer, styles.errorBorder]}>
      <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
        <XCircle size={20} color={COLORS.error} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.titleText, { color: COLORS.error }]}>
          {props.text1 || 'Hata'}
        </Text>
        {props.text2 ? <Text style={styles.messageText}>{props.text2}</Text> : null}
      </View>
    </View>
  ),

  info: (props) => (
    <View style={[styles.toastContainer, styles.infoBorder]}>
      <View style={[styles.iconContainer, { backgroundColor: COLORS.lightBlueBg }]}>
        <Info size={20} color={COLORS.primary} />
      </View>
      <View style={styles.textContainer}>
        {props.text1 ? <Text style={styles.titleText}>{props.text1}</Text> : null}
        {props.text2 ? <Text style={styles.messageText}>{props.text2}</Text> : null}
      </View>
    </View>
  ),

  warning: (props) => (
    <View style={[styles.toastContainer, styles.warningBorder]}>
      <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
        <AlertTriangle size={20} color={COLORS.warning} />
      </View>
      <View style={styles.textContainer}>
        {props.text1 ? <Text style={styles.titleText}>{props.text1}</Text> : null}
        {props.text2 ? <Text style={styles.messageText}>{props.text2}</Text> : null}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    minHeight: 56,
    width: '92%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 999,
    zIndex: 99999,
  },
  successBorder: {
    borderColor: COLORS.positive,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  infoBorder: {
    borderColor: COLORS.primary,
  },
  warningBorder: {
    borderColor: COLORS.warning,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  messageText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});

/**
 * Kolay çağrılabilir bildirim fonksiyonları
 */
export const showToast = {
  success: (title: string, message?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  error: (title: string, message?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
  },
  info: (title: string, message?: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  warning: (title: string, message?: string) => {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3500,
    });
  },
};
