'use client';

import { Star } from 'lucide-react';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/cn';

/** Honest reputation (US-CNS-02, product decision 3): fewer than 3 reviews -> "جديد على المنصة". */
export function ReputationLabel({ reviews, rating, className }: { reviews: number; rating: number; className?: string }) {
  const { t } = useApp();
  if (reviews < 3) {
    return <span className={cn('inline-flex h-6 items-center rounded-xs bg-fill-3 px-2 text-[12px] font-bold text-label-2', className)}>{t('newOnPlatform')}</span>;
  }
  return (
    <span className={cn('inline-flex items-center gap-1 text-[13px] text-label-2', className)}>
      <Star size={13} aria-hidden className="fill-warm text-warm" />
      <bdi className="tabular font-bold text-label">{rating.toFixed(1)}</bdi>
      <span>
        (<bdi className="tabular">{reviews}</bdi> {t('reviews')})
      </span>
    </span>
  );
}

/** Designed monogram avatar (no photos on the live site). */
export function ConsultantAvatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initial = name.trim().charAt(0);
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-extrabold text-white',
        size === 'lg' ? 'size-24 text-[40px]' : 'size-14 text-[24px]',
      )}
      style={{ background: 'linear-gradient(145deg, var(--fz-color-primary), var(--fz-navy))' }}
    >
      {initial}
    </span>
  );
}
