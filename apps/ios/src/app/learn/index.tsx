import { articles, videoCategories, videos } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ScalePressable } from '@/components/Pressable';
import { Segmented } from '@/components/Segmented';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { MARGIN, useTheme } from '@/theme';

/** S11 Culture center: videos open in an in-app Safari view (YouTube); S12 articles. */
export default function Learn() {
  const { c } = useTheme();
  const { t } = useT();
  const [tab, setTab] = useState(0);

  const openVideo = async (youtubeId: string) => {
    haptic.light();
    await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${youtubeId}`, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: c.primary,
    }).catch(() => {});
  };

  if (tab === 0) {
    return (
      <FlatList
        key="videos"
        data={videos}
        keyExtractor={(v) => v.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: MARGIN, gap: 14, paddingBottom: 48 }}
        ListHeaderComponent={<Segmented values={[t('videos'), t('articles')]} index={tab} onChange={setTab} />}
        renderItem={({ item }) => {
          const cat = videoCategories.find((x) => x.id === item.categoryId);
          return (
            <ScalePressable
              onPress={() => openVideo(item.youtubeId)}
              accessibilityRole="button"
              accessibilityHint={t('watchOnYoutube')}
              style={[styles.video, { backgroundColor: c.card }]}
            >
              <View style={{ aspectRatio: 16 / 9, backgroundColor: c.fillTertiary }}>
                <Image source={{ uri: item.thumbnail }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
                <View style={styles.play}>
                  <Icon name="play.fill" size={22} color="#FFFFFF" />
                </View>
              </View>
              <View style={{ padding: 14, gap: 4 }}>
                <Text variant="caption1" color="labelSecondary" weight="600">
                  {cat?.name}
                </Text>
                <Text variant="headline">{item.title}</Text>
                <Text variant="footnote" color="labelSecondary" tabular>
                  {t('views')} {item.views}
                </Text>
              </View>
            </ScalePressable>
          );
        }}
      />
    );
  }
  return (
    <FlatList
      key="articles"
      data={articles}
      keyExtractor={(a) => a.slug}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: MARGIN, gap: 12, paddingBottom: 48 }}
      ListHeaderComponent={<Segmented values={[t('videos'), t('articles')]} index={tab} onChange={setTab} />}
      renderItem={({ item }) => (
        <ScalePressable
          onPress={() => router.push({ pathname: '/learn/articles/[slug]', params: { slug: item.slug } })}
          accessibilityRole="button"
          style={[styles.article, { backgroundColor: c.card }]}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="headline" numberOfLines={3}>
              {item.title}
            </Text>
            <Text variant="footnote" color="labelSecondary" tabular>
              {item.readingMinutes} {t('minRead')} · {t('views')} {item.views}
            </Text>
          </View>
          {item.image ? <Image source={{ uri: item.image }} style={styles.thumb} contentFit="cover" transition={200} /> : null}
        </ScalePressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  video: { borderRadius: radii.lg, overflow: 'hidden' },
  play: { position: 'absolute', alignSelf: 'center', top: '38%', width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  article: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radii.lg, alignItems: 'center' },
  thumb: { width: 84, height: 84, borderRadius: radii.md },
});
