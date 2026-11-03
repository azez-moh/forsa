import { brandSource, button, colors as tokenColors, opportunityTypes, radii, spacing, typography, type TypographyToken } from '@forsa/tokens';
import { useColorScheme, type TextStyle } from 'react-native';

import { useApp } from '@/store/app';

export type Palette = (typeof tokenColors)['light'] | (typeof tokenColors)['dark'];

export type Theme = {
  scheme: 'light' | 'dark';
  c: Palette & {
    navy: string;
    /** Deeper navy for the bottom of the hero gradient (derived from brand navy). */
    navyDeep: string;
    warm: string;
    card: string;
    groupedBg: string;
    successTint: string;
    warningTint: string;
    dangerTint: string;
    /** Brand-blue glows on the navy hero. */
    glowPrimary: string;
    glowPrimaryClear: string;
    glowAccent: string;
    glowAccentClear: string;
    /** Icon tile colours for settings-style rows (readable in light and dark). */
    rowIndigo: string;
    rowGray: string;
    /** Scrims and text on photos/dark surfaces. */
    scrim: string;
    scrimStrong: string;
    onDark: string;
    onDarkSecondary: string;
    onDarkTertiary: string;
  };
};

/** "#RRGGBB" + alpha → "rgba(r,g,b,a)". */
export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Darken a hex colour by mixing toward black. */
function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  const ch = (v: number) => Math.round(v * (1 - amount)).toString(16).padStart(2, '0');
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

/** Resolved colors for the current appearance (tokens are the only source of hex). */
export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const base = tokenColors[scheme];
  return {
    scheme,
    c: {
      ...base,
      navy: brandSource.navy,
      navyDeep: shade(brandSource.navy, 0.33),
      warm: brandSource.warm,
      card: scheme === 'dark' ? base.bgSecondary : base.bgPrimary,
      groupedBg: scheme === 'dark' ? base.bgPrimary : base.bgSecondary,
      successTint: alpha(base.success, 0.14),
      warningTint: alpha(base.warning, 0.14),
      dangerTint: alpha(base.danger, 0.12),
      glowPrimary: alpha(brandSource.primary, 0.85),
      glowPrimaryClear: alpha(brandSource.primary, 0),
      glowAccent: alpha(brandSource.accent, 0.6),
      glowAccentClear: alpha(brandSource.accent, 0),
      rowIndigo: opportunityTypes.partner.color,
      rowGray: scheme === 'dark' ? '#636366' : '#8E8E93', // iOS systemGray
      scrim: 'rgba(0,0,0,0.18)',
      scrimStrong: 'rgba(0,0,0,0.5)',
      onDark: '#FFFFFF',
      onDarkSecondary: 'rgba(255,255,255,0.75)',
      onDarkTertiary: 'rgba(255,255,255,0.5)',
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
