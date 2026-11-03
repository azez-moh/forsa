import { categories, cities, OpportunityType, type CategoryId, type CityId, type OpportunityStage } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeIn, SlideInLeft, SlideInRight, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Icon } from '@/components/Icon';
import { ScalePressable } from '@/components/Pressable';
import { SheetHeader } from '@/components/SheetHeader';
import { Text } from '@/components/Text';
import { Badge, Card, Chip, DemoTag, ErrorText } from '@/components/ui';
import { useT, type StringKey } from '@/i18n';
import { requireAuth } from '@/lib/auth';
import { cityName, parseAmount, priceInWords, sar, sarFull, stageLabel, TYPE_ORDER, typeColor, typeLong, typeSymbol } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { emptyDraft, useApp, type ListingDraft } from '@/store/app';
import { MARGIN, useTheme } from '@/theme';

const STEPS: StringKey[] = ['stType', 'stBasics', 'stFinancials', 'stMedia', 'stReview'];
const PHOTO_TINTS = ['#0275D9', '#17234F', '#4EA7DF', '#5E6AD2', '#B5577A', '#0262B8'];

/**
 * S05 Add opportunity wizard: type → basics → financials → media → review → publish.
 * Autosaves a draft locally; guests start without login and sign in only at "انشر الفرصة".
 * Commission (2.5%) is disclosed at the publish step with one checkbox (no pledge at sign-up).
 */
