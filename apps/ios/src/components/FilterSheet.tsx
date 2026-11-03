import { categories, cities, type CategoryId, type CityId, type OpportunityStage } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { Modal, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { stageLabel } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { MARGIN, useTheme } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';
import { Chip } from './ui';

export type Filters = {
  categories: CategoryId[];
  cities: CityId[];
  /** index into PRICE_STEPS for max price; last = any */
  priceMax: number;
  stages: OpportunityStage[];
  verifiedOnly: boolean;
  withEquity: boolean;
};

/** Log-scale price steps (100K → 300M), matching the live site's 0–300M range. */
export const PRICE_STEPS = [100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 50_000_000, 300_000_000, Infinity];

export const emptyFilters = (): Filters => ({
  categories: [],
  cities: [],
  priceMax: PRICE_STEPS.length - 1,
  stages: [],
  verifiedOnly: false,
  withEquity: false,
});

export const activeFilterCount = (f: Filters) =>
  f.categories.length + f.cities.length + f.stages.length + (f.priceMax < PRICE_STEPS.length - 1 ? 1 : 0) + (f.verifiedOnly ? 1 : 0) + (f.withEquity ? 1 : 0);

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

/** Native page sheet with the S02 filters. */
export function FilterSheet({
  visible,
  value,
  onChange,
  onClose,
  resultCount,
}: {
  visible: boolean;
  value: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
  resultCount: number;
}) {
  const { c } = useTheme();
  const { t, lang, loc } = useT();
  const insets = useSafeAreaInsets();
  const set = (patch: Partial<Filters>) => {
    haptic.selection();
    onChange({ ...value, ...patch });
  };
  const priceLabel = (i: number) =>
    PRICE_STEPS[i] === Infinity ? t('anyPrice') : `≤ ${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(PRICE_STEPS[i])}`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.groupedBg }}>
        <View style={[styles.header, { borderBottomColor: c.separator }]}>
          <Button title={t('clearFilters')} variant="plain" size="medium" onPress={() => onChange(emptyFilters())} />
          <Text variant="headline" style={{ flex: 1 }} align="center">
            {t('filters')}
          </Text>
          <Button title={t('done')} variant="plain" size="medium" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ padding: MARGIN, gap: 24, paddingBottom: 120 }}>
          <Group title={t('category')}>
            {categories.map((cat) => (
              <Chip key={cat.id} label={loc(cat.name)} selected={value.categories.includes(cat.id)} onPress={() => set({ categories: toggle(value.categories, cat.id) })} />
            ))}
          </Group>
          <Group title={t('city')}>
            {cities.map((city) => (
              <Chip key={city.id} label={loc(city.name)} selected={value.cities.includes(city.id)} onPress={() => set({ cities: toggle(value.cities, city.id) })} />
            ))}
          </Group>
          <Group title={t('priceRange')}>
            {PRICE_STEPS.map((_, i) => (
              <Chip key={i} label={priceLabel(i)} selected={value.priceMax === i} onPress={() => set({ priceMax: i })} />
            ))}
          </Group>
          <Group title={t('stage')}>
            {(Object.keys(stageLabel) as OpportunityStage[]).map((s) => (
              <Chip key={s} label={stageLabel[s][lang]} selected={value.stages.includes(s)} onPress={() => set({ stages: toggle(value.stages, s) })} />
            ))}
          </Group>
          <View style={[styles.switchCard, { backgroundColor: c.card }]}>
            <SwitchRow label={t('verifiedOnly')} value={value.verifiedOnly} onChange={(v) => set({ verifiedOnly: v })} />
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.separator }} />
            <SwitchRow label={t('withEquity')} value={value.withEquity} onChange={(v) => set({ withEquity: v })} />
          </View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 8, backgroundColor: c.groupedBg, borderTopColor: c.separator }]}>
          <Button title={`${t('apply')} (${resultCount})`} full onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text variant="footnote" color="labelSecondary" weight="600">
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
    </View>
  );
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 16 }}>
      <Text style={{ flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.primary }} accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 12, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  switchCard: { borderRadius: radii.md, overflow: 'hidden' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: MARGIN, borderTopWidth: StyleSheet.hairlineWidth },
});
