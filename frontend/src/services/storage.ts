import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Bellek içi yedek depolama (Native module erişilemezse uygulamanın çökmesini engeller)
const memoryStorage: Record<string, string> = {};

export const SafeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn('AsyncStorage fallback to memory for getItem:', e);
      return memoryStorage[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('AsyncStorage fallback to memory for setItem:', e);
      memoryStorage[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('AsyncStorage fallback to memory for removeItem:', e);
      delete memoryStorage[key];
    }
  },
};
