import { opportunities, OpportunityType, type CityId } from '@forsa/data';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActionSheetIOS, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { activeFilterCount, emptyFilters, FilterSheet, PRICE_STEPS, type Filters } from '@/components/FilterSheet';
import { OpportunityCard } from '@/components/OpportunityCard';
import { Segmented } from '@/components/Segmented';
import { Text } from '@/components/Text';
import { EmptyState, toast } from '@/components/ui';
import { useT } from '@/i18n';
import { cityName, TYPE_ORDER, typeSegment } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app';
import { MARGIN, TAB_BAR_CLEARANCE, useTheme } from '@/theme';

type Sort = 'newest' | 'priceHigh' | 'priceLow' | 'views';

/** S02 Explore: native search bar, type segmented control, filter sheet, sort, save search, pull to refresh. */
export default function OpportunitiesScreen() {
  const { c } = useTheme();
  const { t, lang } = useT();
  const params = useLocalSearchParams<{ type?: string; city?: string }>();
  const saveSearch = useApp((s) => s.saveSearch);

  const [typeIndex, setTypeIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sheet, setSheet] = useState(false);
  const [sort, setSort] = useState<Sort>('newest');
  const [refreshing, setRefreshing] = useState(false);

  // Deep links from Discover: ?type=2 or ?city=riyadh
  useEffect(() => {
    if (params.type) {
      const i = TYPE_ORDER.indexOf(Number(params.type) as OpportunityType);
      if (i >= 0) setTypeIndex(i + 1);
    }
    if (params.city) setFilters({ ...emptyFilters(), cities: [params.city as CityId] });
  }, [params.type, params.city]);

  const results = useMemo(() => {
    const type = typeIndex === 0 ? null : TYPE_ORDER[typeIndex - 1];
    const q = query.trim().toLowerCase();
    const max = PRICE_STEPS[filters.priceMax];
    const list = opportunities.filter(
      (o) =>
        (!type || o.type === type) &&
        (!q ||
          o.title.toLowerCase().includes(q) ||
          o.shortDescription.toLowerCase().includes(q) ||
          cityName(o.cityId, 'ar').includes(q) ||
          cityName(o.cityId, 'en').toLowerCase().includes(q)) &&
        (filters.categories.length === 0 || filters.categories.includes(o.categoryId)) &&
        (filters.cities.length === 0 || filters.cities.includes(o.cityId)) &&
        (filters.stages.length === 0 || filters.stages.includes(o.stage)) &&
        o.priceSar <= max &&
        (!filters.verifiedOnly || o.verified) &&
        (!filters.withEquity || o.equityPercent !== undefined),
    );
    const sorters: Record<Sort, (a: (typeof list)[0], b: (typeof list)[0]) => number> = {
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      priceHigh: (a, b) => b.priceSar - a.priceSar,
      priceLow: (a, b) => a.priceSar - b.priceSar,
      views: (a, b) => b.views - a.views,
    };
    return [...list].sort(sorters[sort]);
  }, [typeIndex, query, filters, sort]);

  const sortLabels: Record<Sort, string> = {
    newest: t('sortNewest'),
    priceHigh: t('sortPriceHigh'),
    priceLow: t('sortPriceLow'),
    views: t('sortViews'),
  };
  const openSort = () => {
    const keys = Object.keys(sortLabels) as Sort[];
    ActionSheetIOS.showActionSheetWithOptions(
      { title: t('sort'), options: [...keys.map((k) => sortLabels[k]), t('cancel')], cancelButtonIndex: keys.length },
      (i) => {
        if (i < keys.length) {
          haptic.selection();
          setSort(keys[i]);
        }
      },
    );
  };
  const nFilters = activeFilterCount(filters);

  return (
    <>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: t('searchPlaceholder'),
            hideWhenScrolling: false,
            onChangeText: (e) => setQuery(e.nativeEvent.text),
            onCancelButtonPress: () => setQuery(''),
            cancelButtonText: t('cancel'),
          },
        }}
      />
      <FlatList
        data={results}
        keyExtractor={(o) => String(o.id)}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingHorizontal: MARGIN, paddingBottom: TAB_BAR_CLEARANCE, gap: 14 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 800);
            }}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: 12, paddingTop: 4, paddingBottom: 2 }}>
            <Segmented
              values={[t('all'), ...TYPE_ORDER.map((ty) => typeSegment(ty, lang))]}
              index={typeIndex}
              onChange={setTypeIndex}
            />
            <View style={styles.toolbar}>
              <Text variant="footnote" color="labelSecondary" tabular style={{ flex: 1 }}>
                {results.length} {t('results')}
              </Text>
              <Button
                title={nFilters ? `${t('filters')} · ${nFilters}` : t('filters')}
                icon="line.3.horizontal.decrease.circle"
                variant={nFilters ? 'tinted' : 'gray'}
                size="small"
                onPress={() => setSheet(true)}
              />
              <Button title={sortLabels[sort]} icon="arrow.up.arrow.down" variant="gray" size="small" onPress={openSort} />
              <Button
                title=""
                icon="bell.badge"
                variant="gray"
                size="small"
                accessibilityLabel={t('saveSearch')}
                onPress={() => {
                  saveSearch(`${typeIndex}|${query}|${nFilters}`);
                  haptic.light();
                  toast(t('searchSaved'));
                }}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => <OpportunityCard o={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="magnifyingglass"
            title={t('noResults')}
            body={t('noResultsBody')}
            action={t('clearFilters')}
            onAction={() => {
              setFilters(emptyFilters());
              setTypeIndex(0);
            }}
          />
        }
        style={{ backgroundColor: c.groupedBg }}
      />
      <FilterSheet visible={sheet} value={filters} onChange={setFilters} onClose={() => setSheet(false)} resultCount={results.length} />
    </>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
