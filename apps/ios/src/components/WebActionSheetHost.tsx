import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { registerWebSheet } from '@/lib/dialogs';
import { useTheme } from '@/theme';

import { Text } from './Text';

type Req = Parameters<Parameters<typeof registerWebSheet>[0] & object>[0];

/** iOS-style action sheet for the web preview (ActionSheetIOS has no web implementation). */
export function WebActionSheetHost() {
  const { c } = useTheme();
  const [req, setReq] = useState<Req | null>(null);
  useEffect(() => {
    registerWebSheet(setReq);
    return () => registerWebSheet(null);
  }, []);
  if (!req) return null;
  const pick = (i: number) => {
    setReq(null);
    req.onPick(i);
  };
  const items = req.options.map((o, i) => ({ o, i })).filter(({ i }) => i !== req.cancelIndex);
  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => pick(req.cancelIndex)}>
      <Pressable style={styles.backdrop} onPress={() => pick(req.cancelIndex)} accessibilityRole="button">
        <View style={styles.wrap}>
          <View style={[styles.group, { backgroundColor: c.card }]}>
            {req.title ? (
              <Text variant="footnote" color="labelSecondary" align="center" style={styles.title}>
                {req.title}
              </Text>
            ) : null}
            {items.map(({ o, i }) => (
              <Pressable key={i} onPress={() => pick(i)} accessibilityRole="button" style={[styles.item, { borderTopColor: c.separator }]}>
                <Text variant="body" align="center" style={{ color: i === req.destructiveIndex ? c.danger : c.primary }}>
                  {o}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => pick(req.cancelIndex)} accessibilityRole="button" style={[styles.group, styles.item, { backgroundColor: c.card }]}>
            <Text variant="body" weight="600" align="center" color="primary">
              {req.options[req.cancelIndex]}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end', alignItems: 'center' },
  wrap: { width: '100%', maxWidth: 430, padding: 8, gap: 8, paddingBottom: 24 },
  group: { borderRadius: 14, overflow: 'hidden' },
  title: { paddingVertical: 12, paddingHorizontal: 16 },
  item: { minHeight: 56, justifyContent: 'center', borderTopWidth: StyleSheet.hairlineWidth },
});
