import { consultants } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ScalePressable } from '@/components/Pressable';
import { Text } from '@/components/Text';
import { RatingLabel } from '@/components/RatingLabel';
import { useT } from '@/i18n';
import { sar } from '@/lib/format';
import { MARGIN, useTheme } from '@/theme';

/** S09 Consultants list. */
export default function Consultants() {
  const { c } = useTheme();
  const { t, lang } = useT();
  return (
    <FlatList
      data={consultants}
      keyExtractor={(x) => String(x.id)}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: MARGIN, gap: 10, paddingBottom: 48 }}
      renderItem={({ item }) => (
        <ScalePressable
          onPress={() => router.push({ pathname: '/consultants/[id]', params: { id: String(item.id) } })}
          accessibilityRole="button"
          style={[styles.card, { backgroundColor: c.card }]}
        >
          <View style={[styles.avatar, { backgroundColor: c.primaryTint }]}>
            <Text variant="title2" color="primary">
              {item.name.charAt(0)}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>
                {item.name}
              </Text>
              {item.certified ? <Icon name="checkmark.seal.fill" size={15} color={c.success} /> : null}
            </View>
            <Text variant="subhead" color="labelSecondary" numberOfLines={1}>
              {item.specialty} · {item.yearsExperience} {t('yearsExp')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>
              <RatingLabel rating={item.rating} reviews={item.reviews} />
              <View style={{ flex: 1 }} />
              <Text variant="subhead" weight="600" color="primary" tabular>
                {sar(item.feeSar, lang)}
              </Text>
            </View>
          </View>
        </ScalePressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radii.lg, alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
