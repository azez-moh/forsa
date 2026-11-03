import { radii } from '@forsa/tokens';
import { forwardRef, useEffect } from 'react';
import { StyleSheet, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { useT } from '@/i18n';
import { announce } from '@/lib/a11y';
import { useTheme, useType } from '@/theme';

import { Text } from './Text';

type Props = TextInputProps & { label?: string; error?: string | null; hint?: string };

/** iOS input: 44pt, radius 12, tertiary fill, no border until focus; inline error below. */
export const Field = forwardRef<TextInputInstance, Props>(function Field({ label, error, hint, style, multiline, ...rest }, ref) {
  const { c } = useTheme();
  const type = useType();
  const { lang } = useT();
  // VoiceOver: speak validation errors as they appear.
  useEffect(() => {
    announce(error);
  }, [error]);
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text variant="footnote" color="labelSecondary" weight="600">
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={c.labelTertiary}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        {...rest}
        style={[
          type('body'),
          styles.input,
          {
            backgroundColor: c.fillTertiary,
            color: c.labelPrimary,
            borderColor: error ? c.danger : 'transparent',
            minHeight: multiline ? 110 : 44,
            textAlignVertical: multiline ? 'top' : 'center',
            textAlign: lang === 'ar' ? 'right' : 'left',
            writingDirection: lang === 'ar' ? 'rtl' : 'ltr',
          },
          style,
        ]}
      />
      {error ? (
        <Text variant="footnote" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="footnote" color="labelSecondary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  input: { borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1 },
});
