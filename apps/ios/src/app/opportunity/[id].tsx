import { getOpportunity, getService, OpportunityType, opportunities, users, type Opportunity } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Share, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInUp,
  interpolate,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useReducedMotion,
  useScrollOffset,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { BlurView } from 'expo-blur';

import { Button } from '@/components/Button';
import { DocViewer } from '@/components/DocViewer';
import { Icon } from '@/components/Icon';
import { OpportunityCard } from '@/components/OpportunityCard';
import { ScalePressable } from '@/components/Pressable';
import { Text } from '@/components/Text';
import { Badge, Card, DemoTag, EmptyState, SectionHeader, toast, ErrorText } from '@/components/ui';
import { useT, type StringKey } from '@/i18n';
import { categoryName, cityName, countNoun, daysSince, statusKey, num, priceInWords, sarFull, stageLabel, typeColor, typeShort, typeSymbol } from '@/lib/format';
import { biometricGate } from '@/lib/faceid';
import { haptic } from '@/lib/haptics';
import { isOwnListing, useApp } from '@/store/app';
import { MARGIN, useTheme } from '@/theme';

const HERO = 340;
const W = Dimensions.get('window').width;

type Metric = { key: StringKey; value?: string; locked?: boolean };

/** Structured, labelled metrics. Undisclosed values show "متاح بعد اتفاقية عدم الإفصاح", never 0. */
function buildMetrics(o: Opportunity, lang: 'ar' | 'en', t: (k: StringKey) => string, unlocked: boolean): Metric[] {
  const m = o.metrics;
  const lockedOr = (v: number | undefined, fmt: (n: number) => string): Pick<Metric, 'value' | 'locked'> =>
    v !== undefined && v > 0 ? { value: fmt(v) } : o.ndaRequired && !unlocked ? { locked: true } : {};
  const isIdea = o.type === OpportunityType.InvestorForIdea;
  const list: Metric[] = [
    {
      key: o.type === OpportunityType.ForSale ? 'price' : 'requiredInvestment',
      value: sarFull(o.priceSar, lang) + (o.priceNegotiable ? ` · ${t('negotiable')}` : ''),
    },
    { key: 'equity', ...(o.equityPercent ? { value: `${o.equityPercent}%` } : {}) },
    { key: 'annualRevenue', ...lockedOr(m.annualRevenueSar, (n) => sarFull(n, lang)) },
    { key: 'netMargin', ...lockedOr(m.profitMargin, (n) => `${Math.round(n * 100)}%`) },
    { key: 'monthlyProfit', ...lockedOr(m.monthlyNetProfitSar, (n) => sarFull(n, lang)) },
    { key: 'payback', ...lockedOr(m.paybackMonths, (n) => countNoun(n, 'month', lang)) },
  ];
  if (!isIdea) {
    list.push(
      { key: 'branches', ...(m.branches ? { value: num(m.branches) } : {}) },
      { key: 'employees', ...(m.employees ? { value: num(m.employees) } : {}) },
      // junk values like "1 m²" are hidden
      { key: 'area', ...(m.unitAreaSqm && m.unitAreaSqm > 5 ? { value: `${num(m.unitAreaSqm)} ${t('sqm')}` } : {}) },
      { key: 'projectAge', ...(m.projectAgeYears && m.projectAgeYears > 0 ? { value: `${m.projectAgeYears} ${t('years')}` } : {}) },
    );
  }
  // Show set values and locked ones; drop fields that are simply not applicable.
  return list.filter((x) => x.value || x.locked);
}

const DOCS = ['القوائم المالية 2024–2025.pdf', 'نموذج التدفقات النقدية.xlsx', 'عقد الإيجار والتراخيص.pdf'];

