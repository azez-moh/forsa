'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { CountUp, EASE_OUT, formatInt, typeColor, typeHex, usePrefersReducedMotion, type WowLocale } from './shared';

export interface TypeStoryExample {
  title: string;
  /** e.g. "الرياض · 1.5 مليون ر.س" */
  meta: string;
  href: string;
}

export interface TypeStoryItem {
  id: number;
  nameAr: string;
  nameEn: string;
  /**
   * Real platform total for this type (platformStats). Omit when the platform does not publish one:
   * the chapter then shows no count rather than a demo figure (QA P1-5).
   */
  count?: number;
  descriptionAr: string;
  descriptionEn: string;
  /** Explore link for this type, e.g. /opportunities/?type=for-sale */
  href: string;
  /** One real example listing for the chapter. */
  example?: TypeStoryExample;
}

export interface TypeStoryProps {
  types: TypeStoryItem[];
  locale: 'ar' | 'en';
}

const COPY = {
  ar: { eyebrow: 'أربعة أبواب للفرصة', unit: 'فرصة على المنصة', of: 'من', example: 'مثال من المنصة', browse: 'استعرض', source: 'بحسب تقرير المنصة لشهر أغسطس 2026' },
  en: { eyebrow: 'Four doors to an opportunity', unit: 'on the platform', of: 'of', example: 'Example listing', browse: 'Browse', source: 'Per the platform report, August 2026' },
} as const;

/** A tiny glyph per type, drawn in SVG (sale tag, growth line, two links, spark). */
function TypeGlyph({ id }: { id: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (id) {
    case 1:
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path {...common} d="M3 12V4h8l10 10-8 8L3 12z" />
          <circle cx="7.5" cy="8.5" r="1.4" fill="currentColor" />
        </svg>
      );
    case 2:
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path {...common} d="M3 17l6-6 4 4 8-8" />
          <path {...common} d="M15 7h6v6" />
        </svg>
      );
    case 5:
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <circle {...common} cx="9" cy="12" r="5" />
          <circle {...common} cx="15" cy="12" r="5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path {...common} d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
        </svg>
      );
  }
}

function useCopy(item: TypeStoryItem, locale: WowLocale) {
  return {
    name: locale === 'ar' ? item.nameAr : item.nameEn,
    description: locale === 'ar' ? item.descriptionAr : item.descriptionEn,
  };
}

/* ------------------------------------------------------------------ */
/* Desktop: sticky scroll stage                                        */
/* ------------------------------------------------------------------ */
function Segment({ progress, index, total, color }: { progress: MotionValue<number>; index: number; total: number; color: string }) {
  const fill = useTransform(progress, [index / total, (index + 1) / total], [0, 1], { clamp: true });
  return (
    <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ scaleX: fill, transformOrigin: 'var(--fz-seg-origin, left)', backgroundColor: color }}
      />
    </span>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 rtl:rotate-180" aria-hidden fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function StoryCardContent({ item, locale, total, index, countOnView = false }: { item: TypeStoryItem; locale: WowLocale; total: number; index: number; countOnView?: boolean }) {
  const { name, description } = useCopy(item, locale);
  const t = COPY[locale];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 text-white/70">
        <span
          className="grid h-11 w-11 place-items-center rounded-2xl"
          style={{
            color: '#fff',
            background: `color-mix(in srgb, ${typeColor(item.id)} 70%, transparent)`,
            boxShadow: `0 8px 28px -8px ${typeHex(item.id)}`,
          }}
        >
          <TypeGlyph id={item.id} />
        </span>
        <span className="text-sm font-medium">
          <bdi dir="ltr" className="font-[family-name:var(--font-latin)]">{String(index + 1).padStart(2, '0')}</bdi>
          <span className="mx-1.5 opacity-60">{t.of}</span>
          <bdi dir="ltr" className="font-[family-name:var(--font-latin)]">{String(total).padStart(2, '0')}</bdi>
        </span>
      </div>

      <h3 className="mt-6 text-3xl font-bold leading-tight text-white md:text-[2.5rem]" style={{ letterSpacing: locale === 'en' ? '-0.02em' : 0 }}>
        {name}
      </h3>
      <p className="mt-3 max-w-md text-lg leading-relaxed text-white/70">{description}</p>

      {typeof item.count === 'number' && (
        <div className="mt-6 flex items-baseline gap-3">
          <bdi dir="ltr" className="font-[family-name:var(--font-latin)] text-5xl font-bold leading-none text-white md:text-6xl">
            <span className="sr-only">{formatInt(item.count)}</span>
            <span aria-hidden>
              <CountUp value={item.count} duration={0.9} startOnView={countOnView} />
            </span>
          </bdi>
          <span className="text-base text-white/70">{t.unit}</span>
        </div>
      )}

      {item.example && (
        <Link
          href={item.example.href}
          className="mt-6 block rounded-2xl border border-white/12 bg-white/[0.06] p-4 transition-colors hover:bg-white/[0.1] focus-visible:outline-white/80"
        >
          <span className="block text-xs font-medium text-white/70">{t.example}</span>
          <span className="mt-1 line-clamp-2 block text-base font-bold leading-snug text-white">{item.example.title}</span>
          <span className="mt-1 block text-sm text-white/70">
            <bdi>{item.example.meta}</bdi>
          </span>
        </Link>
      )}

      <div className="mt-auto pt-6">
        <Link
          href={item.href}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-bold text-[#17234F] transition-[filter] hover:brightness-95 focus-visible:outline-white/80"
        >
          {t.browse} {name}
          <Arrow />
        </Link>
      </div>
    </div>
  );
}

