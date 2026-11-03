import { consultants, opportunities, opportunitiesByType, platformStats, services, videos, cities, featuredOpportunities } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { OpportunityCard } from '@/components/OpportunityCard';
import { ScalePressable } from '@/components/Pressable';
import { Text } from '@/components/Text';
import { ValueHero } from '@/components/ValueHero';
import { Card, SectionHeader } from '@/components/ui';
import { useT } from '@/i18n';
import { num, sar, TYPE_ORDER, typeColor, typeLong, typeSymbol } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { MARGIN, TAB_BAR_CLEARANCE, useTheme } from '@/theme';

/** S01 Discover: hero counter, four ways in, featured, cities, how it works, services, consultants, learn. */
export default function Discover() {
  const { c } = useTheme();
  const { t, lang, loc } = useT();
  const [refreshing, setRefreshing] = useState(false);
  const featured = featuredOpportunities();

  const cityStats = cities
    .map((city) => {
      const list = opportunities.filter((o) => o.cityId === city.id);
      return { city, count: list.length, value: list.reduce((s, o) => s + o.priceSar, 0) };
    })
    .filter((x) => x.count > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const maxCity = Math.max(...cityStats.map((x) => x.value));

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE, paddingTop: 8 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => {
              setRefreshing(false);
              haptic.light();
            }, 900);
          }}
        />
      }
    >
      <ValueHero totalSar={platformStats.totalValueSar}>
        <View style={styles.heroCtas}>
          <Button title={t('addYourOpportunity')} icon="plus" onPress={() => router.push('/listing/new')} style={{ flex: 1 }} full />
          <Button
            title={t('browseOpportunities')}
            variant="gray"
            onPress={() => router.push('/opportunities')}
            style={{ flex: 1 }}
            full
          />
        </View>
      </ValueHero>

      <View style={styles.stats}>
        {[
          { v: num(platformStats.opportunities), l: t('statOpportunities') },
          { v: num(platformStats.users), l: t('statUsers') },
          { v: `${(platformStats.totalViews / 1e6).toFixed(1)}M`, l: t('statViews') },
        ].map((s) => (
          <View key={s.l} style={[styles.stat, { backgroundColor: c.card }]} accessible accessibilityLabel={`${s.v} ${s.l}`}>
            <Text variant="title3" tabular>
              {s.v}
            </Text>
            <Text variant="caption1" color="labelSecondary">
              {s.l}
            </Text>
          </View>
        ))}
      </View>

      <SectionHeader title={t('fourWays')} />
      <View style={styles.typeGrid}>
        {TYPE_ORDER.map((type) => (
          <ScalePressable
            key={type}
            haptics="selection"
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/opportunities', params: { type: String(type) } })}
            style={[styles.typeTile, { backgroundColor: c.card }]}
          >
            <View style={[styles.typeIcon, { backgroundColor: c.primaryTint }]}>
              <Icon name={typeSymbol[type]} size={20} color={typeColor(type)} />
            </View>
            <Text variant="headline" numberOfLines={2}>
              {typeLong(type, lang)}
            </Text>
            <Text variant="footnote" color="labelSecondary" tabular>
              {opportunitiesByType(type).length} {t('countOpp')}
            </Text>
          </ScalePressable>
        ))}
      </View>

      <SectionHeader title={t('featured')} action={t('seeAll')} onAction={() => router.push('/opportunities')} />
      <FlatList
        horizontal
        data={featured}
        keyExtractor={(o) => String(o.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: MARGIN, gap: 12 }}
        renderItem={({ item }) => <OpportunityCard o={item} compact />}
        snapToInterval={272}
        decelerationRate="fast"
      />

      <SectionHeader title={t('byCity')} />
      <Card style={{ marginHorizontal: MARGIN }}>
        {cityStats.map(({ city, count, value }, i) => (
          <ScalePressable
            key={city.id}
            pressScale={0.99}
            onPress={() => router.push({ pathname: '/opportunities', params: { city: city.id } })}
            accessibilityRole="button"
            accessibilityLabel={`${loc(city.name)}، ${count} ${t('countOpp')}، ${sar(value, lang)}`}
            style={[styles.cityRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.separator }]}
          >
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text variant="headline">{loc(city.name)}</Text>
                <Text variant="footnote" color="labelSecondary" tabular>
                  {count} {t('countOpp')}
                </Text>
                <View style={{ flex: 1 }} />
                <Text variant="subhead" weight="600" tabular>
                  {sar(value, lang)}
                </Text>
              </View>
              <View style={[styles.bar, { backgroundColor: c.fillTertiary }]}>
                <View style={[styles.barFill, { width: `${Math.max(6, (value / maxCity) * 100)}%`, backgroundColor: c.primary }]} />
              </View>
            </View>
          </ScalePressable>
        ))}
      </Card>

      <SectionHeader title={t('howItWorks')} />
      <View style={{ paddingHorizontal: MARGIN, gap: 10 }}>
        {(
          [
            ['magnifyingglass', 'how1Title', 'how1Body'],
            ['signature', 'how2Title', 'how2Body'],
            ['checkmark.seal', 'how3Title', 'how3Body'],
          ] as const
        ).map(([icon, title, body], i) => (
          <Card key={title} style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View style={[styles.stepNum, { backgroundColor: c.fillTertiary }]}>
              <Text variant="headline" tabular>
                {i + 1}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="headline">{t(title)}</Text>
              <Text variant="subhead" color="labelSecondary">
                {t(body)}
              </Text>
            </View>
            <Icon name={icon} size={22} color={c.labelSecondary} />
          </Card>
        ))}
      </View>

      <SectionHeader title={t('servicesTitle')} action={t('seeAll')} onAction={() => router.push('/services')} />
      <FlatList
        horizontal
        data={services.slice(0, 8)}
        keyExtractor={(s) => String(s.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: MARGIN, gap: 10 }}
        renderItem={({ item }) => (
          <ScalePressable
            onPress={() => router.push({ pathname: '/services/[id]', params: { id: String(item.id) } })}
            accessibilityRole="button"
            style={[styles.miniCard, { backgroundColor: c.card }]}
          >
            <Text variant="headline" numberOfLines={2}>
              {item.title}
            </Text>
            <View style={{ flex: 1 }} />
            <Text variant="footnote" color="labelSecondary">
              {t('from')}
            </Text>
            <Text variant="headline" color="primary" tabular>
              {sar(item.priceSar, lang)}
            </Text>
          </ScalePressable>
        )}
      />

      <SectionHeader title={t('consultantsTitle')} action={t('seeAll')} onAction={() => router.push('/consultants')} />
      <FlatList
        horizontal
        data={consultants}
        keyExtractor={(x) => String(x.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: MARGIN, gap: 10 }}
        renderItem={({ item }) => (
          <ScalePressable
            onPress={() => router.push({ pathname: '/consultants/[id]', params: { id: String(item.id) } })}
            accessibilityRole="button"
            style={[styles.consultant, { backgroundColor: c.card }]}
          >
            <View style={[styles.avatar, { backgroundColor: c.primaryTint }]}>
              <Text variant="title3" color="primary">
                {item.name.charAt(0)}
              </Text>
            </View>
            <Text variant="subhead" weight="600" numberOfLines={1} align="center">
              {item.name}
            </Text>
            <Text variant="caption1" color="labelSecondary" numberOfLines={2} align="center">
              {item.specialty}
            </Text>
          </ScalePressable>
        )}
      />

      <SectionHeader title={t('learnTitle')} action={t('seeAll')} onAction={() => router.push('/learn')} />
      <ScalePressable
        onPress={() => router.push('/learn')}
        accessibilityRole="button"
        style={{ marginHorizontal: MARGIN }}
      >
        <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={[styles.typeIcon, { backgroundColor: 'rgba(255,59,48,0.12)' }]}>
            <Icon name="play.rectangle.fill" size={20} color={c.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="headline" numberOfLines={1}>
              {videos[0].title}
            </Text>
            <Text variant="footnote" color="labelSecondary">
              {videos.length} {t('videos')} · {t('articles')}
            </Text>
          </View>
          <Icon name="chevron.forward" directional size={14} color={c.labelTertiary} />
        </Card>
      </ScalePressable>

      <View style={[styles.finalCta, { backgroundColor: c.primaryTint }]}>
        <Text variant="title2">{t('finalCtaTitle')}</Text>
        <Text variant="subhead" color="labelSecondary">
          {t('finalCtaBody')}
        </Text>
        <Button title={t('addYourOpportunity')} onPress={() => router.push('/listing/new')} full style={{ marginTop: 8 }} />
      </View>
      <Text variant="caption2" color="labelTertiary" align="center" style={{ marginTop: 16 }}>
        {t('conceptNote')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroCtas: { flexDirection: 'row', gap: 10, marginTop: 18 },
  stats: { flexDirection: 'row', gap: 10, paddingHorizontal: MARGIN, marginTop: 12 },
  stat: { flex: 1, borderRadius: radii.md, padding: 12, gap: 2 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: MARGIN },
  typeTile: { width: '48.5%', flexGrow: 1, flexBasis: '45%', borderRadius: radii.lg, padding: 14, gap: 8, minHeight: 132 },
  typeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cityRow: { paddingVertical: 12, minHeight: 44 },
  bar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  stepNum: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  miniCard: { width: 170, height: 132, borderRadius: radii.lg, padding: 14, gap: 2 },
  consultant: { width: 132, borderRadius: radii.lg, padding: 14, alignItems: 'center', gap: 6 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  finalCta: { marginHorizontal: MARGIN, marginTop: 32, padding: 20, borderRadius: radii['2xl'], gap: 4 },
});
