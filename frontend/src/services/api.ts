import axios, { AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { SafeStorage } from './storage';

// Platforma göre otomatik Backend Host çözümleme
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4444';
  }
  return 'http://localhost:4444';
};

export const API_URL = getBaseUrl();
export const TOKEN_KEY = '@ozyurt_zahire_token';
export const USER_KEY = '@ozyurt_zahire_user';

// Axios Instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: JWT Token otomatik ekleme
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SafeStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Hata mesajlarını ayıklama
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Android emulator connection fallback
    const originalRequest = error.config;
    if (
      !originalRequest._retry &&
      error.message &&
      (error.message.includes('Network Error') || error.code === 'ERR_NETWORK')
    ) {
      originalRequest._retry = true;
      originalRequest.baseURL = 'http://192.168.1.104:4444';
      return apiClient(originalRequest);
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Bir hata oluştu.';
    return Promise.reject(new Error(message));
  }
);

// Genel yardımcı istek fonksiyonu
export async function apiRequest<T = any>(
  path: string,
  options: { method?: string; body?: any; headers?: any } = {}
): Promise<T> {
  const method = options.method?.toLowerCase() || 'get';
  const data = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
  
  const response = await apiClient.request<T>({
    url: path,
    method,
    data,
    headers: options.headers,
  });

  return response.data;
}

// Para formatlayıcı (Kuruş -> TL gösterimi)
export function formatCurrency(kurus: number): string {
  const tl = (kurus || 0) / 100;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(tl);
}

// Kuruş tamsayı dönüştürücü
export function tlToKurus(tlString: string | number): number {
  if (typeof tlString === 'number') return Math.round(tlString * 100);
  const clean = String(tlString).replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

/**
 * Telefon Numarası Formatlayıcı
 * Proje genelinde telefon gösteriminin daima kurumsal ve okunaklı (+90 5XX XXX XX XX veya 05XX XXX XX XX)
 * olmasını garanti eder.
 */
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function formatPhoneNumber(
  rawPhone?: string | null,
  format: 'NATIONAL' | 'INTERNATIONAL' = 'INTERNATIONAL'
): string {
  if (!rawPhone) return '';
  const trimmed = String(rawPhone).trim();
  if (!trimmed) return '';

  try {
    const parsed = parsePhoneNumberFromString(trimmed, 'TR');
    if (parsed && parsed.isValid()) {
      return format === 'NATIONAL' ? parsed.formatNational() : parsed.formatInternational();
    }
    // Geçersiz veya eksik olsa bile olabildiğince formatlamaya çalış
    if (parsed) {
      return format === 'NATIONAL' ? parsed.formatNational() : parsed.formatInternational();
    }
  } catch {
    // fallback
  }

  // Regex fallback: 10 hane ise 05XX XXX XX XX veya +90 5XX XXX XX XX yap
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) {
    // 5321234567 -> +90 532 123 45 67
    return `+90 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    // 05321234567 -> +90 532 123 45 67
    const d = digits.slice(1);
    return `+90 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
  }
  if (digits.length === 12 && digits.startsWith('90')) {
    const d = digits.slice(2);
    return `+90 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
  }

  return trimmed;
}

