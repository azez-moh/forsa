'use client';

/**
 * Minimal stand-ins used ONLY while the Wow agent's components in src/components/wow/ are absent.
 * Same prop contracts as the wow components; see HomeView.tsx for the swap point.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import { formatSAR } from '@/lib/format';
import type { Locale } from '@/lib/i18n';
import { cn } from '@/lib/cn';

export function HeroCounterFallback({ totalValueSar, locale, children }: { totalValueSar: number; users: number; opportunities: number; locale: Locale; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden pb-24 pt-36 text-white md:pb-32 md:pt-48" style={{ background: 'var(--fz-navy-deep)' }}>
      <div className="container-page">
        <p className="tabular text-[44px] font-extrabold md:text-[72px]">
          <bdi>{formatSAR(totalValueSar, locale)}</bdi>
        </p>
        {children}
      </div>
    </section>
  );
}

export function TypeStoryFallback({ types, locale }: { types: Array<{ id: number; slug: string; nameAr: string; nameEn: string; count: number }>; locale: Locale }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {types.map((t) => (
        <Link key={t.id} href={`/opportunities/?type=${t.slug}`} className="rounded-lg bg-bg-2 p-6 hover:bg-fill-3">
          <p className="t-headline">{locale === 'ar' ? t.nameAr : t.nameEn}</p>
          <p className="mt-2 tabular text-label-2">{t.count}</p>
        </Link>
      ))}
    </div>
  );
}

export function CityMapFallback({ cities, onSelect, locale }: { cities: Array<{ nameAr: string; nameEn: string; count: number; value: number }>; onSelect?: (c: { nameAr: string; nameEn: string; count: number; value: number }) => void; locale: Locale }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {cities.map((c) => (
        <li key={c.nameEn}>
          <button type="button" onClick={() => onSelect?.(c)} className={cn('flex min-h-14 w-full items-center justify-between rounded-md bg-bg-3 px-4 text-start shadow-e1')}>
            <span className="font-bold">{locale === 'ar' ? c.nameAr : c.nameEn}</span>
            <span className="tabular text-[15px] text-label-2">
              <bdi>{c.count}</bdi> · <bdi>{formatSAR(c.value, locale)}</bdi>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function TiltCardFallback({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
