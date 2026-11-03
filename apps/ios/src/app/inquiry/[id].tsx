import { getOpportunity, opportunities } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Switch, View, type TextInputInstance } from 'react-native';
import Animated, { FadeIn, SlideInLeft, SlideInRight, ZoomIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Icon } from '@/components/Icon';
import { NotifyPrompt } from '@/components/NotifyPrompt';
import { OtpInput } from '@/components/OtpInput';
import { SheetHeader } from '@/components/SheetHeader';
import { Text } from '@/components/Text';
import { Card, Chip, DemoTag, EmptyState } from '@/components/ui';
import { useT } from '@/i18n';
import { requireAuth } from '@/lib/auth';
import { dateLocale, sar } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app';
import { MARGIN, useTheme } from '@/theme';

type Step = 'message' | 'nda' | 'otp' | 'success';

const BUDGETS = [500_000, 1_000_000, 5_000_000, 10_000_000];

/** Web static export (browser preview): pre-render one page per record. Ignored on native. */
export function generateStaticParams() {
  return opportunities.map((o) => ({ id: String(o.id) }));
}

/**
 * S04 Inquiry + NDA (formSheet): message → NDA review + typed-name signature → OTP → success.
 * Listings without an NDA skip straight to sending. Sign-in is requested only at the send step.
 */
