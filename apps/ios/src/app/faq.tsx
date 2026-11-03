import { faqs } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { ScalePressable } from '@/components/Pressable';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';
import { MARGIN, useTheme } from '@/theme';

/** S14 FAQ: expandable answers (the live page shows none). */
export default function Faq() {
  const { c } = useTheme();
  const { t } = useT();
  const [open, setOpen] = useState<number | null>(faqs[0]?.id ?? null);
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: MARGIN, gap: 10, paddingBottom: 48 }}>
      {faqs.map((f) => {
        const expanded = open === f.id;
        return (
          <Animated.View key={f.id} layout={LinearTransition.springify().damping(20)} style={[styles.item, { backgroundColor: c.card }]}>
            <ScalePressable
              pressScale={0.99}
              haptics="selection"
              onPress={() => setOpen(expanded ? null : f.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              style={styles.q}
            >
              <Text variant="headline" style={{ flex: 1 }}>
                {f.question}
              </Text>
              <Icon name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={c.labelSecondary} weight="semibold" />
            </ScalePressable>
            {expanded ? (
              <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
                <Text variant="subhead" color="labelSecondary">
                  {f.answer.replace(/^\(مقترح\)\s*/, '')}
                </Text>
              </Animated.View>
            ) : null}
          </Animated.View>
        );
      })}
      <Text variant="caption2" color="labelTertiary" align="center">
        {t('conceptNote')}
      </Text>
      <View />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  item: { borderRadius: radii.md, overflow: 'hidden' },
  q: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, minHeight: 44 },
});
