import { Stack } from 'expo-router';
import type { NativeStackNavigationOptions } from 'expo-router';

import type { Palette } from '@/theme';

/** Native large title that collapses into a blurred (glass) nav bar with a hairline. */
export const largeTitleOptions = (c: Palette): NativeStackNavigationOptions => ({
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