export default function OpportunityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const o = getOpportunity(Number(id));
  const { c } = useTheme();
  const { t, lang } = useT();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const saved = useApp((s) => (o ? s.saved.includes(o.id) : false));
  const toggleSave = useApp((s) => s.toggleSave);
  const myListings = useApp((s) => s.myListings);
  const myInquiry = useApp((s) => s.sent.find((x) => x.opportunityId === Number(id)));
  const approveDocs = useApp((s) => s.approveDocs);
  const session = useApp((s) => s.session);
  const [doc, setDoc] = useState<string | null>(null);
  const [gateError, setGateError] = useState(false);
  // Light status bar over the darkened hero photo; system default once the glass header takes over.
  const [overHero, setOverHero] = useState(true);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const offset = useScrollOffset(scrollRef);
  useAnimatedReaction(
    () => offset.value < HERO - 100,
    (now, prev) => {
      if (now !== prev) scheduleOnRN(setOverHero, now);
    },
  );

  // Parallax: image moves at half speed and stretches on overscroll.
  const heroStyle = useAnimatedStyle(() => {
    if (reduced) return {};
    return {
      transform: [
        { translateY: interpolate(offset.value, [-HERO, 0, HERO], [-HERO / 2, 0, HERO * 0.5], Extrapolation.CLAMP) },
        { scale: interpolate(offset.value, [-HERO, 0], [2, 1], Extrapolation.CLAMP) },
      ],
    };
  });
  // Glass header fades in once the hero has scrolled away.
  const headerBg = useAnimatedStyle(() => ({ opacity: interpolate(offset.value, [HERO - 140, HERO - 80], [0, 1], Extrapolation.CLAMP) }));
  const headerTitle = useAnimatedStyle(() => ({ opacity: interpolate(offset.value, [HERO - 60, HERO - 20], [0, 1], Extrapolation.CLAMP) }));

  if (!o) {
    return <EmptyState icon="questionmark.folder" title={t('noResults')} />;
  }

  const owner = users.find((u) => u.id === o.ownerId);
  const own = isOwnListing(o.ownerId, o.id, myListings) && !!session;
  const unlocked = !!myInquiry?.docsApproved;
  const metrics = buildMetrics(o, lang, t, unlocked);
  const similar = opportunities.filter((x) => x.id !== o.id && (x.type === o.type || x.categoryId === o.categoryId)).slice(0, 4);
  const posted = daysSince(o.createdAt);
  const feasibility = getService(2);

  const share = async () => {
    haptic.light();
    const url = `https://forsh.sa/opportunities/${o.id}`;
    // NDA-required listings share public fields only.
    const message = `${o.title}\n${typeShort(o.type, lang)} · ${cityName(o.cityId, lang)}\n${sarFull(o.priceSar, lang)}\n${url}`;
    try {
      await Share.share({ message, url, title: o.title });
    } catch {
      // user cancelled
    }
  };

  const openDoc = async (name: string) => {
    setGateError(false);
    const res = await biometricGate(t('faceIdReason'), t('cancel'));
    if (res === 'ok') setDoc(name);
    else if (res === 'unavailable') {
      toast(t('faceIdUnavailable'));
      setDoc(name);
    } else {
      haptic.error();
      setGateError(true);
    }
  };

  const cta = own
    ? { title: t('manageListing'), icon: 'slider.horizontal.3', onPress: () => router.push('/inbox') }
    : myInquiry
      ? { title: t('viewRequestStatus'), icon: 'clock', onPress: () => router.push({ pathname: '/profile', params: { tab: 'requests' } }) }
      : { title: t('requestContact'), icon: 'paperplane.fill', onPress: () => router.push({ pathname: '/inquiry/[id]', params: { id: String(o.id) } }) };

  return (
    <View style={{ flex: 1, backgroundColor: c.groupedBg }}>
      <StatusBar style={overHero ? 'light' : 'auto'} />
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerBlurEffect: undefined,
          headerTitle: '',
          headerBackground: () => (
            <Animated.View style={[StyleSheet.absoluteFill, headerBg]}>
              <BlurView intensity={90} tint="systemChromeMaterial" style={StyleSheet.absoluteFill} />
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: c.separator }} />
            </Animated.View>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <HeaderCircle icon={saved ? 'heart.fill' : 'heart'} tint={saved ? c.danger : undefined} label={saved ? t('saved') : t('save')} onPress={() => {
                const now = toggleSave(o.id);
                haptic.light();
                toast(now ? t('savedToast') : t('unsavedToast'));
              }} />
              <HeaderCircle icon="square.and.arrow.up" label={t('share')} onPress={share} />
            </View>
          ),
        }}
      />
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 140 + insets.bottom }} contentInsetAdjustmentBehavior="never">
        <View style={{ height: HERO, overflow: 'hidden' }}>
          <Link.AppleZoomTarget>
            <Animated.View style={[{ height: HERO, width: W }, heroStyle]}>
              {o.images[0] ? (
                <Image source={{ uri: o.images[0] }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: c.navy, alignItems: 'center', justifyContent: 'center' }]}>
                  <Icon name={typeSymbol[o.type]} size={72} color={c.onDarkTertiary} />
                </View>
              )}
              <View style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} />
            </Animated.View>
          </Link.AppleZoomTarget>
          {o.images.length > 1 ? (
            <View style={[styles.counter, { backgroundColor: c.scrimStrong }]}>
              <Text variant="caption1" weight="600" style={{ color: '#FFFFFF' }} tabular>
                1 / {o.images.length}
              </Text>
            </View>
          ) : null}
        </View>

        <Animated.View entering={reduced ? undefined : FadeInUp.delay(120).duration(350)} style={[styles.sheet, { backgroundColor: c.groupedBg }]}>
          <View style={styles.metaRow}>
            <View style={[styles.dot, { backgroundColor: typeColor(o.type) }]} />
            <Text variant="footnote" weight="600" color="labelSecondary">
              {typeShort(o.type, lang)}
            </Text>
            {o.verified ? <Badge label={t('verified')} tone="success" icon="checkmark.seal.fill" /> : <Badge label={t('notVerified')} tone="neutral" />}
          </View>
          <Animated.View style={headerTitle} />
          <Text variant="title2" accessibilityRole="header">
            {o.title}
          </Text>
          <Text variant="subhead" color="labelSecondary">
            {cityName(o.cityId, lang)} · {categoryName(o.categoryId, lang)} · {stageLabel[o.stage][lang]}
          </Text>

          <View style={{ marginTop: 14 }}>
            <Text variant="title1" color="primary" tabular>
              {sarFull(o.priceSar, lang)}
            </Text>
            {lang === 'ar' ? (
              <Text variant="footnote" color="labelSecondary">
                {priceInWords(o.priceSar)}
              </Text>
            ) : null}
          </View>

          <View style={styles.counters}>
            <Text variant="footnote" color="labelSecondary" tabular>
              {posted === 0 ? t('today') : lang === 'ar' ? `${t('postedAgo')} ${countNoun(posted, 'day', 'ar')}` : `${t('postedAgo')} ${countNoun(posted, 'day', 'en')} ago`}
            </Text>
            <Text variant="footnote" color="labelSecondary" tabular>
              · {t('views')} {num(o.views)}
            </Text>
            <Text variant="footnote" color="labelSecondary" tabular>
              · {t('inquiriesLabel')} {num(o.inquiries)}
            </Text>
          </View>
        </Animated.View>

        <SectionHeader title={t('keyMetrics')} />
        <View style={styles.grid}>
          {metrics.map((m) => (
            <View key={m.key} style={[styles.metric, { backgroundColor: c.card }]} accessible accessibilityLabel={`${t(m.key)}: ${m.value ?? t('afterNda')}`}>
              <Text variant="caption1" color="labelSecondary">
                {t(m.key)}
              </Text>
              {m.locked ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="lock.fill" size={12} color={c.labelSecondary} />
                  <Text variant="footnote" color="labelSecondary" style={{ flex: 1 }}>
                    {t('afterNda')}
                  </Text>
                </View>
              ) : (
                <Text variant="headline" tabular numberOfLines={2}>
                  {m.value}
                </Text>
              )}
            </View>
          ))}
        </View>

        <SectionHeader title={t('about')} />
        <Card style={{ marginHorizontal: MARGIN, gap: 12 }}>
          <Text variant="body">{o.description}</Text>
          {o.highlights.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {o.highlights.map((h) => (
                <Badge key={h} label={h} tone="neutral" />
              ))}
            </View>
          ) : null}
        </Card>

        <SectionHeader title={t('owner')} />
        <Card style={{ marginHorizontal: MARGIN, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.avatar, { backgroundColor: c.primaryTint }]}>
              <Icon name="person.fill" size={20} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="headline">{owner?.displayName ?? (lang === 'ar' ? 'صاحب المشروع' : 'Business owner')}</Text>
              <Text variant="footnote" color="labelSecondary">
                {t('memberSince')} {(owner?.joinedAt ?? o.createdAt).slice(0, 4)}
              </Text>
            </View>
          </View>
          {o.verified ? (
            <>
              <TrustLine icon="person.badge.shield.checkmark" label={t('nafathVerified')} />
              <TrustLine icon="doc.text.magnifyingglass" label={t('crVerified')} />
            </>
          ) : (
            <Text variant="footnote" color="labelSecondary">
              {t('notVerified')}
            </Text>
          )}
        </Card>

        {o.ndaRequired ? (
          <>
            <SectionHeader title={t('confidentialDocs')} />
            <Card style={{ marginHorizontal: MARGIN, gap: 4 }} padded>
              <Text variant="footnote" color={unlocked ? 'success' : 'labelSecondary'} style={{ marginBottom: 6 }}>
                {unlocked ? t('docsReady') : myInquiry?.ndaSignedAt ? t('docsAwaiting') : t('docsLockedSign')}
              </Text>
              {DOCS.map((d) => (
                <ScalePressable
                  key={d}
                  disabled={!unlocked}
                  onPress={() => openDoc(d)}
                  pressScale={0.99}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !unlocked }}
                  style={[styles.docRow, { borderTopColor: c.separator }]}
                >
                  <Icon name={unlocked ? 'faceid' : 'lock.fill'} size={18} color={unlocked ? c.primary : c.labelTertiary} />
                  <Text variant="subhead" style={{ flex: 1, opacity: unlocked ? 1 : 0.6 }} numberOfLines={1}>
                    {d}
                  </Text>
                  {unlocked ? <Icon name="chevron.forward" directional size={13} color={c.labelTertiary} /> : null}
                </ScalePressable>
              ))}
              {gateError ? (
                <ErrorText>{t('faceIdFailed')}</ErrorText>
              ) : null}
              {myInquiry?.ndaSignedAt && !unlocked ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <Button
                    title={t('simulateApproval')}
                    haptics={false}
                    variant="tinted"
                    size="small"
                    onPress={() => {
                      approveDocs(myInquiry.id);
                      haptic.success();
                    }}
                  />
                  <DemoTag />
                </View>
              ) : null}
            </Card>
          </>
        ) : null}

        {(o.type === OpportunityType.ForSale || o.type === OpportunityType.Investment) && feasibility ? (
          <ScalePressable
            onPress={() => router.push({ pathname: '/services/[id]', params: { id: String(feasibility.id) } })}
            accessibilityRole="button"
            style={[styles.crossSell, { backgroundColor: c.primaryTint }]}
          >
            <Icon name="chart.bar.doc.horizontal" size={24} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="headline">{t('crossSellTitle')}</Text>
              <Text variant="footnote" color="labelSecondary">
                {t('crossSellBody')}
              </Text>
            </View>
            <Icon name="chevron.forward" directional size={14} color={c.primary} />
          </ScalePressable>
        ) : null}

        {similar.length ? (
          <>
            <SectionHeader title={t('similar')} />
            <Animated.FlatList
              horizontal
              data={similar}
              keyExtractor={(x) => String(x.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: MARGIN, gap: 12 }}
              renderItem={({ item }) => <OpportunityCard o={item} compact />}
            />
          </>
        ) : null}
        <Text variant="caption2" color="labelTertiary" align="center" style={{ marginTop: 20, paddingHorizontal: MARGIN }}>
          {t('sourceNote')}
        </Text>
      </Animated.ScrollView>

      {/* Sticky primary action over a material bar */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 8, borderTopColor: c.separator }]}>
        <BlurView intensity={90} tint="systemChromeMaterial" style={StyleSheet.absoluteFill} />
        <View style={{ flex: 1, gap: 2 }}>
          {myInquiry && !own ? (
            <Badge label={t(statusKey[myInquiry.status])} tone={myInquiry.docsApproved ? 'success' : 'primary'} />
          ) : (
            <Text variant="caption1" color="labelSecondary">
              {o.type === OpportunityType.ForSale ? t('price') : t('requiredInvestment')}
            </Text>
          )}
          <Text variant="headline" tabular numberOfLines={1}>
            {sarFull(o.priceSar, lang)}
          </Text>
        </View>
        <Button title={cta.title} icon={cta.icon} onPress={cta.onPress} style={{ flex: 1.3 }} full />
      </View>

      <DocViewer doc={doc} name={session?.name ?? t('guest')} onClose={() => setDoc(null)} />
    </View>
  );
}

function HeaderCircle({ icon, onPress, label, tint }: { icon: string; onPress: () => void; label: string; tint?: string }) {
  const { c } = useTheme();
  return (
    <ScalePressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={styles.headerCircle}>
      <BlurView intensity={70} tint="systemThinMaterial" style={StyleSheet.absoluteFill} />
      <Icon name={icon} size={17} color={tint ?? c.labelPrimary} weight="semibold" />
    </ScalePressable>
  );
}

function TrustLine({ icon, label }: { icon: string; label: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name={icon} size={16} color={c.success} />
      <Text variant="subhead">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  counter: { position: 'absolute', bottom: 28, end: 16, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  sheet: { marginTop: -20, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, paddingHorizontal: MARGIN, paddingTop: 20, gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  counters: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: MARGIN },
  metric: { flexBasis: '47%', flexGrow: 1, borderRadius: radii.md, padding: 12, gap: 4, minHeight: 72 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, borderTopWidth: StyleSheet.hairlineWidth },
  crossSell: { marginHorizontal: MARGIN, marginTop: 24, borderRadius: radii.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: MARGIN,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  headerCircle: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
