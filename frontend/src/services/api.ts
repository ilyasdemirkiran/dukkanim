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
