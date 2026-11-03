import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Labelled figure — every number on the platform carries a label (design principle 5). */
export function StatTile({ value, label, icon, className, onDark = false, size = 'md' }: { value: ReactNode; label: string; icon?: ReactNode; className?: string; onDark?: boolean; size?: 'md' | 'lg' }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {icon && <span className={cn('mb-2', onDark ? 'text-white/70' : 'text-primary')}>{icon}</span>}
      <span className={cn('tabular font-extrabold leading-tight', size === 'lg' ? 'text-[34px] md:text-[44px]' : 'text-[28px]', onDark ? 'text-white' : 'text-label')}>
        <bdi>{value}</bdi>
      </span>
      <span className={cn('text-[15px]', onDark ? 'text-white/70' : 'text-label-2')}>{label}</span>
    </div>
  );
}
