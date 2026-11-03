'use client';

/**
 * Internal helpers for the wow/ motion components.
 * Hydration-safe media-query hooks (server snapshot = false, so the first client render
 * always matches the static HTML and the real value is applied right after hydration).
 */
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react';

export type WowLocale = 'ar' | 'en';

/** Apple-style decelerate curve used across the wow components. */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_STANDARD: [number, number, number, number] = [0.4, 0, 0.2, 1];

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false),
    [query],
  );
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export const usePrefersReducedMotion = () => useMediaQuery(REDUCED_MOTION_QUERY);
export const useFinePointer = () => useMediaQuery(FINE_POINTER_QUERY);

/** Synchronous check for use inside effects/handlers only. */
export function prefersReducedMotionNow(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Latin digits with thousands separators (the platform's convention, see lib/format.ts). */
export const formatInt = (n: number) => Math.round(n).toLocaleString('en-US');

export interface CompactSar {
  number: string;
  unit: string;
  currency: string;
}

/** 2_468_582_530 → { number: '2.47', unit: 'مليار', currency: 'ر.س' } */
export function compactSar(value: number, locale: WowLocale): CompactSar {
  const units: ReadonlyArray<readonly [number, string, string]> = [
    [1e9, 'مليار', 'billion'],
    [1e6, 'مليون', 'million'],
    [1e3, 'ألف', 'thousand'],
  ];
  const currency = locale === 'ar' ? 'ر.س' : 'SAR';
  for (const [n, ar, en] of units) {
    if (Math.abs(value) >= n) {
      const v = value / n;
      const digits = v >= 100 ? 0 : v >= 10 ? 1 : 2;
      return {
        number: v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }),
        unit: locale === 'ar' ? ar : en,
        currency,
      };
    }
  }
  return { number: formatInt(value), unit: '', currency };
}

export function compactSarText(value: number, locale: WowLocale): string {
  const c = compactSar(value, locale);
  return locale === 'ar'
    ? [c.number, c.unit, c.currency].filter(Boolean).join(' ')
    : [c.currency, c.number, c.unit].filter(Boolean).join(' ');
}

/** Opportunity-type hues (dot / glow only), mapped to the Tailwind theme vars from TokenStyles. */
const TYPE_HUES: Record<number, { cssVar: string; fallback: string }> = {
  1: { cssVar: '--color-type-sale', fallback: '#0275D9' },
  2: { cssVar: '--color-type-investment', fallback: '#17234F' },
  5: { cssVar: '--color-type-partner', fallback: '#5E6AD2' },
  6: { cssVar: '--color-type-investor', fallback: '#B5577A' },
};

export function typeColor(id: number): string {
  const h = TYPE_HUES[id] ?? { cssVar: '--color-primary', fallback: '#0275D9' };
  return `var(${h.cssVar}, ${h.fallback})`;
}

/** Raw hex for places where a CSS var cannot be used (color-mix fallbacks, canvas). */
export function typeHex(id: number): string {
  return (TYPE_HUES[id] ?? { fallback: '#0275D9' }).fallback;
}

export interface CountUpProps {
  value: number;
  duration?: number;
  delay?: number;
  format?: (n: number) => string;
  /** Wait until the number scrolls into view before counting. */
  startOnView?: boolean;
  /** Count from this value (defaults to 0). */
  from?: number;
  className?: string;
}

/**
 * Number that tweens to `value` once (and re-tweens softly when `value` changes).
 * Renders the start value in static HTML; under reduced motion it jumps to the final value.
 */
export function CountUp({ value, duration = 1.2, delay = 0, format = formatInt, startOnView = false, from = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(from);
  const text = useTransform(mv, (v) => format(v));
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const started = useRef(false);

  useEffect(() => {
    if (startOnView && !inView) return;
    if (prefersReducedMotionNow()) {
      mv.set(value);
      return;
    }
    const first = !started.current;
    started.current = true;
    const controls = animate(mv, value, {
      duration: first ? duration : 0.45,
      delay: first ? delay : 0,
      ease: EASE_OUT,
    });
    return () => controls.stop();
  }, [value, inView, startOnView, duration, delay, mv]);

  return (
    <motion.span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {text}
    </motion.span>
  );
}
