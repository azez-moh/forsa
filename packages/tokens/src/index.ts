/**
 * @forsa/tokens — Design tokens for فرصة وتمكين (Forsa w Tamkeen)
 * Apple HIG-aligned, Arabic-first (RTL), light + dark.
 * Spec: docs/02-design-system.md
 */

/* ------------------------------------------------------------------ */
/* Brand source — the ONLY place brand hex lives.                       */
/* Verified from the live forsh.sa computed styles (Nov 2026):          */
/*   primary button bg #0275D9, navy hero/nav #17234F, link sky #4EA7DF,*/
/*   font Tajawal.                                                      */
/* ------------------------------------------------------------------ */
export const brandSource = {
  primary: '#0275D9', // Forsa royal blue (CTA "إضافة فرصة")
  primaryDark: '#4EA7DF', // Forsa sky blue, lifted for dark backgrounds
  navy: '#17234F', // Forsa deep navy (hero, footer, logo)
  accent: '#4EA7DF', // sky blue
  accentText: '#0262B8', // text-safe blue on light
  accentDark: '#8CC8F0',
  warm: '#FF9F43', // existing orange highlight, use sparingly
  provisional: false,
} as const;

/* ------------------------------------------------------------------ */
/* Color                                                              */
/* ------------------------------------------------------------------ */
export const colors = {
  light: {
    primary: brandSource.primary,
    primaryTint: 'rgba(2,117,217,0.12)',
    onPrimary: '#FFFFFF',
    accent: brandSource.accent,
    accentText: brandSource.accentText,

    bgPrimary: '#FFFFFF',
    bgSecondary: '#F5F7FB',
    bgTertiary: '#FFFFFF',
    bgElevated: '#FFFFFF',

    fillPrimary: 'rgba(120,120,128,0.20)',
    fillSecondary: 'rgba(120,120,128,0.16)',
    fillTertiary: 'rgba(118,118,128,0.12)',

    labelPrimary: '#111111',
    // Opaque navy-biased greys that pass WCAG AA 4.5:1 on bgPrimary and bgSecondary (QA P1-2).
    labelSecondary: '#5E6272', // 6.06:1 on #FFFFFF, 5.65:1 on #F5F7FB
    labelTertiary: '#6B6E79', // 5.08:1 on #FFFFFF, 4.74:1 on #F5F7FB
    labelQuaternary: 'rgba(60,60,67,0.18)',

    separator: 'rgba(60,60,67,0.29)',
    separatorOpaque: '#C6C6C8',

    materialBar: 'rgba(250,250,248,0.72)',

    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    info: '#007AFF',

    focusRing: 'rgba(2,117,217,0.50)',
  },
  dark: {
    primary: brandSource.primaryDark,
    primaryTint: 'rgba(78,167,223,0.18)',
    onPrimary: '#000000',
    accent: brandSource.accentDark,
    accentText: brandSource.accentDark,

    bgPrimary: '#000000',
    bgSecondary: '#1C1C1E',
    bgTertiary: '#2C2C2E',
    bgElevated: '#1C1C1E',

    fillPrimary: 'rgba(120,120,128,0.36)',
    fillSecondary: 'rgba(120,120,128,0.32)',
    fillTertiary: 'rgba(118,118,128,0.24)',

    labelPrimary: '#FFFFFF',
    labelSecondary: '#AEB0BA', // ≥ 6:1 on #000000, #1C1C1E and #2C2C2E
    labelTertiary: '#9A9CA6', // ≥ 4.9:1 on #000000, #1C1C1E and #2C2C2E
    labelQuaternary: 'rgba(235,235,245,0.16)',

    separator: 'rgba(84,84,88,0.65)',
    separatorOpaque: '#38383A',

    materialBar: 'rgba(22,22,24,0.72)',

    success: '#30D158',
    warning: '#FF9F0A',
    danger: '#FF453A',
    info: '#0A84FF',

    focusRing: 'rgba(78,167,223,0.55)',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;

/** Categorical hues for the 4 opportunity types (dot / underline only). */
export const opportunityTypes = {
  sale: { id: 1, ar: 'فرص للبيع', en: 'For sale', color: brandSource.primary },
  investment: { id: 2, ar: 'فرص استثمارية', en: 'Investment', color: brandSource.navy },
  partner: { id: 5, ar: 'البحث عن شريك', en: 'Find a partner', color: '#5E6AD2' },
  investor: { id: 6, ar: 'البحث عن مستثمر لفكرة أو مشروع', en: 'Find an investor', color: '#B5577A' },
} as const;

export const materials = {
  bar: { blur: 20, saturate: 1.8 },
  thick: { blur: 30, saturate: 1.8 },
  thin: { blur: 12, saturate: 1.6 },
} as const;

/* ------------------------------------------------------------------ */
/* Typography                                                         */
/* ------------------------------------------------------------------ */
export const fontFamilies = {
  web: {
    arabic: '"Tajawal", "SF Arabic", "Geeza Pro", "Noto Sans Arabic", system-ui, sans-serif',
    latin: '"Inter", -apple-system, "SF Pro Text", system-ui, sans-serif',
    googleFonts: ['Tajawal:wght@300;400;500;700;800', 'Inter:wght@400;500;600;700'],
  },
  ios: { arabic: 'SF Arabic (system)', latin: 'SF Pro (system)' },
  numeric: { fontVariantNumeric: 'tabular-nums' },
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

type TypeStyle = {
  size: number;
  lineHeight: number;
  /** line height to use when the script is Arabic */
  lineHeightAr: number;
  weight: number;
  /** Latin-only tracking in em. Arabic tracking is ALWAYS 0. */
  trackingLatin: number;
};

const ts = (size: number, lineHeight: number, weight: number, arFactor: number, trackingLatin = 0): TypeStyle => ({
  size,
  lineHeight,
  lineHeightAr: Math.round(lineHeight * arFactor),
  weight,
  trackingLatin,
});

/** Mirrors Apple Dynamic Type (default "Large" size). */
export const typography = {
  largeTitle: ts(34, 41, fontWeights.bold, 1.12, 0.011),
  title1: ts(28, 34, fontWeights.bold, 1.12, 0.012),
  title2: ts(22, 28, fontWeights.bold, 1.12, -0.012),
  title3: ts(20, 25, fontWeights.semibold, 1.12, -0.019),
  headline: ts(17, 22, fontWeights.semibold, 1.15, -0.024),
  body: ts(17, 22, fontWeights.regular, 1.18, -0.024),
  callout: ts(16, 21, fontWeights.regular, 1.18, -0.02),
  subhead: ts(15, 20, fontWeights.regular, 1.18, -0.015),
  footnote: ts(13, 18, fontWeights.regular, 1.15, -0.006),
  caption1: ts(12, 16, fontWeights.regular, 1.15, 0),
  caption2: ts(11, 13, fontWeights.regular, 1.15, 0.006),
} as const;

/** Web marketing display sizes (hero, section openers). */
export const display = {
  xl: ts(72, 76, fontWeights.bold, 1.15, -0.02),
  l: ts(56, 60, fontWeights.bold, 1.15, -0.02),
  m: ts(44, 48, fontWeights.bold, 1.15, -0.02),
} as const;

export type TypographyToken = keyof typeof typography;

/* ------------------------------------------------------------------ */
/* Spacing — 8pt grid (2/4 for optical tweaks only)                   */
/* ------------------------------------------------------------------ */
export const spacing = {
  0: 0,
  0.25: 2,
  0.5: 4,
  1: 8,
  1.5: 12,
  2: 16,
  2.5: 20,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  8: 64,
  10: 80,
  12: 96,
  16: 128,
} as const;

export const layout = {
  screenMargin: { iosCompact: 16, iosRegular: 20, webMobile: 20, webTablet: 32, webDesktop: 64 },
  maxContentWidth: 1200,
  readingWidth: 720,
  sectionGap: { mobile: 64, desktop: 112 },
  navBarHeight: { web: 52, ios: 44 },
  minHitTarget: 44,
  breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280 },
} as const;

/* ------------------------------------------------------------------ */
/* Radii (continuous corners on iOS)                                  */
/* ------------------------------------------------------------------ */
export const radii = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  '2xl': 28,
  full: 9999,
} as const;

/* ------------------------------------------------------------------ */
/* Elevation (subtle; prefer materials)                               */
/* ------------------------------------------------------------------ */
export const elevation = {
  light: {
    0: 'none',
    1: '0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.03)',
    2: '0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
    3: '0 12px 40px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
    4: '0 24px 64px rgba(0,0,0,0.18)',
  },
  dark: {
    0: 'none',
    1: 'none',
    2: '0 0 0 0.5px rgba(255,255,255,0.08)',
    3: '0 12px 40px rgba(0,0,0,0.5)',
    4: '0 24px 64px rgba(0,0,0,0.6)',
  },
} as const;

/* ------------------------------------------------------------------ */
/* Motion                                                             */
/* ------------------------------------------------------------------ */
export const motion = {
  duration: {
    instant: 100,
    fast: 200,
    base: 300,
    slow: 450,
    cinematic: 1200,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    linear: 'linear',
  },
  /**
   * Springs. `swiftui` = (response, dampingFraction).
   * `web` = Framer Motion equivalent (mass 1):
   *   stiffness = (2π / response)^2, damping = 4π · dampingFraction / response
   */
  spring: {
    default: { swiftui: { response: 0.5, dampingFraction: 0.825 }, web: { type: 'spring', stiffness: 158, damping: 20.7, mass: 1 } },
    snappy: { swiftui: { response: 0.35, dampingFraction: 0.85 }, web: { type: 'spring', stiffness: 322, damping: 30.5, mass: 1 } },
    bouncy: { swiftui: { response: 0.5, dampingFraction: 0.7 }, web: { type: 'spring', stiffness: 158, damping: 17.6, mass: 1 } },
  },
  pressScale: 0.97,
  hoverLiftScale: 1.03,
  parallax: { maxTiltDeg: 3, mediaShiftPx: 8, magneticRadiusPx: 12 },
  reducedMotion: { duration: 150, easing: 'linear', disableTransforms: true },
} as const;

/* ------------------------------------------------------------------ */
/* Buttons (Apple standard)                                           */
/* ------------------------------------------------------------------ */
export type ButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain' | 'destructive' | 'destructiveTinted';
export type ButtonSize = 'small' | 'medium' | 'large';

export const button = {
  minHitTarget: { width: 44, height: 44 },
  labelWeight: fontWeights.semibold,
  iconGap: 8,
  sizes: {
    small: { height: 28, paddingInline: 12, fontSize: 15, lineHeight: 20, radius: radii.sm, iconSize: 15 },
    medium: { height: 34, paddingInline: 16, fontSize: 17, lineHeight: 22, radius: 10, iconSize: 17 },
    large: { height: 50, paddingInline: 20, fontSize: 17, lineHeight: 22, radius: radii.md, iconSize: 17 },
  } satisfies Record<ButtonSize, { height: number; paddingInline: number; fontSize: number; lineHeight: number; radius: number; iconSize: number }>,
  /** Color-token references (resolve against colors[scheme]). */
  variants: {
    filled: { background: 'primary', label: 'onPrimary' },
    tinted: { background: 'primaryTint', label: 'primary' },
    gray: { background: 'fillTertiary', label: 'labelPrimary' },
    plain: { background: 'transparent', label: 'primary' },
    destructive: { background: 'danger', label: '#FFFFFF' },
    destructiveTinted: { background: 'rgba(255,59,48,0.12)', label: 'danger' },
  } satisfies Record<ButtonVariant, { background: ColorToken | 'transparent' | `#${string}` | `rgba(${string})`; label: ColorToken | `#${string}` }>,
  states: {
    hover: { filledOverlay: 'rgba(0,0,0,0.06)', fillOpacityDelta: 0.04, plainOpacity: 0.8 },
    pressed: { scale: motion.pressScale, opacity: 0.85, spring: 'snappy' as const },
    disabled: { opacity: 0.4 },
    loading: { lockWidth: true, indicatorSize: 17 },
    focusRing: { width: 3, offset: 2, color: 'focusRing' as ColorToken, selector: ':focus-visible' },
  },
} as const;

/* ------------------------------------------------------------------ */
/* Locale / formatting                                                */
/* ------------------------------------------------------------------ */
export const locale = {
  default: { lang: 'ar', dir: 'rtl' },
  alternate: { lang: 'en', dir: 'ltr' },
  numerals: 'latn', // Western digits 0–9 in both languages
  currency: { ar: 'ر.س', en: 'SAR', code: 'SAR' },
} as const;

/** Compact SAR formatter: 2470000000 -> "2.47 مليار ر.س" / "SAR 2.47B" */
export function formatSAR(value: number, lang: 'ar' | 'en' = 'ar'): string {
  const units = lang === 'ar'
    ? [[1e9, 'مليار'], [1e6, 'مليون'], [1e3, 'ألف']] as const
    : [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']] as const;
  for (const [n, label] of units) {
    if (Math.abs(value) >= n) {
      const v = (value / n).toLocaleString('en-US', { maximumFractionDigits: 2 });
      return lang === 'ar' ? `${v} ${label} ر.س` : `SAR ${v}${label}`;
    }
  }
  const v = value.toLocaleString('en-US');
  return lang === 'ar' ? `${v} ر.س` : `SAR ${v}`;
}

/* ------------------------------------------------------------------ */
/* CSS custom properties helper                                       */
/* ------------------------------------------------------------------ */
const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

export function cssVariables(scheme: ColorScheme): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(colors[scheme])) out[`--color-${kebab(k)}`] = v;
  for (const [k, v] of Object.entries(radii)) out[`--radius-${k}`] = `${v}px`;
  for (const [k, v] of Object.entries(elevation[scheme])) out[`--elevation-${k}`] = v;
  for (const [k, v] of Object.entries(motion.duration)) out[`--duration-${k}`] = `${v}ms`;
  for (const [k, v] of Object.entries(motion.easing)) out[`--ease-${k}`] = v;
  out['--font-arabic'] = fontFamilies.web.arabic;
  out['--font-latin'] = fontFamilies.web.latin;
  return out;
}

export const tokens = {
  brandSource,
  colors,
  opportunityTypes,
  materials,
  fontFamilies,
  fontWeights,
  typography,
  display,
  spacing,
  layout,
  radii,
  elevation,
  motion,
  button,
  locale,
} as const;

export default tokens;
