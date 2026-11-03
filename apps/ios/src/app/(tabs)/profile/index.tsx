import { getConsultant, getOpportunity, getService } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { I18nManager, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { OpportunityCard } from '@/components/OpportunityCard';
import { BOUNCY } from '@/components/Pressable';
import { Segmented } from '@/components/Segmented';
import { Text } from '@/components/Text';
import { Badge, Card, EmptyState, Row } from '@/components/ui';
import { useT } from '@/i18n';
import { requireAuth } from '@/lib/auth';
import { alert } from '@/lib/dialogs';
import { cityName, daysSince, num, relativeTime, sar, statusKey, typeColor, typeShort } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { applyDirection } from '@/lib/reload';
import { useApp, type MyListing } from '@/store/app';
import { MARGIN, TAB_BAR_CLEARANCE, useTheme } from '@/theme';

/** S06 Profile: my listings (with stats), saved, my requests, services & bookings; settings; links to S14. */
export default function Profile() {
  const { c, scheme } = useTheme();
  const { t, lang } = useT();
  const session = useApp((s) => s.session);
  const signOut = useApp((s) => s.signOut);
  const setLang = useApp((s) => s.setLang);
  const myListings = useApp((s) => s.myListings);
  const saved = useApp((s) => s.saved);
  const sent = useApp((s) => s.sent);
  const serviceRequests = useApp((s) => s.serviceRequests);
  const bookings = useApp((s) => s.bookings);
  const lastPublishedId = useApp((s) => s.lastPublishedId);
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState(0);
  useEffect(() => {
    const map: Record<string, number> = { listings: 0, saved: 1, requests: 2, services: 3 };
    if (params.tab && params.tab in map) setTab(map[params.tab]);
  }, [params.tab]);

  useEffect(() => {
    if (lastPublishedId) setTab(0);
  }, [lastPublishedId]);

  const switchLang = (next: 'ar' | 'en') => {
    if (next === lang) return;
    haptic.selection();
    setLang(next);
    useApp.setState({ rtlBootReloads: 1 }); // the switch below handles the reload itself
    const wantRTL = next === 'ar';
    if (I18nManager.isRTL === wantRTL) return;
    alert(t('langReloadTitle'), t('langReloadBody'), [
      { text: t('restartLater'), style: 'cancel', onPress: () => I18nManager.forceRTL(wantRTL) },
      {
        text: t('restartNow'),
        onPress: async () => {
          // Let AsyncStorage flush the new language before reloading.
          await new Promise((r) => setTimeout(r, 300));
          const ok = await applyDirection(wantRTL);
          if (!ok) alert(t('langReloadTitle'), t('restartManual'));
        },
      },
    ]);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE }}>
      <Card style={[styles.account, { marginHorizontal: MARGIN }]}>
        <View style={[styles.avatar, { backgroundColor: c.primaryTint }]}>
          <Text variant="title2" color="primary">
            {session ? session.name.charAt(0) : '؟'}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headline">{session?.name ?? t('guest')}</Text>
          {session ? (
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Text variant="footnote" color="labelSecondary" tabular>
                +966 {session.phone}
              </Text>
              {session.via === 'nafath' ? <Badge label={t('verified')} tone="success" icon="checkmark.seal.fill" /> : null}
            </View>
          ) : (
            <Text variant="footnote" color="labelSecondary">
              {t('authBody')}
            </Text>
          )}
        </View>
        {!session ? <Button title={t('signInCta')} size="small" onPress={() => requireAuth(() => {})} /> : null}
      </Card>

      <View style={{ paddingHorizontal: MARGIN, marginTop: 20 }}>
        <Segmented values={[t('myListings'), t('mySaved'), t('myRequests'), t('myServices')]} index={tab} onChange={setTab} />
      </View>

      <View style={{ paddingHorizontal: MARGIN, marginTop: 14, gap: 10 }}>
        {tab === 0 ? (
          session ? (
            myListings.length ? (
              myListings.map((l) => <ListingRow key={l.id} l={l} fly={l.id === lastPublishedId} />)
            ) : (
              <EmptyState icon="square.stack" title={t('emptyListings')} action={t('addYourOpportunity')} onAction={() => router.push('/listing/new')} />
            )
          ) : (
            <EmptyState icon="square.stack" title={t('emptyListings')} action={t('addYourOpportunity')} onAction={() => router.push('/listing/new')} />
          )
        ) : null}

        {tab === 1 ? (
          saved.length ? (
            saved.map((id) => {
              const o = getOpportunity(id);
              return o ? (
                <Animated.View key={id} layout={LinearTransition} entering={FadeIn}>
                  <OpportunityCard o={o} />
                </Animated.View>
              ) : null;
            })
          ) : (
            <EmptyState icon="heart" title={t('emptySaved')} action={t('explore')} onAction={() => router.push('/opportunities')} />
          )
        ) : null}

        {tab === 2 ? (
          sent.length ? (
            sent.map((q) => {
              const o = getOpportunity(q.opportunityId);
              return (
                <Card key={q.id} style={{ gap: 6 }}>
                  <Text variant="headline" numberOfLines={2}>
                    {o?.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Badge label={t(statusKey[q.status])} tone={q.docsApproved ? 'success' : 'primary'} />
                    <Text variant="caption1" color="labelSecondary">
                      {relativeTime(q.updatedAt, lang)}
                    </Text>
                  </View>
                  <Button
                    title={o?.title ? t('viewRequestStatus') : ''}
                    variant="plain"
                    size="small"
                    onPress={() => router.push({ pathname: '/opportunity/[id]', params: { id: String(q.opportunityId) } })}
                  />
                </Card>
              );
            })
          ) : (
            <EmptyState icon="paperplane" title={t('emptyRequests')} action={t('explore')} onAction={() => router.push('/opportunities')} />
          )
        ) : null}

        {tab === 3 ? (
          serviceRequests.length || bookings.length ? (
            <>
              {bookings.map((b) => {
                const cons = getConsultant(b.consultantId);
                return (
                  <Card key={b.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Icon name="calendar.badge.checkmark" size={24} color={c.success} />
                    <View style={{ flex: 1 }}>
                      <Text variant="headline">{cons?.name}</Text>
                      <Text variant="footnote" color="labelSecondary" tabular>
                        {b.day} · {b.time}
                      </Text>
                    </View>
                    <Badge label={t('bookingConfirmed')} tone="success" />
                  </Card>
                );
              })}
              {serviceRequests.map((r) => {
                const svc = getService(r.serviceId);
                return (
                  <Card key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Icon name="briefcase" size={22} color={c.primary} />
                    <View style={{ flex: 1 }}>
                      <Text variant="headline" numberOfLines={1}>
                        {svc?.title}
                      </Text>
                      <Text variant="footnote" color="labelSecondary" numberOfLines={1}>
                        {r.notes}
                      </Text>
                    </View>
                    <Badge label={t('requestSubmitted')} />
                  </Card>
                );
              })}
            </>
          ) : (
            <EmptyState icon="briefcase" title={t('emptyServices')} action={t('browseServices')} onAction={() => router.push('/services')} />
          )
        ) : null}
      </View>

      <Text variant="footnote" color="labelSecondary" style={styles.groupLabel}>
        {t('explorePlatform')}
      </Text>
      <Card padded={false} style={{ marginHorizontal: MARGIN }}>
        <Row icon="briefcase.fill" iconBg={c.primary} title={t('servicesHeader')} onPress={() => router.push('/services')} />
        <Row icon="person.2.fill" iconBg={scheme === 'dark' ? c.rowIndigo : c.navy} title={t('consultantsHeader')} onPress={() => router.push('/consultants')} />
        <Row icon="play.rectangle.fill" iconBg={c.danger} title={t('learnHeader')} onPress={() => router.push('/learn')} last />
      </Card>

      <Text variant="footnote" color="labelSecondary" style={styles.groupLabel}>
        {t('settings')}
      </Text>
      <Card style={{ marginHorizontal: MARGIN, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[styles.rowIcon, { backgroundColor: c.rowIndigo }]}>
            <Icon name="globe" size={16} color="#FFFFFF" />
          </View>
          <Text style={{ flex: 1 }}>{t('language')}</Text>
          <Segmented values={['العربية', 'English']} index={lang === 'ar' ? 0 : 1} onChange={(i) => switchLang(i === 0 ? 'ar' : 'en')} style={{ width: 170 }} />
        </View>
      </Card>

      <Card padded={false} style={{ marginHorizontal: MARGIN, marginTop: 20 }}>
        <Row icon="info.circle.fill" iconBg={c.rowGray} title={t('aboutTitle')} onPress={() => router.push('/about')} />
        <Row icon="questionmark.circle.fill" iconBg={c.rowGray} title={t('faqTitle')} onPress={() => router.push('/faq')} last={!session} />
        {session ? (
          <Row
            title={t('signOut')}
            destructive
            last
            onPress={() =>
              alert(t('signOutConfirm'), undefined, [
                { text: t('cancel'), style: 'cancel' },
                { text: t('signOut'), style: 'destructive', onPress: signOut },
              ])
            }
          />
        ) : null}
      </Card>
      <Text variant="caption2" color="labelTertiary" align="center" style={{ marginTop: 16 }}>
        {t('conceptNote')}
      </Text>
    </ScrollView>
  );
}

/**
 * Listing row with stats. A freshly published listing "flies in" from below (spring.bouncy) and its
 * status flips from قيد المراجعة to منشورة a few seconds later (mock review).
 */
function ListingRow({ l, fly }: { l: MyListing; fly: boolean }) {
  const { c } = useTheme();
  const { t, lang } = useT();
  const reduced = useReducedMotion();
  const consume = useApp((s) => s.consumePublished);
  const y = useSharedValue(fly && !reduced ? 420 : 0);
  const scale = useSharedValue(fly && !reduced ? 0.6 : 1);
  const rot = useSharedValue(fly && !reduced ? -8 : 0);
  const opacity = useSharedValue(fly ? 0 : 1);

  useEffect(() => {
    if (!fly) return;
    opacity.value = withTiming(1, { duration: reduced ? 150 : 200 });
    if (!reduced) {
      y.value = withDelay(150, withSpring(0, BOUNCY));
      scale.value = withDelay(150, withSpring(1, BOUNCY));
      rot.value = withDelay(150, withSpring(0, BOUNCY));
    }
    const id = setTimeout(consume, 1200);
    return () => clearTimeout(id);
  }, [fly, reduced, y, scale, rot, opacity, consume]);

  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }, { scale: scale.value }, { rotateZ: `${rot.value}deg` }],
  }));
  const days = daysSince(l.createdAt);
  const published = l.status === 'published';
  const zeroInquiryTip = published && l.inquiries === 0 && days >= 14;

  return (
    <Animated.View style={anim} layout={LinearTransition.springify()}>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: typeColor(l.type) }} />
          <Text variant="caption1" color="labelSecondary" weight="600" style={{ flex: 1 }}>
            {typeShort(l.type, lang)} · {cityName(l.cityId, lang)}
          </Text>
          <Animated.View key={l.status} entering={FadeIn.duration(300)}>
            <Badge label={published ? t('lsPublished') : t('lsReview')} tone={published ? 'success' : 'warning'} icon={published ? 'checkmark.circle.fill' : 'clock'} />
          </Animated.View>
        </View>
        <Text variant="headline" numberOfLines={2}>
          {l.title}
        </Text>
        <Text variant="title3" color="primary" tabular>
          {sar(l.priceSar, lang)}
        </Text>
        <View style={styles.stats}>
          {[
            { v: num(l.views), k: t('views') },
            { v: num(l.saves), k: t('saves') },
            { v: num(l.inquiries), k: t('inquiriesLabel') },
            { v: num(days), k: t('daysLive') },
          ].map((s) => (
            <View key={s.k} style={[styles.stat, { backgroundColor: c.fillTertiary }]} accessible accessibilityLabel={`${s.k} ${s.v}`}>
              <Text variant="headline" tabular>
                {s.v}
              </Text>
              <Text variant="caption2" color="labelSecondary">
                {s.k}
              </Text>
            </View>
          ))}
        </View>
        {zeroInquiryTip ? (
          <Text variant="footnote" color="warning">
            {t('tipAddFinancials')}
          </Text>
        ) : null}
        {l.seeded ? (
          <Button title={t('manageListing')} variant="tinted" size="medium" onPress={() => router.push('/inbox')} />
        ) : null}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  account: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  groupLabel: { paddingHorizontal: MARGIN + 16, marginTop: 28, marginBottom: 6 },
  rowIcon: { width: 29, height: 29, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 6 },
  stat: { flex: 1, borderRadius: radii.sm, paddingVertical: 8, alignItems: 'center' },
});
