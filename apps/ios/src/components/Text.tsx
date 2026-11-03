import type { TypographyToken } from '@forsa/tokens';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { useType, useTheme, type Palette } from '@/theme';

type Props = TextProps & {
  variant?: TypographyToken;
  color?: keyof Palette | (string & {});
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
  /** Tabular numerals for prices and counters. */
  tabular?: boolean;
};

/**
 * System font (SF Pro / SF Arabic, chosen automatically by iOS), Dynamic Type sizes from tokens.
 * Text aligns to the writing direction, so it flips with RTL.
 */
export function Text({ variant = 'body', color = 'labelPrimary', weight, align, tabular, style, ...rest }: Props) {
  const { c } = useTheme();
  const type = useType();
  const resolved = (c as Record<string, string>)[color] ?? color;
  return (
    <RNText
      maxFontSizeMultiplier={2.4}
      {...rest}
      style={[
        type(variant),
        { color: resolved, textAlign: align ?? 'auto', writingDirection: 'auto' },
        weight ? { fontWeight: weight } : null,
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
    />
  );
}
