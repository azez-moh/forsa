import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { AppState, Modal, ScrollView, StyleSheet, View } from 'react-native';

import { useT } from '@/i18n';
import { dateLocale } from '@/lib/format';
import { MARGIN, useTheme } from '@/theme';

import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';
import { DemoTag } from './ui';

/**
 * Confidential document viewer: watermark "سري — {name} — {date}" and a blur cover while the
 * app is inactive, so the app switcher snapshot never shows the document (US-IOS-04).
 */
export function DocViewer({ doc, name, onClose }: { doc: string | null; name: string; onClose: () => void }) {
  const { c, scheme } = useTheme();
  const { t, lang } = useT();
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setCovered(s !== 'active'));
    return () => sub.remove();
  }, []);
  const date = new Date().toLocaleDateString(dateLocale(lang));
  const mark = `${lang === 'ar' ? 'سري' : 'Confidential'} — ${name} — ${date}`;
  return (
    <Modal visible={!!doc} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.groupedBg }}>
        <View style={styles.header}>
          <Icon name="lock.doc" size={20} color={c.primary} />
          <Text variant="headline" style={{ flex: 1 }} numberOfLines={1}>
            {doc}
          </Text>
          <DemoTag />
          <Button title={t('done')} variant="plain" size="medium" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ padding: MARGIN, gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[styles.page, { backgroundColor: c.card }]}>
              <View style={{ gap: 8 }}>
                {Array.from({ length: 9 }).map((__, j) => (
                  <View key={j} style={{ height: 8, borderRadius: 4, width: `${60 + ((i * 7 + j * 13) % 40)}%`, backgroundColor: c.fillSecondary }} />
                ))}
              </View>
              <View pointerEvents="none" style={styles.watermark}>
                <Text variant="footnote" weight="600" style={{ color: c.labelTertiary, transform: [{ rotate: '-24deg' }] }}>
                  {mark}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
        {covered ? <BlurView intensity={100} tint={scheme} style={StyleSheet.absoluteFill} /> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: MARGIN, paddingTop: 16, paddingBottom: 8 },
  page: { borderRadius: 12, padding: 20, minHeight: 260, overflow: 'hidden' },
  watermark: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
