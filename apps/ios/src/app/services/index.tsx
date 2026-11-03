import { getProvider, services, type ServiceCategoryId } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ScalePressable } from '@/components/Pressable';
import { Segmented } from '@/components/Segmented';
import { Text } from '@/components/Text';
import { Badge } from '@/components/ui';
import { useT } from '@/i18n';
import { sar } from '@/lib/format';
import { MARGIN, useTheme } from '@/theme';

const CATS: (ServiceCategoryId | null)[] = [null, 'legal', 'business', 'design-marketing', 'finance-advisory'];

/** S07 Services catalog with category segments. */
export default function Services() {
  const { c } = useTheme();
  const { t, lang } = useT();
  const [i, setI] = useState(0);
  const list = services.filter((s) => !CATS[i] || s.categoryId === CATS[i]);
  return (
    <FlatList
      data={list}
      keyExtractor={(s) => String(s.id)}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: MARGIN, gap: 10, paddingBottom: 48 }}
      ListHeaderComponent={
        <Segmented values={[t('svcAll'), t('svcLegal'), t('svcBusiness'), t('svcDesign'), t('svcFinance')]} index={i} onChange={setI} style={{ marginBottom: 6 }} />
      }
      renderItem={({ item }) => {
        const p = getProvider(item.providerId);
        return (
          <ScalePressable
            onPress={() => router.push({ pathname: '/services/[id]', params: { id: String(item.id) } })}
            accessibilityRole="button"
            style={[styles.card, { backgroundColor: c.card }]}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="headline" numberOfLines={2}>
                {item.title}
              </Text>
              <Text variant="footnote" color="labelSecondary" numberOfLines={2}>
                {item.description}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <Text variant="caption1" color="labelSecondary" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {p?.name}
                </Text>
                {p && p.completedOrders === 0 ? <Badge label={t('newProvider')} tone="neutral" /> : null}
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Text variant="caption1" color="labelSecondary">
                {t('from')}
              </Text>
              <Text variant="headline" color="primary" tabular>
                {sar(item.priceSar, lang)}
              </Text>
              {item.originalPriceSar ? (
                <Text variant="caption1" color="labelTertiary" tabular style={{ textDecorationLine: 'line-through' }}>
                  {sar(item.originalPriceSar, lang)}
                </Text>
              ) : null}
            </View>
          </ScalePressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radii.lg },
});
