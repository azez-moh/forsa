import { radii } from '@forsa/tokens';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Icon } from '@/components/Icon';
import { OtpInput } from '@/components/OtpInput';
import { SheetHeader } from '@/components/SheetHeader';
import { Text } from '@/components/Text';
import { Chip, DemoTag } from '@/components/ui';
import { useT } from '@/i18n';
import { clearPendingAuthAction, runPendingAuthAction } from '@/lib/auth';
import { toLatinDigits } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp, type Session } from '@/store/app';
import { MARGIN, useTheme } from '@/theme';

type Step = 'phone' | 'otp' | 'nafath' | 'profile';

/** S13 Auth sheet: shown only when an action needs it. Phone + OTP (mock), Nafath (mock), name + role. */
export default function AuthSheet() {
  const { c } = useTheme();
  const { t } = useT();
  const signIn = useApp((s) => s.signIn);
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Session['role']>('investor');
  const [via, setVia] = useState<Session['via']>('otp');
  const [error, setError] = useState<string | null>(null);
  const [nafathCode] = useState(() => 10 + Math.floor(Math.random() * 89));

  // If the sheet is swiped away, drop the pending action.
  useEffect(() => () => clearPendingAuthAction(), []);

  useEffect(() => {
    if (step !== 'nafath') return;
    const id = setTimeout(() => {
      haptic.success();
      setVia('nafath');
      setName('محمد العتيبي');
      setStep('profile');
    }, 2600);
    return () => clearTimeout(id);
  }, [step]);

  const fail = (m: string) => {
    haptic.error();
    setError(m);
  };

  const onPhone = () => {
    const digits = toLatinDigits(phone).replace(/\D/g, '').replace(/^966/, '').replace(/^0/, '');
    if (!/^5\d{8}$/.test(digits)) return fail(t('phoneError'));
    setPhone(digits);
    setError(null);
    setStep('otp');
  };
  const onOtp = () => {
    if (otp.length !== 4) return fail(t('otpError'));
    setError(null);
    setStep('profile');
  };
  const onFinish = () => {
    if (name.trim().length < 3) return fail(t('nameError'));
    signIn({ name: name.trim(), phone: phone || '5XXXXXXXX', role, via });
    haptic.success();
    router.back();
    runPendingAuthAction();
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: c.groupedBg }}>
      <SheetHeader title={t('authTitle')} />
      <ScrollView contentContainerStyle={{ padding: MARGIN, gap: 16 }} keyboardShouldPersistTaps="handled">
        {step === 'phone' ? (
          <Animated.View entering={FadeIn} style={{ gap: 16 }}>
            <Text variant="subhead" color="labelSecondary">
              {t('authBody')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', direction: 'ltr' }}>
              <View style={[styles.cc, { backgroundColor: c.fillTertiary }]}>
                <Text variant="body" tabular>
                  🇸🇦 +966
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  value={phone}
                  onChangeText={(v) => {
                    setPhone(v);
                    setError(null);
                  }}
                  placeholder="5X XXX XXXX"
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                  autoFocus
                  accessibilityLabel={t('phone')}
                  style={{ textAlign: 'left', writingDirection: 'ltr' }}
                />
              </View>
            </View>
            {error ? (
              <Text variant="footnote" color="danger">
                {error}
              </Text>
            ) : null}
            <Button title={t('sendCode')} full onPress={onPhone} />
            <View style={styles.orRow}>
              <View style={[styles.line, { backgroundColor: c.separator }]} />
              <Text variant="footnote" color="labelSecondary">
                {t('or')}
              </Text>
              <View style={[styles.line, { backgroundColor: c.separator }]} />
            </View>
            <Button title={t('nafath')} icon="person.badge.key" variant="gray" full onPress={() => setStep('nafath')} />
            <View style={{ alignItems: 'center' }}>
              <DemoTag />
            </View>
          </Animated.View>
        ) : null}

        {step === 'otp' ? (
          <Animated.View entering={FadeIn} style={{ gap: 16 }}>
            <Text variant="body" color="labelSecondary" align="center">
              {t('otpBody')} (+966 {phone})
            </Text>
            <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(null); }} error={error} />
            <Button title={t('verify')} full onPress={onOtp} />
          </Animated.View>
        ) : null}

        {step === 'nafath' ? (
          <Animated.View entering={FadeIn} style={{ alignItems: 'center', gap: 16, paddingVertical: 12 }}>
            <DemoTag />
            <Text variant="body" color="labelSecondary" align="center">
              {t('nafathWaiting')}
            </Text>
            <View style={[styles.nafathCode, { backgroundColor: c.card, borderColor: c.primary }]}>
              <Text style={{ fontSize: 48, lineHeight: 56, fontWeight: '700', color: c.primary }} tabular>
                {nafathCode}
              </Text>
            </View>
            <ActivityIndicator />
            <Button title={t('nafathCancel')} variant="plain" size="medium" onPress={() => setStep('phone')} />
          </Animated.View>
        ) : null}

        {step === 'profile' ? (
          <Animated.View entering={FadeIn} style={{ gap: 16 }}>
            {via === 'nafath' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="checkmark.seal.fill" size={18} color={c.success} />
                <Text variant="subhead" color="success">
                  {t('nafathVerified')}
                </Text>
                <DemoTag />
              </View>
            ) : null}
            <Field
              label={t('yourName')}
              value={name}
              onChangeText={(v) => {
                setName(v);
                setError(null);
              }}
              textContentType="name"
              autoComplete="name"
              error={error}
              autoFocus={via === 'otp'}
            />
            <View style={{ gap: 8 }}>
              <Text variant="footnote" color="labelSecondary" weight="600">
                {t('yourRole')}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(
                  [
                    ['investor', 'roleInvestor'],
                    ['owner', 'roleOwner'],
                    ['entrepreneur', 'roleEntre'],
                  ] as const
                ).map(([r, k]) => (
                  <Chip key={r} label={t(k)} selected={role === r} onPress={() => setRole(r)} />
                ))}
              </View>
            </View>
            <Button title={t('finish')} full onPress={onFinish} />
          </Animated.View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  cc: { height: 44, borderRadius: radii.md, paddingHorizontal: 12, justifyContent: 'center' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  nafathCode: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
