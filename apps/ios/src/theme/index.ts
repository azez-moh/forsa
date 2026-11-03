import { brandSource, button, colors as tokenColors, radii, spacing, typography, type TypographyToken } from '@forsa/tokens';
import { useColorScheme, type TextStyle } from 'react-native';

import { useApp } from '@/store/app';

export type Palette = (typeof tokenColors)['light'] | (typeof tokenColors)['dark'];

export type Theme = {
  scheme: 'light' | 'dark';
  c: Palette & {
    navy: string;
    warm: string;
    card: string;
    groupedBg: string;
  };
};

/** Resolved colors for the current appearance (tokens are the only source of hex). */
export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const base = tokenColors[scheme];
  return {
    scheme,
    c: {
      ...base,
      navy: brandSource.navy,
      warm: brandSource.warm,
      card: scheme === 'dark' ? base.bgSecondary : base.bgPrimary,
      groupedBg: scheme === 'dark' ? base.bgPrimary : base.bgSecondary,
    },
  };
}

const weightMap: Record<number, TextStyle['fontWeight']> = { 400: '400', 500: '500', 600: '600', 700: '700' };

/**
 * Text style from the Dynamic Type scale in @forsa/tokens.
 * Arabic gets the taller line height; tracking is always 0 for Arabic.
 * React Native scales these with the user's text size setting (allowFontScaling).
 */
export function typeStyle(token: TypographyToken, lang: 'ar' | 'en'): TextStyle {
  const t = typography[token];
  return {
    fontSize: t.size,
    lineHeight: lang === 'ar' ? t.lineHeightAr : t.lineHeight,
    fontWeight: weightMap[t.weight] ?? '400',
    letterSpacing: lang === 'ar' ? 0 : t.trackingLatin * t.size,
  };
}

export function useType() {
  const lang = useApp((s) => s.lang);
  return (token: TypographyToken) => typeStyle(token, lang);
}

export const space = spacing;
export const radius = radii;
export const buttonSpec = button;
export const MARGIN = 16;
/** Height of the floating tab bar + its bottom gap, used to pad scroll content. */
export const TAB_BAR_CLEARANCE = 112;
