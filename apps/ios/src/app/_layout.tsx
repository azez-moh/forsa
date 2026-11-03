import '@/lib/devLogs';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager, Platform, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { PhoneFrame } from '@/components/PhoneFrame';
import { webHeaderOptions } from '@/components/Screen';
import { ToastHost } from '@/components/ui';
import { WebActionSheetHost } from '@/components/WebActionSheetHost';
import { translate } from '@/i18n';
import { listenForNotificationTaps, watchInquiryStatus } from '@/lib/notify';
import { applyDirection } from '@/lib/reload';
import { useApp } from '@/store/app';
import { useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Arabic-first: RTL is allowed natively (expo-localization supportsRTL) and forced from JS once the
// persisted language is known. I18nManager direction only applies after a reload, so the very first
// launch reloads once into RTL (guarded so it can never loop). Profile → Language flips it back.
I18nManager.allowRTL(true);

export default function RootLayout() {
  const scheme = useColorScheme();
  const { c } = useTheme();
  const hydrated = useApp((s) => s.hydrated);
  const lang = useApp((s) => s.lang);
  const t = (k: Parameters<typeof translate>[1]) => translate(lang, k);

  // US-IOS-05: local notification stubs (status changes) and deep links from tapped notifications.
  useEffect(() => {
    const a = watchInquiryStatus();
    const b = listenForNotificationTaps();
    return () => {
      a();
      b();
    };
  }, []);

  // Safety net: whatever happens with the direction reload, never leave the user on the splash.
  // After 2.5s the app shows in whatever direction it is currently in.
  useEffect(() => {
    const id = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 2500);
    return () => clearTimeout(id);
  }, []);

  // Web preview: I18nManager has no effect; the direction comes from the language via dir on <html>.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (!hydrated) return;
    if (Platform.OS === 'web') {
      SplashScreen.hideAsync().catch(() => {});
      return;
    }
    const wantRTL = lang === 'ar';
    const { rtlBootReloads } = useApp.getState();
    if (I18nManager.isRTL !== wantRTL && rtlBootReloads < 1) {
      useApp.setState({ rtlBootReloads: rtlBootReloads + 1 });
      // give AsyncStorage a moment to persist the guard, then reload into the right direction
      const id = setTimeout(() => {
        applyDirection(wantRTL).then((ok) => {
          if (!ok) SplashScreen.hideAsync().catch(() => {});
        });
      }, 250);
      return () => clearTimeout(id);
    }
    if (I18nManager.isRTL === wantRTL && rtlBootReloads !== 0) useApp.setState({ rtlBootReloads: 0 });
    SplashScreen.hideAsync().catch(() => {});
  }, [hydrated, lang]);

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, primary: c.primary, background: c.groupedBg, card: c.card },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PhoneFrame>
      <ThemeProvider value={theme}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerTintColor: c.primary,
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: { backgroundColor: c.groupedBg },
            ...(Platform.OS === 'web'
              ? webHeaderOptions(c)
              : { headerTransparent: true, headerBlurEffect: 'systemChromeMaterial' as const }),
            headerShadowVisible: false,
            headerLargeTitleShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="opportunity/[id]" options={{ title: '', headerTransparent: true, headerBlurEffect: undefined }} />
          <Stack.Screen
            name="inquiry/[id]"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.92],
              sheetGrabberVisible: true,
              sheetCornerRadius: 22,
              headerShown: false,
              contentStyle: { backgroundColor: c.groupedBg },
            }}
          />
          <Stack.Screen
            name="listing/new"
            options={{ presentation: 'modal', headerShown: false, contentStyle: { backgroundColor: c.groupedBg } }}
          />
          <Stack.Screen
            name="auth/index"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.75, 1],
              sheetGrabberVisible: true,
              sheetCornerRadius: 22,
              headerShown: false,
              contentStyle: { backgroundColor: c.groupedBg },
            }}
          />
          <Stack.Screen name="services/index" options={{ title: t('servicesHeader'), headerLargeTitle: true }} />
          <Stack.Screen name="services/[id]" options={{ title: '' }} />
          <Stack.Screen name="consultants/index" options={{ title: t('consultantsHeader'), headerLargeTitle: true }} />
          <Stack.Screen name="consultants/[id]" options={{ title: '' }} />
          <Stack.Screen name="learn/index" options={{ title: t('learnHeader'), headerLargeTitle: true }} />
          <Stack.Screen name="learn/articles/[slug]" options={{ title: '' }} />
          <Stack.Screen name="about" options={{ title: t('aboutTitle') }} />
          <Stack.Screen name="faq" options={{ title: t('faqTitle'), headerLargeTitle: true }} />
        </Stack>
        <ToastHost />
        {Platform.OS === 'web' ? <WebActionSheetHost /> : null}
      </ThemeProvider>
      </PhoneFrame>
    </GestureHandlerRootView>
  );
}
