import { Stack } from 'expo-router';
import type { NativeStackNavigationOptions } from 'expo-router';
import { Platform } from 'react-native';

import type { Palette } from '@/theme';

/** Native large title that collapses into a blurred (glass) nav bar with a hairline. */
export const largeTitleOptions = (c: Palette): NativeStackNavigationOptions =>
  Platform.OS === 'web' ? webHeaderOptions(c) : nativeLargeTitle(c);

/**
 * Web preview: there is no UINavigationBar (large titles, blur, content inset), so a transparent
 * header would overlap content. Use a solid bar with a bold, left-aligned-to-start title instead.
 */
export const webHeaderOptions = (c: Palette & { groupedBg?: string }): NativeStackNavigationOptions => ({
  headerTransparent: false,
  headerShadowVisible: false,
  headerTintColor: c.primary,
  headerStyle: { backgroundColor: c.groupedBg ?? c.bgSecondary },
  headerTitleStyle: { fontSize: 22, fontWeight: '700', color: c.labelPrimary },
  headerTitleAlign: 'left',
  headerBackButtonDisplayMode: 'minimal',
});

const nativeLargeTitle = (c: Palette): NativeStackNavigationOptions => ({
  headerLargeTitle: true,
  headerTransparent: true,
  headerBlurEffect: 'systemChromeMaterial',
  headerLargeStyle: { backgroundColor: 'transparent' },
  headerLargeTitleShadowVisible: false,
  headerShadowVisible: true,
  headerTintColor: c.primary,
  headerBackButtonDisplayMode: 'minimal',
});

export { Stack };
