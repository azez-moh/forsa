'use client';

import { useState, type CSSProperties } from 'react';
import {
  Briefcase,
  Cpu,
  Dumbbell,
  Factory,
  GraduationCap,
  Shapes,
  Stethoscope,
  Store,
  Truck,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryId } from '@forsa/data';
import { cn } from '@/lib/cn';

export const CATEGORY_ICON: Record<CategoryId, LucideIcon> = {
  commercial: Store,
  food: UtensilsCrossed,
  tech: Cpu,
  industrial: Factory,
  services: Briefcase,
  medical: Stethoscope,
  education: GraduationCap,
  sports: Dumbbell,
  logistics: Truck,
  other: Shapes,
};

/**
 * Listing media with graceful fallback (US-OPP-01): remote images are hot-linked from api.forsh.sa
 * (not downloaded); when missing or failing, a calm category illustration is shown instead.
 */
export function Media({
  src,
  alt,
  categoryId,
  className,
  style,
  imgClassName,
  priority,
}: {
  src?: string;
  alt: string;
  categoryId: CategoryId;
  className?: string;
  style?: CSSProperties;
  imgClassName?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const Icon = CATEGORY_ICON[categoryId] ?? Shapes;
  const show = src && !failed;
  return (
    <div className={cn('relative overflow-hidden bg-bg-2', className)} style={style}>
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={cn('size-full object-cover', imgClassName)}
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="grid size-full place-items-center bg-[radial-gradient(120%_90%_at_80%_0%,var(--color-primary-tint),transparent_60%),linear-gradient(180deg,var(--color-bg-2),var(--color-bg-2))]"
        >
          <Icon aria-hidden strokeWidth={1.25} className="size-14 text-primary/50" />
        </div>
      )}
    </div>
  );
}
