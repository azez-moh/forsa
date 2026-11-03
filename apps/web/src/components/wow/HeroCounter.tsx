'use client';

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import {
  CountUp,
  compactSar,
  compactSarText,
  formatInt,
  useFinePointer,
  useMediaQuery,
  usePrefersReducedMotion,
  type WowLocale,
} from './shared';

/*
 * Motion-library-free by design (QA P2-9): the hero is above the fold on every device, so its entrance,
 * parallax, glow and odometer use CSS keyframes/transitions and CSS variables only. That keeps the
 * `motion` package out of the home page's first-load JavaScript.
 */

export interface HeroCounterProps {
  totalValueSar: number;
  users: number;
  opportunities: number;
  locale: 'ar' | 'en';
  /** CTAs, rendered under the counter. */
  children?: ReactNode;
}

const COPY = {
  ar: {
    headline: 'فرصتك على بعد خطوة',
    valueLabel: 'إجمالي قيمة الفرص المدرجة',
    users: 'مستخدم',
    opportunities: 'فرصة مدرجة',
  },
  en: {
    headline: 'Your next opportunity is one step away',
    valueLabel: 'Total value of listed opportunities',
    users: 'users',
    opportunities: 'listed opportunities',
  },
} as const;

/* ------------------------------------------------------------------ */
/* Static CSS (hoisted + de-duplicated by React 19)                    */
/* ------------------------------------------------------------------ */
const HERO_CSS = `
@keyframes fz-aurora-a { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(6%,4%,0) scale(1.12); } }
@keyframes fz-aurora-b { 0%,100% { transform: translate3d(0,0,0) scale(1.05); } 50% { transform: translate3d(-7%,-3%,0) scale(0.95); } }
@keyframes fz-aurora-c { 0%,100% { transform: translate3d(0,0,0) rotate(0deg); } 50% { transform: translate3d(3%,-5%,0) rotate(8deg); } }
.fz-aurora { position:absolute; border-radius:9999px; filter: blur(80px); will-change: transform; }
.fz-aurora-a { animation: fz-aurora-a 22s ease-in-out infinite; }
.fz-aurora-b { animation: fz-aurora-b 28s ease-in-out infinite; }
.fz-aurora-c { animation: fz-aurora-c 34s ease-in-out infinite; }
.fz-grain { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 160px 160px; }
@keyframes fz-enter { from { opacity: var(--fz-enter-from, 0); transform: translate3d(0,18px,0); } to { opacity: 1; transform: none; } }
.fz-enter { animation: fz-enter .9s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--fz-delay, 0s); }
.fz-enter-slide { --fz-enter-from: 1; }
.fz-reel { transition: transform var(--fz-dur, 1.2s) cubic-bezier(.12,.9,.25,1) var(--fz-d, .35s); }
.fz-parallax { transform: translate3d(0, calc(var(--fz-p, 0) * var(--fz-k, 0px)), 0); }
.fz-hero-content { transform: translate3d(0, calc(var(--fz-p, 0) * -120px), 0) scale(calc(1 - var(--fz-p, 0) * .04)); opacity: calc(1 - var(--fz-p, 0) * 1.43); }
@media (prefers-reduced-motion: reduce) {
  .fz-aurora-a, .fz-aurora-b, .fz-aurora-c { animation: none; }
  .fz-enter { animation: none; }
  .fz-reel { transition: none; }
  .fz-parallax, .fz-hero-content { transform: none; opacity: 1; }
}
@media (max-width: 767px) {
  /* Mobile performance (QA P2-9): one static aurora layer, no infinite blur animations. */
  .fz-aurora { filter: blur(48px); animation: none !important; }
  .fz-aurora-b, .fz-aurora-c { display: none; }
}
`;

/* ------------------------------------------------------------------ */
/* Odometer                                                            */
/* ------------------------------------------------------------------ */
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function OdometerDigit({ digit, index, total, animateIn }: { digit: number; index: number; total: number; animateIn: boolean }) {
  // Lower-order digits spin more laps, like a real odometer. Strip holds 3 laps of 0–9.
  const fromEnd = total - 1 - index;
  const laps = Math.min(2, index);
  const target = laps * 10 + digit;
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-top" style={{ width: '0.62em' }}>
      <span
        className="fz-reel absolute inset-x-0 top-0 flex flex-col items-center"
        style={
          {
            lineHeight: 1,
            transform: `translate3d(0, ${animateIn ? -target : 0}em, 0)`,
            '--fz-dur': `${1.2 + index * 0.12}s`,
            '--fz-d': `${0.35 + fromEnd * 0.02}s`,
          } as React.CSSProperties
        }
      >
        {[0, 1, 2].flatMap((lap) =>
          DIGITS.map((d) => (
            <span key={`${lap}-${d}`} className="block h-[1em]">
              {d}
            </span>
          )),
        )}
      </span>
    </span>
  );
}

