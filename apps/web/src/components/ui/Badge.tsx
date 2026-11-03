import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'onDark';

const tones: Record<Tone, string> = {
  neutral: 'bg-fill-3 text-label-2',
  primary: 'bg-primary-tint text-primary-text',
  success: 'bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[color-mix(in_srgb,var(--color-success)_70%,var(--color-label))]',
  warning: 'bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-[color-mix(in_srgb,var(--color-warning)_60%,var(--color-label))]',
  danger: 'bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-danger',
  onDark: 'bg-white/15 text-white',
};

export function Badge({ tone = 'neutral', icon, children, className }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 items-center gap-1 rounded-xs px-2 text-[12px] font-bold leading-none whitespace-nowrap', tones[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

/** Small "تجريبي" tag on every mocked step (product decision 6). */
export function DemoTag({ label }: { label: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded-xs border border-dashed border-separator px-1.5 text-[11px] font-medium text-label-2">
      {label}
    </span>
  );
}
