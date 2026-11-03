import { getConsultant } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { RatingLabel } from '@/components/RatingLabel';
import { ScalePressable } from '@/components/Pressable';
import { Text } from '@/components/Text';
import { Badge, Card, Chip, EmptyState, SectionHeader, toast } from '@/components/ui';
import { useT } from '@/i18n';
import { requireAuth } from '@/lib/auth';
import { cityName, dateLocale, sarFull } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app';
import { MARGIN, typeStyle, useTheme } from '@/theme';

const TIMES = ['16:00', '17:00', '18:00', '19:00', '20:00'];

const pad = (n: number) => String(n).padStart(2, '0');
/** Local calendar date key (not UTC), so the key and the displayed day always agree. */
const localKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Next 14 days excluding Fri/Sat (Saudi work week), US-CNS-03. */
function nextDays(lang: 'ar' | 'en') {
  const out: { key: string; dow: string; day: string }[] = [];
  const d = new Date();
  const end = new Date(d);
  end.setDate(end.getDate() + 14);
  while (d < end) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd === 5 || wd === 6) continue;
    out.push({
      key: localKey(d),
      dow: d.toLocaleDateString(dateLocale(lang), { weekday: 'short' }),
      day: String(d.getDate()),
    });
  }
  return out;
}

/** S10 Consultant profile + slot booking. */
export default function ConsultantProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const x = getConsultant(Number(id));
  const { c } = useTheme();
  const { t, lang } = useT();
  const insets = useSafeAreaInsets();
  const book = useApp((s) => s.book);
  const days = useMemo(() => nextDays(lang), [lang]);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  // deterministic "busy" slots for realism
  const busy = (d: string, tm: string) => (Number(d.slice(-2)) + Number(tm.slice(0, 2))) % 4 === 0;
  if (!x) return <EmptyState icon="person.crop.circle.badge.questionmark" title={t('noResults')} />;

  const onBook = () => {
    if (!day || !time) {
      haptic.error();
      toast(t('pickSlotError'));
      return;
    }
    requireAuth(() => {
      book(x.id, day, time);
      haptic.success();
      toast(t('bookedToast'));
      setDay(null);
      setTime(null);
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              title=""
              icon="square.and.arrow.up"
              variant="plain"
              size="medium"
              accessibilityLabel={t('share')}
              onPress={() => Share.share({ message: `${x.name} · ${x.specialty}\n${x.sourceUrl}`, url: x.sourceUrl }).catch(() => {})}
            />
          ),
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View style={{ alignItems: 'center', gap: 8, paddingHorizontal: MARGIN }}>
          <View style={[styles.avatar, { backgroundColor: c.primaryTint }]}>
            <Text style={{ fontSize: 40, lineHeight: 48, fontWeight: '700', color: c.primary }}>{x.name.charAt(0)}</Text>
          </View>
          <Text variant="title2" align="center" accessibilityRole="header">
            {x.name}
          </Text>
          <Text variant="subhead" color="labelSecondary" align="center">
            {x.specialty} · {cityName(x.cityId, lang)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            {x.certified ? <Badge label={t('certified')} tone="success" icon="checkmark.seal.fill" /> : null}
            <RatingLabel rating={x.rating} reviews={x.reviews} />
          </View>
        </View>

        <View style={styles.stats}>
          {[
            { v: String(x.yearsExperience), k: t('yearsExp') },
            { v: String(x.sessions), k: t('sessions') },
            { v: sarFull(x.feeSar, lang), k: t('fee') },
          ].map((s) => (
            <Card key={s.k} style={{ flex: 1, alignItems: 'center', gap: 2, padding: 12 }}>
              <Text variant="headline" tabular numberOfLines={1}>
                {s.v}
              </Text>
              <Text variant="caption1" color="labelSecondary" align="center">
                {s.k}
              </Text>
            </Card>
          ))}
        </View>

        <SectionHeader title={t('bio')} />
        <Card style={{ marginHorizontal: MARGIN, gap: 10 }}>
          <Text>{x.bio}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {x.tags.map((tag) => (
              <Badge key={tag} label={tag} tone="neutral" />
            ))}
          </View>
        </Card>

        <SectionHeader title={t('pickSlot')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: MARGIN, gap: 8 }}>
          {days.map((d) => {
            const selected = day === d.key;
            return (
              <ScalePressable
                key={d.key}
                haptics="selection"
                onPress={() => {
                  setDay(d.key);
                  setTime(null);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.day, { backgroundColor: selected ? c.primary : c.card }]}
              >
                <Text variant="caption1" style={{ color: selected ? c.onPrimary : c.labelSecondary }}>
                  {d.dow}
                </Text>
                <Text variant="title3" tabular style={{ color: selected ? c.onPrimary : c.labelPrimary }}>
                  {d.day}
                </Text>
              </ScalePressable>
            );
          })}
        </ScrollView>
        {day ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: MARGIN, marginTop: 12 }}>
            {TIMES.map((tm) =>
              busy(day, tm) ? (
                <View key={tm} style={[styles.busy, { backgroundColor: c.fillTertiary, paddingVertical: Math.max(0, (34 - (typeStyle('subhead', lang).lineHeight ?? 20)) / 2) }]}>
                  <Text variant="subhead" color="labelTertiary" tabular style={{ textDecorationLine: 'line-through' }}>
                    {tm}
                  </Text>
                </View>
              ) : (
                <Chip key={tm} label={tm} selected={time === tm} onPress={() => setTime(tm)} />
              ),
            )}
          </View>
        ) : (
          <Text variant="footnote" color="labelSecondary" style={{ paddingHorizontal: MARGIN, marginTop: 10 }}>
            {t('availability')}: {x.availability}
          </Text>
        )}
      </ScrollView>
      <View style={[styles.cta, { paddingBottom: insets.bottom + 8, backgroundColor: c.groupedBg, borderTopColor: c.separator }]}>
        <Button title={day && time ? `${t('book')} · ${time}` : t('book')} icon="calendar.badge.plus" full onPress={onBook} haptics={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 10, paddingHorizontal: MARGIN, marginTop: 20 },
  day: { minWidth: 60, minHeight: 72, paddingHorizontal: 8, paddingVertical: 8, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', gap: 2 },
  busy: { paddingHorizontal: 14, minHeight: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: MARGIN, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