function Odometer({ text, reduce }: { text: string; reduce: boolean }) {
  const wide = useMediaQuery('(min-width: 768px)');
  const [go, setGo] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Start after hydration so the server HTML and the first client render match.
    const id = requestAnimationFrame(() => setGo(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Static HTML, reduced motion and phones: the final value as plain text. The ~90-span odometer reel
  // is only built on wide screens after hydration (QA P2-9: mobile TBT; QA P0-1: value always visible).
  if (reduce || !mounted || !wide) {
    return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{text}</span>;
  }

  const chars = text.split('');
  const digitCount = chars.filter((c) => /\d/.test(c)).length;
  let di = -1;
  return (
    <span aria-hidden className="inline-flex items-start" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {chars.map((c, i) => {
        if (/\d/.test(c)) {
          di += 1;
          return <OdometerDigit key={i} digit={Number(c)} index={di} total={digitCount} animateIn={go} />;
        }
        return (
          <span key={i} className="inline-block h-[1em] leading-none" style={{ width: c === ',' || c === '.' ? '0.28em' : undefined }}>
            {c}
          </span>
        );
      })}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Skyline — a generic low city silhouette with two signature towers   */
/* (a tall tower with an arched sky-bridge opening and a tapered spire)*/
/* drawn from simple geometry; not traced from any photograph.        */
/* ------------------------------------------------------------------ */
function Skyline() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      fill="currentColor"
    >
      <defs>
        <linearGradient id="fz-sky-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.55" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id="fz-sky-mask">
          <rect width="1440" height="320" fill="url(#fz-sky-fade)" />
        </mask>
      </defs>
      <g mask="url(#fz-sky-mask)">
        {/* low-rise band */}
        <path d="M0 320V262h40v-14h36v20h28v-30h44v22h30v-40h52v28h26v-18h40v34h34v-46h18v-12h30v12h18v40h40v-22h36v30h22v-50h46v38h30v-16h42v26h38v-34h28v18h34v-28h50v40h24v-58h18v-10h26v10h16v52h44v-24h32v30h36v-36h48v22h30v-44h40v52h28v-20h36v28h40v-38h34v26h30v-16h44v30h26V320z" opacity="0.55" />
        {/* signature tower 1: tapering tower with an arched opening near the top */}
        <path d="M600 320V150c0-30 8-62 22-92 6-13 12-24 18-34 6 10 12 21 18 34 14 30 22 62 22 92v170z M626 112h28c-2-18-7-34-14-50-7 16-12 32-14 50z" fillRule="evenodd" opacity="0.9" />
        {/* signature tower 2: slender spire */}
        <path d="M842 320V128l14-10V64l4-18 4 18v54l14 10v192z" opacity="0.8" />
        {/* mid-rise towers */}
        <path d="M520 320V196h34v-12h22v136z M700 320V208h40v112z M760 320V176h30l8-10h12v154z M902 320V188h38v132z M960 320V214h46v106z M440 320V222h46v98z M1040 320V200h28v-10h20v130z" opacity="0.7" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
export function HeroCounter({ totalValueSar, users, opportunities, locale, children }: HeroCounterProps) {
  const t = COPY[locale];
  const loc: WowLocale = locale;
  const reduce = usePrefersReducedMotion();
  const fine = useFinePointer();
  const sectionRef = useRef<HTMLElement>(null);
  const glowEnabled = fine && !reduce;

  // Scroll parallax: one passive listener writes the hero's scroll progress (0..1) to a CSS variable.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduce) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = el.offsetHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / h));
      el.style.setProperty('--fz-p', p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  // Pointer-reactive glow (desktop only), eased by a CSS transition on the variables' consumer.
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!glowEnabled || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--fz-gx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    e.currentTarget.style.setProperty('--fz-gy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };

  const value = compactSar(totalValueSar, loc);
  const fullValueText = compactSarText(totalValueSar, loc);

  /**
   * Entrance: CSS keyframe with a per-element delay. Under reduced motion the animation is off and the
   * elements render in their final state (QA P0-1). The H1 (LCP) slides in but is never transparent.
   */
  const enter = (delay: number, fade = true) => ({
    className: fade ? 'fz-enter' : 'fz-enter fz-enter-slide',
    style: { '--fz-delay': `${delay}s` } as React.CSSProperties,
  });

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden text-white"
      style={{ backgroundColor: 'var(--color-navy-deep, #0E1738)' }}
    >
      <style href="fz-wow-hero" precedence="default">
        {HERO_CSS}
      </style>

      {/* Base depth gradient */}
      <div
        aria-hidden
        className="absolute inset-0 -z-30"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, var(--color-navy, #17234F) 0%, var(--color-navy-deep, #0E1738) 55%, #070C22 100%)',
        }}
      />

      {/* Aurora mesh in brand blues */}
      <div aria-hidden className="fz-parallax absolute inset-0 -z-20 opacity-90" style={{ '--fz-k': '140px' } as React.CSSProperties}>
        <div
          className="fz-aurora fz-aurora-a"
          style={{
            insetInlineStart: '-10%',
            top: '-20%',
            width: '70vw',
            height: '60vh',
            background: 'radial-gradient(closest-side, rgba(2,117,217,0.55), rgba(2,117,217,0) 70%)',
          }}
        />
        <div
          className="fz-aurora fz-aurora-b"
          style={{
            insetInlineEnd: '-15%',
            top: '5%',
            width: '60vw',
            height: '55vh',
            background: 'radial-gradient(closest-side, rgba(78,167,223,0.38), rgba(78,167,223,0) 70%)',
          }}
        />
        <div
          className="fz-aurora fz-aurora-c"
          style={{
            left: '20%',
            bottom: '-25%',
            width: '65vw',
            height: '50vh',
            background: 'radial-gradient(closest-side, rgba(40,72,170,0.45), rgba(40,72,170,0) 70%)',
          }}
        />
      </div>

      {/* Pointer glow */}
      {glowEnabled && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ backgroundImage: 'radial-gradient(640px circle at var(--fz-gx, 50%) var(--fz-gy, 40%), rgba(78,167,223,0.16), transparent 60%)' }}
        />
      )}

      {/* Skyline */}
      <div
        aria-hidden
        className="fz-parallax pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[26vh] min-h-[140px] text-[#4EA7DF] opacity-[0.12] md:h-[34vh]"
        style={{ '--fz-k': '60px' } as React.CSSProperties}
      >
        <Skyline />
      </div>

      {/* Horizon hairline + bottom fade into the page */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32" style={{ background: 'linear-gradient(to bottom, transparent, rgba(7,12,34,0.7))' }} />

      {/* Grain */}
      <div aria-hidden className="fz-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.07] mix-blend-overlay" />

      {/* Content */}
      <div className="fz-hero-content relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-24 pt-32 text-center md:pb-32 md:pt-40">
        <h1
          className={`${enter(0.05, false).className} text-balance font-extrabold leading-[1.15] text-white`}
          style={{ ...enter(0.05, false).style, fontSize: 'clamp(2.5rem, 7vw, 5.25rem)', letterSpacing: locale === 'en' ? '-0.025em' : 0 }}
        >
          {t.headline}
        </h1>

        <div className={`${enter(0.2).className} mt-12 flex flex-col items-center md:mt-16`} style={enter(0.2).style}>
          <p className="sr-only">
            {t.valueLabel}: {fullValueText}
          </p>
          <div
            aria-hidden
            className="flex items-baseline gap-[0.25em] font-bold leading-none text-white"
            style={{ fontSize: 'clamp(3rem, 9vw, 6.5rem)' }}
          >
            {locale === 'en' && <span className="text-[0.4em] font-semibold text-[var(--color-warm,#FF9F43)]">{value.currency}</span>}
            <bdi dir="ltr" className="font-[family-name:var(--font-latin)]">
              <Odometer text={value.number} reduce={reduce} />
            </bdi>
            {value.unit && <span className="text-[0.42em] font-bold text-white/90">{value.unit}</span>}
            {locale === 'ar' && <span className="text-[0.36em] font-semibold text-[var(--color-warm,#FF9F43)]">{value.currency}</span>}
          </div>
          <p aria-hidden className="mt-4 text-base font-medium text-white/60 md:text-lg">
            {t.valueLabel}
          </p>
        </div>

        <dl className={`${enter(0.35).className} mt-10 flex items-center gap-8 md:mt-12 md:gap-12`} style={enter(0.35).style}>
          <Stat value={users} label={t.users} />
          <span aria-hidden className="h-8 w-px bg-white/15" />
          <Stat value={opportunities} label={t.opportunities} />
        </dl>

        {children && (
          <div className={`${enter(0.5).className} mt-12 flex flex-wrap items-center justify-center gap-3 md:mt-14`} style={enter(0.5).style}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <dt className="order-2 text-sm text-white/55">{label}</dt>
      <dd className="order-1 text-2xl font-semibold text-white md:text-3xl">
        <bdi dir="ltr" className="font-[family-name:var(--font-latin)]">
          <span className="sr-only">{formatInt(value)}</span>
          <span aria-hidden>
            <CountUp value={value} duration={1.4} delay={0.6} />
          </span>
        </bdi>
      </dd>
    </div>
  );
}

export default HeroCounter;
