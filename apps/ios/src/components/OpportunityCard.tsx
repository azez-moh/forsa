import type { Opportunity } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useT } from '@/i18n';
import { cityName, categoryName, num, sar, typeColor, typeShort, typeSymbol } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app';
import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { ScalePressable } from './Pressable';
import { Text } from './Text';
import { Badge, toast } from './ui';

/** Image or a calm category illustration when the listing has no photo. */
export function OpportunityMedia({ o, height, rounded = true }: { o: Opportunity; height: number; rounded?: boolean }) {
  const { c } = useTheme();
  const uri = o.images[0];
  return (
    <View style={{ height, backgroundColor: c.fillTertiary, borderRadius: rounded ? radii.md : 0, overflow: 'hidden' }}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: c.primaryTint }]}>
          <Icon name={typeSymbol[o.type]} size={44} color={typeColor(o.type)} type="hierarchical" />
        </View>
      )}
    </View>
  );
}

/** Opportunity card (S02). Tapping zooms into the detail (iOS 18 native zoom transition). */
export function OpportunityCard({ o, compact }: { o: Opportunity; compact?: boolean }) {
  const { c } = useTheme();
  const { t, lang } = useT();
  const saved = useApp((s) => s.saved.includes(o.id));
  const toggleSave = useApp((s) => s.toggleSave);
  const width = compact ? 260 : undefined;

  // Link asChild renders expo-router's Slot, which throws (dev) or drops (release) array styles on
  // its direct child, so the card style is flattened.
  return (
    <Link href={{ pathname: '/opportunity/[id]', params: { id: String(o.id) } }} asChild>
      <ScalePressable
        accessibilityRole="button"
        accessibilityLabel={`${o.title}، ${typeShort(o.type, lang)}، ${sar(o.priceSar, lang)}، ${cityName(o.cityId, lang)}`}
        style={StyleSheet.flatten([styles.card, { backgroundColor: c.card, width }])}
      >
        <Link.AppleZoom>
          <View>
            <OpportunityMedia o={o} height={compact ? 150 : 200} rounded={false} />
          </View>
        </Link.AppleZoom>
        <View style={styles.body}>
          <View style={styles.metaRow}>
            <View style={[styles.dot, { backgroundColor: typeColor(o.type) }]} />
            <Text variant="caption1" color="labelSecondary" weight="600">
              {typeShort(o.type, lang)}
            </Text>
            <View style={{ flex: 1 }} />
            {o.verified ? <Badge label={t('verified')} tone="success" icon="checkmark.seal.fill" /> : null}
          </View>
          <Text variant="headline" numberOfLines={2}>
            {o.title}
          </Text>
          <Text variant="subhead" color="labelSecondary" numberOfLines={1}>
            {cityName(o.cityId, lang)} · {categoryName(o.categoryId, lang)}
          </Text>
          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <Text variant="title3" tabular color="primary">
                {sar(o.priceSar, lang)}
              </Text>
              <Text variant="caption1" color="labelSecondary" tabular>
                {t('views')} {num(o.views)}
              </Text>
            </View>
            <ScalePressable
              accessibilityRole="button"
              accessibilityLabel={saved ? t('saved') : t('save')}
              accessibilityState={{ selected: saved }}
              hitSlop={8}
              onPress={() => {
                const now = toggleSave(o.id);
                haptic.light();
                toast(now ? t('savedToast') : t('unsavedToast'));
              }}
              style={[styles.save, { backgroundColor: c.fillTertiary }]}
            >
              <Icon name={saved ? 'heart.fill' : 'heart'} size={18} color={saved ? c.danger : c.labelPrimary} />
            </ScalePressable>
          </View>
        </View>
      </ScalePressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg, borderCurve: 'continuous', overflow: 'hidden' },
  body: { padding: 14, gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 22 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  footer: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  save: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