function StickyStory({ types, locale }: { types: TypeStoryItem[]; locale: WowLocale }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);
  const total = types.length;

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.min(total - 1, Math.max(0, Math.floor(v * total * 0.9999)));
    if (i !== active) setActive(i);
  });

  const item = types[active] ?? types[0];
  const t = COPY[locale];
  // Card breathes slightly as the story progresses.
  const cardScale = useTransform(scrollYProgress, [0, 0.08, 0.92, 1], reduce ? [1, 1, 1, 1] : [0.94, 1, 1, 0.97]);
  const glowColor = typeHex(item?.id ?? 1);

  if (!item) return null;

  return (
    <div ref={ref} className="relative" style={{ height: `${Math.min(200, Math.max(2, total) * 40 + 40)}vh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-6">
        {/* Ambient hue that follows the active type */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
          animate={{ backgroundColor: glowColor, opacity: 0.32 }}
          transition={{ duration: reduce ? 0 : 0.9, ease: EASE_OUT }}
        />

        <div className="relative w-full max-w-xl">
          <p className="mb-6 text-center text-sm font-medium text-white/70">{t.eyebrow}</p>

          <motion.article
            className="relative overflow-hidden rounded-[2rem] border border-white/12 p-8 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)] md:p-10"
            style={{
              scale: cardScale,
              minHeight: 'min(500px, 72svh)',
              background: 'linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
              backdropFilter: 'blur(28px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
            }}
            aria-live="polite"
          >
            {/* Story progress segments */}
            <div className="mb-8 flex gap-1.5 [--fz-seg-origin:left] rtl:[--fz-seg-origin:right]" aria-hidden>
              {types.map((ty, i) => (
                <Segment key={ty.id} progress={scrollYProgress} index={i} total={total} color={typeColor(ty.id)} />
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.id}
                initial={reduce ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -10, filter: 'blur(6px)' }}
                transition={{ duration: reduce ? 0 : 0.45, ease: EASE_OUT }}
                className="h-full"
                style={{ minHeight: 'calc(min(500px, 72svh) - 7.5rem)', display: 'flex', flexDirection: 'column' }}
              >
                <StoryCardContent item={item} locale={locale} total={total} index={active} />
              </motion.div>
            </AnimatePresence>
          </motion.article>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile: horizontal snap carousel                                    */
/* ------------------------------------------------------------------ */
function SnapCarousel({ types, locale }: { types: TypeStoryItem[]; locale: WowLocale }) {
  const t = COPY[locale];
  return (
    <div className="py-16">
      <p className="mb-6 px-6 text-sm font-medium text-white/70">{t.eyebrow}</p>
      <ul
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={t.eyebrow}
      >
        {types.map((item, i) => (
          <li
            key={item.id}
            className="relative flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-[1.75rem] border border-white/12 p-6"
            style={{
              minHeight: 440,
              background: `radial-gradient(120% 80% at 100% 0%, color-mix(in srgb, ${typeColor(item.id)} 35%, transparent), transparent 60%), linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))`,
            }}
          >
            <StoryCardContent item={item} locale={locale} total={types.length} index={i} countOnView />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Scroll-driven story of the four opportunity types. On md+ a sticky glass card morphs through each
 * type while iOS-stories segments fill; below md it becomes a horizontal snap carousel.
 * Sits on a deep navy band so it continues the hero's mood.
 */
export function TypeStory({ types, locale }: TypeStoryProps) {
  if (!types.length) return null;
  const t = COPY[locale];
  return (
    <section
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      aria-labelledby="fz-typestory-h"
      className="relative isolate w-full text-white"
      style={{ background: 'linear-gradient(180deg, #070C22 0%, var(--color-navy-deep, #0E1738) 40%, var(--color-navy-deep, #0E1738) 100%)' }}
    >
      {/* Heading order (QA P2-10): chapter titles are h3 under this h2. */}
      <h2 id="fz-typestory-h" className="sr-only">
        {t.eyebrow}
      </h2>
      <div className="hidden md:block">
        <StickyStory types={types} locale={locale} />
      </div>
      <div className="md:hidden">
        <SnapCarousel types={types} locale={locale} />
      </div>
      {types.some((x) => typeof x.count === 'number') && <p className="px-6 pb-10 text-center text-xs text-white/60">{t.source}</p>}
    </section>
  );
}

export default TypeStory;
