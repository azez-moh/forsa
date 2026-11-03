import { getArticle, opportunities } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { FlatList, ScrollView, Share, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { OpportunityCard } from '@/components/OpportunityCard';
import { Text } from '@/components/Text';
import { Card, EmptyState, SectionHeader } from '@/components/ui';
import { useT } from '@/i18n';
import { MARGIN, useTheme } from '@/theme';

/** S12 Article detail with linked opportunities (content ↔ listings). */
export default function Article() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const a = getArticle(slug);
  const { c } = useTheme();
  const { t } = useT();
  if (!a) return <EmptyState icon="doc.text" title={t('noResults')} />;
  const related = opportunities.filter((o) => a.relatedTypes?.includes(o.type)).slice(0, 4);
  const url = a.sourceUrl ?? `https://forsh.sa/articles/${a.slug}`;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button title="" icon="square.and.arrow.up" variant="plain" size="medium" accessibilityLabel={t('share')} onPress={() => Share.share({ message: `${a.title}\n${url}`, url }).catch(() => {})} />
          ),
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 48 }}>
        {a.image ? (
          <Image source={{ uri: a.image }} style={{ marginHorizontal: MARGIN, aspectRatio: 16 / 10, borderRadius: radii.xl }} contentFit="cover" transition={200} />
        ) : null}
        <View style={{ padding: MARGIN, gap: 10 }}>
          <Text variant="title1" accessibilityRole="header">
            {a.title}
          </Text>
          <Text variant="footnote" color="labelSecondary" tabular>
            {a.publishedAt} · {a.readingMinutes} {t('minRead')} · {t('views')} {a.views}
          </Text>
          <Text variant="body">{a.excerpt}</Text>
        </View>
        <SectionHeader title={t('inThisArticle')} />
        <Card style={{ marginHorizontal: MARGIN, gap: 10 }}>
          {a.headings.map((h, i) => (
            <View key={h} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Text variant="subhead" color="labelSecondary" tabular style={{ width: 20 }}>
                {i + 1}
              </Text>
              <Text variant="subhead" style={{ flex: 1 }}>
                {h}
              </Text>
            </View>
          ))}
        </Card>
        <Button
          title={t('readFull')}
          icon="safari"
          variant="tinted"
          style={{ marginHorizontal: MARGIN, marginTop: 16 }}
          full
          onPress={() => WebBrowser.openBrowserAsync(url, { controlsColor: c.primary }).catch(() => {})}
        />
        {related.length ? (
          <>
            <SectionHeader title={t('relatedOpps')} />
            <FlatList
              horizontal
              data={related}
              keyExtractor={(o) => String(o.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: MARGIN, gap: 12 }}
              renderItem={({ item }) => <OpportunityCard o={item} compact />}
            />
          </>
        ) : null}
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Icon name="book.closed" size={18} color={c.labelTertiary} />
        </View>
      </ScrollView>
    </>
  );
}
