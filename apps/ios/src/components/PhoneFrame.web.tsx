import { brandSource } from '@forsa/tokens';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useApp } from '@/store/app';
import { useTheme } from '@/theme';

/**
 * Browser preview: the app sits in a phone-width column (max 430pt) on a navy backdrop on
 * desktop, and goes full-bleed on a phone. `direction` follows the language (RTL for Arabic).
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  const lang = useApp((s) => s.lang);
  return (
    <View style={[styles.backdrop, { backgroundColor: brandSource.navy }]}>
      <View
        style={[styles.phone, { backgroundColor: c.groupedBg, direction: lang === 'ar' ? 'rtl' : 'ltr' }]}
        nativeID="phone-frame"
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center' },
  phone: { flex: 1, width: '100%', maxWidth: 430, overflow: 'hidden' },
});
