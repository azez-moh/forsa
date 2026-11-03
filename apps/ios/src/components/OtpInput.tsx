import { radii } from '@forsa/tokens';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';

import { useT } from '@/i18n';
import { toLatinDigits } from '@/lib/format';
import { useTheme } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';
import { DemoTag } from './ui';

/** 4-digit code with iOS one-time-code autofill and a 60s resend timer. Mock: any 4 digits pass. */
export function OtpInput({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string | null }) {
  const { c } = useTheme();
  const { t } = useT();
  const ref = useRef<TextInputInstance>(null);
  const [left, setLeft] = useState(60);
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const id = setTimeout(() => ref.current?.focus(), 350);
    return () => clearTimeout(id);
  }, []);
  return (
    <View style={{ gap: 12 }}>
      <Pressable onPress={() => ref.current?.focus()} accessibilityRole="none">
        <View style={styles.row} accessible={false}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.box,
                { backgroundColor: c.fillTertiary, borderColor: error ? c.danger : value.length === i ? c.primary : 'transparent' },
              ]}
            >
              <Text variant="title1" tabular>
                {value[i] ?? ''}
              </Text>
            </View>
          ))}
        </View>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={(v) => onChange(toLatinDigits(v).replace(/\D/g, '').slice(0, 4))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={4}
          style={styles.hidden}
          accessibilityLabel={t('otpBody')}
        />
      </Pressable>
      {error ? (
        <Text variant="footnote" color="danger" align="center">
          {error}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <DemoTag />
        <Text variant="footnote" color="labelSecondary">
          {t('otpDemo')}
        </Text>
      </View>
      {left > 0 ? (
        <Text variant="footnote" color="labelSecondary" align="center" tabular>
          {t('resendIn')} {left} {t('seconds')}
        </Text>
      ) : (
        <Button title={t('resend')} variant="plain" size="medium" style={{ alignSelf: 'center' }} onPress={() => setLeft(60)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Boxes read left-to-right in both languages (digits are LTR).
  row: { flexDirection: 'row', direction: 'ltr', justifyContent: 'center', gap: 12 },
  box: { width: 58, height: 64, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  hidden: { position: 'absolute', opacity: 0.01, width: 1, height: 1 },
});