export default function AddWizard() {
  const { c } = useTheme();
  const { t, lang, loc } = useT();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const stored = useApp((s) => s.draft);
  const saveDraft = useApp((s) => s.saveDraft);
  const clearDraft = useApp((s) => s.clearDraft);
  const publish = useApp((s) => s.publish);

  const [resumePrompt, setResumePrompt] = useState(!!stored && (stored.title.length > 0 || stored.step > 0));
  const [d, setD] = useState<ListingDraft>(stored ?? emptyDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Autosave (US-LST-01)
  useEffect(() => {
    if (resumePrompt) return;
    const id = setTimeout(() => saveDraft(d), 400);
    return () => clearTimeout(id);
  }, [d, resumePrompt, saveDraft]);

  const set = (patch: Partial<ListingDraft>) => {
    setD((prev) => ({ ...prev, ...patch }));
    setErrors({});
  };
  const price = parseAmount(d.price);
  const isIdea = d.type === OpportunityType.InvestorForIdea;
  const isSale = d.type === OpportunityType.ForSale;
  const isPartner = d.type === OpportunityType.PartnerSearch;

  const validate = (step: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (step === 0 && !d.type) e.type = t('required');
    if (step === 1) {
      const title = d.title.trim();
      const bad = !d.type || title === typeLong(d.type, 'ar') || cities.some((ct) => ct.name.ar === title);
      if (title.length < 10 || title.length > 80 || bad) e.title = t('titleError');
      if (!d.categoryId) e.category = t('required');
      if (!d.cityId) e.city = t('required');
    }
    if (step === 2) {
      if (!(price > 0)) e.price = t('priceError');
      const eq = parseAmount(d.equity);
      if (d.equity && (eq < 1 || eq > 100)) e.equity = t('equityError');
      if (d.margin && parseAmount(d.margin) > 100) e.margin = t('marginError');
    }
    return e;
  };

  const go = (to: number) => {
    if (to > d.step) {
      const e = validate(d.step);
      if (Object.keys(e).length) {
        haptic.error();
        setErrors(e);
        return;
      }
    }
    haptic.light();
    setDirection(to > d.step ? 1 : -1);
    set({ step: to });
  };

  const onPublish = () => {
    if (!agree) {
      haptic.error();
      setErrors({ agree: t('commissionError') });
      return;
    }
    requireAuth(() => {
      const id = publish({
        type: d.type ?? OpportunityType.ForSale,
        title: d.title.trim(),
        priceSar: price,
        cityId: d.cityId ?? 'riyadh',
        categoryId: d.categoryId ?? 'other',
      });
      haptic.success();
      router.back();
      // Card flies into "فرصي" on the Profile tab; status flips to منشورة after ~3s (mock review).
      setTimeout(() => router.navigate('/profile'), 250);
      setTimeout(() => useApp.getState().markPublished(id), 3500);
    });
  };

  if (resumePrompt) {
    return (
      <View style={{ flex: 1, backgroundColor: c.groupedBg }}>
        <SheetHeader title={t('addTitle')} />
        <View style={{ padding: MARGIN, gap: 12 }}>
          <Card style={{ gap: 6 }}>
            <Text variant="headline">{t('resumeDraft')}</Text>
            <Text variant="subhead" color="labelSecondary" numberOfLines={2}>
              {stored?.title || (stored?.type ? typeLong(stored.type, lang) : '')}
            </Text>
          </Card>
          <Button title={t('resumeDraft')} full onPress={() => setResumePrompt(false)} />
          <Button
            title={t('startOver')}
            variant="gray"
            full
            onPress={() => {
              clearDraft();
              setD(emptyDraft());
              setResumePrompt(false);
            }}
          />
        </View>
      </View>
    );
  }

  const fwd = (direction === 1) === (lang === 'ar') ? SlideInLeft : SlideInRight;
  const enter = reduced ? FadeIn.duration(150) : fwd.springify().damping(20);

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: c.groupedBg }}>
      <SheetHeader title={`${t('addTitle')} · ${t(STEPS[d.step])}`} step={d.step} total={STEPS.length} />
      <ScrollView contentContainerStyle={{ padding: MARGIN, gap: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <Animated.View key={d.step} entering={enter} style={{ gap: 16 }}>
          {d.step === 0 ? (
            <>
              <Text variant="title2">{t('chooseType')}</Text>
              {TYPE_ORDER.map((type) => {
                const selected = d.type === type;
                return (
                  <ScalePressable
                    key={type}
                    haptics="selection"
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => set({ type })}
                    style={[styles.typeOption, { backgroundColor: c.card, borderColor: selected ? c.primary : 'transparent' }]}
                  >
                    <View style={[styles.typeIcon, { backgroundColor: c.primaryTint }]}>
                      <Icon name={typeSymbol[type]} size={22} color={typeColor(type)} />
                    </View>
                    <Text variant="headline" style={{ flex: 1 }}>
                      {typeLong(type, lang)}
                    </Text>
                    <Icon name={selected ? 'checkmark.circle.fill' : 'circle'} size={22} color={selected ? c.primary : c.labelTertiary} />
                  </ScalePressable>
                );
              })}
              {errors.type ? (
                <ErrorText>{errors.type}</ErrorText>
              ) : null}
            </>
          ) : null}

          {d.step === 1 ? (
            <>
              <Field label={t('title')} value={d.title} onChangeText={(v) => set({ title: v })} error={errors.title} maxLength={80} hint={`${d.title.length}/80`} />
              <Field label={t('description')} value={d.description} onChangeText={(v) => set({ description: v })} multiline />
              <Group label={t('category')} error={errors.category}>
                {categories.map((cat) => (
                  <Chip key={cat.id} label={loc(cat.name)} selected={d.categoryId === cat.id} onPress={() => set({ categoryId: cat.id as CategoryId })} />
                ))}
              </Group>
              <Group label={t('city')} error={errors.city}>
                {cities.slice(0, 10).map((ct) => (
                  <Chip key={ct.id} label={loc(ct.name)} selected={d.cityId === ct.id} onPress={() => set({ cityId: ct.id as CityId })} />
                ))}
              </Group>
              <Group label={t('stage')}>
                {(Object.keys(stageLabel) as OpportunityStage[]).map((s) => (
                  <Chip key={s} label={stageLabel[s][lang]} selected={d.stage === s} onPress={() => set({ stage: s })} />
                ))}
              </Group>
              {/* Type-specific fields (US-LST-02) */}
              {isSale ? <Field label={t('reasonForSale')} value={d.extra1} onChangeText={(v) => set({ extra1: v })} /> : null}
              {d.type === OpportunityType.Investment ? <Field label={t('useOfFunds')} value={d.extra1} onChangeText={(v) => set({ extra1: v })} /> : null}
              {isPartner ? (
                <>
                  <Field label={t('roleSought')} value={d.extra1} onChangeText={(v) => set({ extra1: v })} />
                  <Field label={t('whatIBring')} value={d.extra2} onChangeText={(v) => set({ extra2: v })} />
                </>
              ) : null}
              {isIdea ? (
                <>
                  <Field label={t('teamSize')} value={d.extra1} onChangeText={(v) => set({ extra1: v })} keyboardType="number-pad" />
                  <Field label={t('traction')} value={d.extra2} onChangeText={(v) => set({ extra2: v })} multiline />
                </>
              ) : (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Field label={t('branches')} value={d.branches} onChangeText={(v) => set({ branches: v })} keyboardType="number-pad" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label={t('employees')} value={d.employees} onChangeText={(v) => set({ employees: v })} keyboardType="number-pad" />
                  </View>
                </View>
              )}
            </>
          ) : null}

          {d.step === 2 ? (
            <>
              <Field
                label={isSale ? t('priceLabel') : t('investLabel')}
                value={d.price ? Number(parseAmount(d.price)).toLocaleString('en-US') : ''}
                onChangeText={(v) => set({ price: String(parseAmount(v) || '') })}
                keyboardType="number-pad"
                error={errors.price}
                hint={price > 0 && lang === 'ar' ? priceInWords(price) : undefined}
                style={{ fontVariant: ['tabular-nums'] }}
              />
              {isSale && price > 0 && price < 10_000 ? (
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,149,0,0.12)' }}>
                  <Icon name="exclamationmark.triangle.fill" size={18} color={c.warning} />
                  <Text variant="subhead" style={{ flex: 1 }}>
                    {t('didYouMean')} {sarFull(price * 1000, lang)}؟
                  </Text>
                  <Button title={t('done')} variant="tinted" size="small" onPress={() => set({ price: String(price * 1000) })} />
                </Card>
              ) : null}
              <View style={[styles.switchRow, { backgroundColor: c.card }]}>
                <Text style={{ flex: 1 }}>{t('negotiable')}</Text>
                <Switch value={d.negotiable} onValueChange={(v) => { haptic.selection(); set({ negotiable: v }); }} trackColor={{ true: c.primary }} />
              </View>
              {!isSale ? <Field label={t('equityLabel')} value={d.equity} onChangeText={(v) => set({ equity: v })} keyboardType="number-pad" error={errors.equity} /> : null}
              {!isIdea ? (
                <>
                  <Field label={t('revenueLabel')} value={d.revenue} onChangeText={(v) => set({ revenue: v })} keyboardType="number-pad" />
                  <Field label={t('marginLabel')} value={d.margin} onChangeText={(v) => set({ margin: v })} keyboardType="number-pad" error={errors.margin} />
                </>
              ) : null}
            </>
          ) : null}

          {d.step === 3 ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text variant="headline" style={{ flex: 1 }}>
                  {t('addPhotos')}
                </Text>
                <DemoTag />
              </View>
              <Text variant="footnote" color="labelSecondary">
                {t('photosHint')}
              </Text>
              <View style={styles.photos}>
                {d.photos.map((p, i) => (
                  <ScalePressable
                    key={`${p}-${i}`}
                    onPress={() => set({ cover: i })}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('cover')} ${i + 1}`}
                    style={[styles.photo, { borderColor: d.cover === i ? c.primary : 'transparent' }]}
                  >
                    <LinearGradient colors={[PHOTO_TINTS[p % PHOTO_TINTS.length], c.navy]} style={StyleSheet.absoluteFill} />
                    <Icon name="photo" size={22} color="rgba(255,255,255,0.8)" />
                    {d.cover === i ? (
                      <View style={styles.coverTag}>
                        <Badge label={t('cover')} tone="primary" />
                      </View>
                    ) : null}
                  </ScalePressable>
                ))}
                {d.photos.length < 10 ? (
                  <ScalePressable
                    haptics="light"
                    onPress={() => set({ photos: [...d.photos, d.photos.length] })}
                    accessibilityRole="button"
                    accessibilityLabel={t('addPhotos')}
                    style={[styles.photo, styles.addPhoto, { borderColor: c.separator, backgroundColor: c.fillTertiary }]}
                  >
                    <Icon name="plus" size={24} color={c.primary} />
                  </ScalePressable>
                ) : null}
              </View>
              <View style={[styles.switchRow, { backgroundColor: c.card }]}>
                <View style={{ flex: 1 }}>
                  <Text>{t('ndaToggle')}</Text>
                  <Text variant="footnote" color="labelSecondary">
                    {t('ndaToggleHint')}
                  </Text>
                </View>
                <Switch value={d.ndaRequired} onValueChange={(v) => { haptic.selection(); set({ ndaRequired: v }); }} trackColor={{ true: c.primary }} />
              </View>
              {d.ndaRequired ? (
                <Card style={{ gap: 8 }}>
                  <Text variant="headline">{t('confidentialFiles')}</Text>
                  {d.files.map((f) => (
                    <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 32 }}>
                      <Icon name="lock.doc" size={18} color={c.primary} />
                      <Text variant="subhead">{f}</Text>
                    </View>
                  ))}
                  <Button
                    title={t('addFile')}
                    icon="doc.badge.plus"
                    variant="tinted"
                    size="medium"
                    onPress={() => set({ files: [...d.files, ['القوائم المالية.pdf', 'التدفقات النقدية.xlsx', 'السجل التجاري.pdf'][d.files.length % 3]] })}
                  />
                </Card>
              ) : null}
            </>
          ) : null}

          {d.step === 4 ? (
            <>
              <Text variant="footnote" color="labelSecondary" weight="600">
                {t('preview')}
              </Text>
              <PreviewCard d={d} price={price} />
              <Card padded={false}>
                {[
                  { step: 0, label: t('stType'), value: d.type ? typeLong(d.type, lang) : '—' },
                  { step: 1, label: t('stBasics'), value: `${d.title} · ${d.cityId ? cityName(d.cityId, lang) : ''}` },
                  { step: 2, label: t('stFinancials'), value: price ? sarFull(price, lang) : '—' },
                  { step: 3, label: t('stMedia'), value: `${d.photos.length} · ${d.ndaRequired ? t('ndaToggle') : ''}` },
                ].map((r, i) => (
                  <View key={r.step} style={[styles.reviewRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.separator }]}>
                    <View style={{ flex: 1 }}>
                      <Text variant="footnote" color="labelSecondary">
                        {r.label}
                      </Text>
                      <Text variant="subhead" numberOfLines={2}>
                        {r.value}
                      </Text>
                    </View>
                    <Button title={t('edit')} variant="plain" size="small" onPress={() => go(r.step)} />
                  </View>
                ))}
              </Card>
              <Card style={{ gap: 12, backgroundColor: c.primaryTint }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Icon name="info.circle.fill" size={20} color={c.primary} />
                  <Text variant="subhead" weight="600" style={{ flex: 1 }}>
                    {t('commission')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Switch
                    value={agree}
                    onValueChange={(v) => {
                      haptic.selection();
                      setAgree(v);
                      setErrors({});
                    }}
                    trackColor={{ true: c.primary }}
                    accessibilityLabel={t('commissionAgree')}
                  />
                  <Text variant="subhead" style={{ flex: 1 }}>
                    {t('commissionAgree')}
                  </Text>
                </View>
                <Button title={t('terms')} variant="plain" size="small" onPress={() => Alert.alert(t('terms'), t('aboutDisclaimer'))} />
                {errors.agree ? (
                  <ErrorText>{errors.agree}</ErrorText>
                ) : null}
              </Card>
            </>
          ) : null}
        </Animated.View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8, borderTopColor: c.separator }]}>
        {d.step > 0 ? <Button title={t('back')} variant="gray" onPress={() => go(d.step - 1)} style={{ flex: 1 }} full /> : null}
        {d.step < STEPS.length - 1 ? (
          <Button title={t('next')} onPress={() => go(d.step + 1)} style={{ flex: 2 }} full />
        ) : (
          <Button title={t('publish')} icon="paperplane.fill" onPress={onPublish} style={{ flex: 2 }} full />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function PreviewCard({ d, price }: { d: ListingDraft; price: number }) {
  const { c } = useTheme();
  const { lang } = useT();
  return (
    <View style={[styles.preview, { backgroundColor: c.card }]}>
      <View style={{ height: 150 }}>
        <LinearGradient
          colors={d.photos.length ? [PHOTO_TINTS[d.photos[d.cover] % PHOTO_TINTS.length], c.navy] : [c.primaryTint, c.primaryTint]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          {d.type ? <Icon name={typeSymbol[d.type]} size={40} color={d.photos.length ? 'rgba(255,255,255,0.8)' : c.primary} /> : null}
        </View>
      </View>
      <View style={{ padding: 14, gap: 4 }}>
        {d.type ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: typeColor(d.type) }} />
            <Text variant="caption1" color="labelSecondary" weight="600">
              {typeLong(d.type, lang)}
            </Text>
          </View>
        ) : null}
        <Text variant="headline" numberOfLines={2}>
          {d.title || '—'}
        </Text>
        <Text variant="subhead" color="labelSecondary">
          {d.cityId ? cityName(d.cityId, lang) : ''}
        </Text>
        <Text variant="title3" color="primary" tabular>
          {price ? sar(price, lang) : '—'}
        </Text>
      </View>
    </View>
  );
}

function Group({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="footnote" color="labelSecondary" weight="600">
        {label}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
      {error ? (
        <ErrorText>{error}</ErrorText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  typeOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radii.lg, borderWidth: 2, minHeight: 64 },
  typeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.md, minHeight: 44 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photo: { width: 104, height: 65, borderRadius: radii.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  addPhoto: { borderStyle: 'dashed', borderWidth: 1 },
  coverTag: { position: 'absolute', top: 4, start: 4 },
  reviewRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  preview: { borderRadius: radii.lg, overflow: 'hidden' },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: MARGIN, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
