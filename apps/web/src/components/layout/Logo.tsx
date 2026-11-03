import { cn } from '@/lib/cn';

/** Wordmark lockup: 2×2 grid mark in brand blue + "فرصة وتمكين" in Tajawal 800. No remote PNGs. */
export function LogoMark({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('size-7 shrink-0', className)}>
      <rect x="2" y="2" width="9" height="9" rx="2.5" fill={onDark ? '#FFFFFF' : 'var(--color-primary)'} />
      <rect x="13" y="2" width="9" height="9" rx="2.5" fill={onDark ? '#FFFFFF' : 'var(--color-primary)'} opacity={0.55} />
      <rect x="2" y="13" width="9" height="9" rx="2.5" fill={onDark ? '#FFFFFF' : 'var(--color-primary)'} opacity={0.55} />
      <rect x="13" y="13" width="9" height="9" rx="4.5" fill={onDark ? 'var(--color-accent)' : 'var(--color-accent)'} />
    </svg>
  );
}

export function Wordmark({ label, className, onDark }: { label: string; className?: string; onDark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark onDark={onDark} />
      <span className={cn('font-[800] text-[21px] leading-none tracking-normal', onDark ? 'text-white' : 'text-label')} style={{ fontFamily: 'var(--font-tajawal)' }}>
        {label}
      </span>
    </span>
  );
}
