import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TOKEN_KEY, USER_KEY } from './src/services/api';
import { SafeStorage } from './src/services/storage';
import { AuthScreen } from './src/screens/AuthScreen';
import { ProductsScreen } from './src/screens/ProductsScreen';
import { CurrentAccountsScreen } from './src/screens/CurrentAccountsScreen';
import { SalesScreen } from './src/screens/SalesScreen';
import { CategoriesAndUnitsScreen } from './src/screens/CategoriesAndUnitsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { OttomanTughraLogo, OttomanBackground } from './src/components/OttomanGraphics';
import { COLORS } from './src/theme/colors';
import {
  Package,
  Users,
  Receipt,
  Layers,
  LogOut,
  User,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/services/toast';

// TanStack Query Client Tanımı
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30, // 30 saniye boyunca taze kabul edilir
      refetchOnWindowFocus: false,
    },
  },
});

function MainApp() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);
  const [currentTab, setCurrentTab] = useState<'sales' | 'products' | 'accounts' | 'definitions' | 'profile'>('sales');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SafeStorage.getItem(TOKEN_KEY);
      const userStr = await SafeStorage.getItem(USER_KEY);
      if (token && userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch {
      // ignore
    } finally {
      setInitializing(false);
    }
  };

  const handleLogout = async () => {
    await SafeStorage.removeItem(TOKEN_KEY);
    await SafeStorage.removeItem(USER_KEY);
    queryClient.clear();
    setCurrentUser(null);
  };

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <OttomanBackground opacity={0.03} />

      {/* Üst Bar - Profil Dokunulabilir ve İyileştirilmiş Düzen */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.brandRow}
          onPress={() => setCurrentTab('profile')}
          activeOpacity={0.8}
        >
          <OttomanTughraLogo size={38} />
          <View style={styles.brandTextGroup}>
            <Text style={styles.topCompanyName}>ÖZYURT ZAHİRE</Text>
            <View style={styles.userBadgeRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.topUserGreeting} numberOfLines={1}>
                {currentUser.fullName || currentUser.phone}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.topBarActions}>
          <TouchableOpacity
            onPress={() => setCurrentTab('profile')}
            style={[styles.profileIconBtn, currentTab === 'profile' && styles.profileIconBtnActive]}
            activeOpacity={0.7}
          >
            <User size={18} color={currentTab === 'profile' ? COLORS.primary : '#64748B'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
            <LogOut size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ekran İçeriği */}
      <View style={styles.body}>
        {currentTab === 'sales' && (
          <SalesScreen
            onNavigateToAccounts={() => setCurrentTab('accounts')}
            onNavigateToProducts={() => setCurrentTab('products')}
          />
        )}
        {currentTab === 'products' && <ProductsScreen />}
        {currentTab === 'accounts' && <CurrentAccountsScreen />}
        {currentTab === 'definitions' && <CategoriesAndUnitsScreen />}
        {currentTab === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
            onUserUpdated={(updated) => setCurrentUser(updated)}
            onLogout={handleLogout}
          />
        )}
      </View>

      {/* Alt Navigasyon Menüsü */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('sales')}
          activeOpacity={0.7}
        >
          <Receipt
            size={22}
            color={currentTab === 'sales' ? COLORS.primary : COLORS.border}
          />
          <Text
            style={[
              styles.navItemLabel,
              currentTab === 'sales' && styles.navItemLabelActive,
            ]}
          >
            Satışlar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('products')}
          activeOpacity={0.7}
        >
          <Package
            size={22}
            color={currentTab === 'products' ? COLORS.primary : COLORS.border}
          />
          <Text
            style={[
              styles.navItemLabel,
              currentTab === 'products' && styles.navItemLabelActive,
            ]}
          >
            Ürünler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('accounts')}
          activeOpacity={0.7}
        >
          <Users
            size={22}
            color={currentTab === 'accounts' ? COLORS.primary : COLORS.border}
          />
          <Text
            style={[
              styles.navItemLabel,
              currentTab === 'accounts' && styles.navItemLabelActive,
            ]}
          >
            Cariler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('definitions')}
          activeOpacity={0.7}
        >
          <Layers
            size={22}
            color={currentTab === 'definitions' ? COLORS.primary : COLORS.border}
          />
          <Text
            style={[
              styles.navItemLabel,
              currentTab === 'definitions' && styles.navItemLabelActive,
            ]}
          >
            Tanımlar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('profile')}
          activeOpacity={0.7}
        >
          <User
            size={22}
            color={currentTab === 'profile' ? COLORS.primary : COLORS.border}
          />
          <Text
            style={[
              styles.navItemLabel,
              currentTab === 'profile' && styles.navItemLabelActive,
            ]}
          >
            Profil
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 44;

  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
      <Toast
        config={toastConfig}
        topOffset={statusBarHeight + 70}
      />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0B4F6C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandTextGroup: {
    flex: 1,
  },
  topCompanyName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  userBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  topUserGreeting: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileIconBtnActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  body: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navItemLabel: {
    fontSize: 11,
    color: COLORS.border,
    fontWeight: '600',
  },
  navItemLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
