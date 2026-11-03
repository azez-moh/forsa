import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useT } from '@/i18n';
import { MARGIN, useTheme } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

/** Sheet header: title, optional step progress capsule, close button. */
export function SheetHeader({ title, step, total, onClose }: { title: string; step?: number; total?: number; onClose?: () => void }) {
  const { c } = useTheme();
  const { t } = useT();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text variant="headline" style={{ flex: 1 }} accessibilityRole="header">
          {title}
        </Text>
        <Button title={t('cancel')} variant="plain" size="medium" onPress={onClose ?? (() => router.back())} />
      </View>
      {step !== undefined && total ? (
        <View style={{ gap: 6 }}>
          <View style={styles.progress} accessibilityLabel={`${t('step')} ${step + 1} ${t('of')} ${total}`}>
            {Array.from({ length: total }).map((_, i) => (
              <View key={i} style={[styles.seg, { backgroundColor: i <= step ? c.primary : c.fillSecondary }]} />
            ))}
          </View>
          <Text variant="caption1" color="labelSecondary" tabular>
            {t('step')} {step + 1} {t('of')} {total}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: MARGIN, paddingTop: 18, paddingBottom: 8, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  progress: { flexDirection: 'row', gap: 4 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
});
