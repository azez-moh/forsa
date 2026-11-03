import { I18nManager, Platform } from 'react-native';

import { useApp } from '@/store/app';

/**
 * Current layout direction. Native: I18nManager (applied at launch). Web: I18nManager has no
 * effect, so the direction follows the language and is applied with dir="rtl" on <html>.
 */
export function isRTL(): boolean {
  if (Platform.OS === 'web') return useApp.getState().lang === 'ar';
  return I18nManager.isRTL;
}