export default function InquirySheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const o = getOpportunity(Number(id));
  const { c } = useTheme();
  const { t, lang } = useT();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const session = useApp((s) => s.session);
  const sendInquiry = useApp((s) => s.sendInquiry);

  const [step, setStep] = useState<Step>('message');
  const [message, setMessage] = useState(o ? `${t('messageOpener')}${o.title}.` : '');
  const [budget, setBudget] = useState<number | null>(null);
  const [timeline, setTimeline] = useState<'tlNow' | 'tl3' | 'tl6'>('tl3');
  const [investorType, setInvestorType] = useState<'itIndividual' | 'itAngel' | 'itCompany' | 'itFund'>('itAngel');
  // Prefill from the profile (US-INQ-02): owners/providers are usually companies, investors angels.
  useEffect(() => {
    if (!session) return;
    const r = session.roles ?? [];
    setInvestorType(r.includes('provider') || r.includes('owner') ? 'itCompany' : r.includes('investor') ? 'itAngel' : 'itIndividual');
  }, [session]);
  const [agree, setAgree] = useState(false);
  const [signature, setSignature] = useState('');
  const [fullText, setFullText] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const messageRef = useRef<TextInputInstance>(null);
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // If the sheet is dismissed mid-verification, nothing is recorded.
  useEffect(() => () => {
    if (submitTimer.current) clearTimeout(submitTimer.current);
  }, []);

  useEffect(() => {
    if (session && !signature) setSignature(session.name);
  }, [session, signature]);

  if (!o) {
    return (
      <View style={{ flex: 1, backgroundColor: c.groupedBg }}>
        <SheetHeader title={t('inquiryTitle')} />
        <EmptyState icon="questionmark.folder" title={t('noResults')} action={t('done')} onAction={() => router.back()} />
      </View>
    );
  }
  const nda = o.ndaRequired;
  const steps: Step[] = nda ? ['message', 'nda', 'otp', 'success'] : ['message', 'success'];
  const idx = steps.indexOf(step);
  const fwd = lang === 'ar' ? SlideInLeft : SlideInRight; // forward motion follows reading direction
  const enter = reduced ? FadeIn.duration(150) : fwd.springify().damping(20);

  const fail = (msg: string) => {
    haptic.error();
    setError(msg);
  };

  const submit = (signed: boolean) => {
    sendInquiry({
      opportunityId: o.id,
      message: message.trim(),
      budget: budget ? sar(budget, 'ar') : undefined,
      timeline: t(timeline),
      investorType: t(investorType),
      status: signed ? 'nda-signed' : 'new',
      ndaSignedAt: signed ? new Date().toISOString() : undefined,
      ndaSignedName: signed ? signature.trim() : undefined,
    });
    haptic.success();
    setStep('success');
  };

  const next = () => {
    setError(null);
    if (step === 'message') {
      if (message.trim().length < 10) {
        messageRef.current?.focus();
        return fail(t('messageError'));
      }
      // Gate at the moment of action: sign in, then continue exactly here.
      requireAuth(() => (nda ? setStep('nda') : submit(false)));
      return;
    }
    if (step === 'nda') {
      if (!agree || signature.trim().split(/\s+/).length < 2) return fail(t('ndaAgreeError'));
      haptic.light();
      setStep('otp');
      return;
    }
    if (step === 'otp') {
      if (otp.length !== 4) return fail(t('otpError'));
      setBusy(true);
      submitTimer.current = setTimeout(() => {
        setBusy(false);
        submit(true); // NDA signed → success haptic
      }, 700);
    }
  };

  const titleFor: Record<Step, string> = {
    message: t('inquiryTitle'),
    nda: t('ndaTitle'),
    otp: t('otpTitle'),
    success: t('successTitle'),
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: c.groupedBg }}>
      <SheetHeader title={titleFor[step]} step={step === 'success' ? undefined : idx} total={steps.length - 1} />
      <ScrollView contentContainerStyle={{ padding: MARGIN, gap: 18, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="building.2" size={20} color={c.primary} />
          <Text variant="subhead" weight="600" numberOfLines={2} style={{ flex: 1 }}>
            {o.title}
          </Text>
        </Card>

        {step === 'message' ? (
          <Animated.View key="message" entering={enter} style={{ gap: 18 }}>
            <Field
              ref={messageRef}
              label={t('yourMessage')}
              value={message}
              onChangeText={(v) => {
                setMessage(v);
                if (error) setError(null);
              }}
              multiline
              error={error}
            />
            <ChipGroup label={t('budget')}>
              {BUDGETS.map((b) => (
                <Chip key={b} label={`≤ ${sar(b, lang)}`} selected={budget === b} onPress={() => setBudget(b)} />
              ))}
            </ChipGroup>
            <ChipGroup label={t('timeline')}>
              {(['tlNow', 'tl3', 'tl6'] as const).map((k) => (
                <Chip key={k} label={t(k)} selected={timeline === k} onPress={() => setTimeline(k)} />
              ))}
            </ChipGroup>
            <ChipGroup label={t('investorType')}>
              {(['itIndividual', 'itAngel', 'itCompany', 'itFund'] as const).map((k) => (
                <Chip key={k} label={t(k)} selected={investorType === k} onPress={() => setInvestorType(k)} />
              ))}
            </ChipGroup>
          </Animated.View>
        ) : null}

        {step === 'nda' ? (
          <Animated.View key="nda" entering={enter} style={{ gap: 16 }}>
            <Card style={{ gap: 12 }}>
              {(['ndaSummary1', 'ndaSummary2', 'ndaSummary3'] as const).map((k) => (
                <View key={k} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <Icon name="checkmark.shield" size={18} color={c.primary} />
                  <Text variant="subhead" style={{ flex: 1 }}>
                    {t(k)}
                  </Text>
                </View>
              ))}
              <Button title={fullText ? t('ndaHideFull') : t('ndaReadFull')} variant="plain" size="medium" onPress={() => setFullText((v) => !v)} />
              {fullText ? (
                <Animated.View entering={FadeIn}>
                  <Text variant="footnote" color="labelSecondary">
                    {t('ndaFull')}
                  </Text>
                </Animated.View>
              ) : null}
            </Card>
            <View style={[styles.agree, { backgroundColor: c.card }]}>
              <Text variant="body" style={{ flex: 1 }}>
                {t('ndaAgree')}
              </Text>
              <Switch
                value={agree}
                onValueChange={(v) => {
                  haptic.selection();
                  setAgree(v);
                  setError(null);
                }}
                trackColor={{ true: c.primary }}
                accessibilityLabel={t('ndaAgree')}
              />
            </View>
            <Field
              label={t('signatureLabel')}
              value={signature}
              onChangeText={(v) => {
                setSignature(v);
                setError(null);
              }}
              autoComplete="name"
              textContentType="name"
              hint={t('signatureHint')}
              error={error}
            />
            {signature.trim() ? (
              <View style={[styles.signature, { borderColor: c.separator }]}>
                <Text style={{ fontSize: 26, lineHeight: 40, fontStyle: 'italic', color: c.navy }}>{signature.trim()}</Text>
                <Text variant="caption1" color="labelSecondary" tabular>
                  {new Date().toLocaleString(dateLocale(lang))}
                </Text>
              </View>
            ) : null}
          </Animated.View>
        ) : null}

        {step === 'otp' ? (
          <Animated.View key="otp" entering={enter} style={{ gap: 16 }}>
            <Text variant="body" align="center" color="labelSecondary">
              {t('otpBody')}
              {session?.phone ? ` (+966 ${session.phone})` : ''}
            </Text>
            <OtpInput
              value={otp}
              onChange={(v) => {
                setOtp(v);
                setError(null);
              }}
              error={error}
            />
          </Animated.View>
        ) : null}

        {step === 'success' ? (
          <Animated.View key="success" entering={reduced ? FadeIn : ZoomIn.springify().damping(14)} style={{ alignItems: 'center', gap: 14, paddingTop: 12 }}>
            <View style={[styles.successIcon, { backgroundColor: c.successTint }]}>
              <Icon name="checkmark" size={40} color={c.success} weight="bold" />
            </View>
            <Text variant="title2" align="center">
              {t('successTitle')}
            </Text>
            <Text variant="body" color="labelSecondary" align="center">
              {nda ? t('successNda') : t('successNoNda')}
            </Text>
            <Card style={{ alignSelf: 'stretch', gap: 10 }}>
              {(['next1', 'next2'] as const).map((k, i) => (
                <View key={k} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <View style={[styles.num, { backgroundColor: c.fillTertiary }]}>
                    <Text variant="footnote" weight="600">
                      {i + 1}
                    </Text>
                  </View>
                  <Text variant="subhead" style={{ flex: 1 }}>
                    {t(k)}
                  </Text>
                </View>
              ))}
            </Card>
            <NotifyPrompt />
          </Animated.View>
        ) : null}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8, borderTopColor: c.separator, backgroundColor: c.groupedBg }]}>
        {step === 'success' ? (
          <Button title={t('done')} full onPress={() => router.back()} />
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {idx > 0 ? (
              <Button title={t('back')} variant="gray" onPress={() => setStep(steps[idx - 1])} style={{ flex: 1 }} full />
            ) : null}
            <Button
              title={step === 'message' ? (nda ? t('continue') : t('sendRequest')) : step === 'nda' ? t('signNda') : t('verify')}
              icon={step === 'nda' ? 'signature' : undefined}
              loading={busy}
              onPress={next} haptics={false}
              style={{ flex: 2 }}
              full
            />
          </View>
        )}
        {step === 'otp' ? (
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <DemoTag />
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="footnote" color="labelSecondary" weight="600">
        {label}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  agree: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radii.md, minHeight: 44 },
  signature: { borderBottomWidth: 1, borderStyle: 'dashed', paddingVertical: 8, alignItems: 'center' },
  successIcon: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  num: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: MARGIN, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
