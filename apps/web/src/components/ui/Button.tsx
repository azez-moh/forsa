'use client';

import Link from 'next/link';
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Apple HIG button (docs/02-design-system.md §9, tokens.button).
 * - variants: filled | tinted | gray | plain | destructive
 * - sizes: sm 28px · md 34px · lg 50px (radius 8 / 10 / 12)
 * - label: Tajawal 700 (Tajawal has no 600; 700 is the semibold equivalent)
 * - hit area ≥ 44×44 via an invisible ::before hit-slop
 * - pressed: scale .97 + opacity .85 · disabled: 40% · focus: 3px ring, offset 2
 */
export type ButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain' | 'destructive';
/** `onDark` swaps filled/tinted to their on-navy equivalents (white fill + navy label; translucent white). */
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-bold ' +
  'transition-[transform,opacity,background-color,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ' +
  'active:scale-[0.97] active:opacity-85 active:duration-100 ' +
  'focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus ' +
  'disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40 ' +
  "before:absolute before:inset-x-0 before:content-[''] " +
  'motion-reduce:active:scale-100';

const sizes: Record<ButtonSize, string> = {
  // before:-inset-y-* expands the invisible hit area to ≥44px tall; min-w-11 keeps it ≥44px wide.
  sm: 'h-7 min-w-11 px-3 text-[15px] leading-5 rounded-sm before:-inset-y-2',
  md: 'h-[34px] min-w-11 px-4 text-[17px] leading-[22px] rounded-[10px] before:-inset-y-[5px]',
  lg: 'h-[50px] min-w-11 px-5 text-[17px] leading-[22px] rounded-md before:inset-y-0',
};

const variants: Record<ButtonVariant, string> = {
  filled: 'bg-primary text-on-primary hover:brightness-[0.94]',
  tinted: 'bg-primary-tint text-primary-text hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]',
  gray: 'bg-fill-3 text-label hover:bg-fill-2',
  plain: 'bg-transparent text-primary-text hover:opacity-80',
  destructive: 'bg-danger text-white hover:brightness-[0.94]',
};

const onDarkVariants: Partial<Record<ButtonVariant, string>> = {
  filled: 'bg-white text-[#17234F] hover:brightness-95',
  tinted: 'bg-white/12 text-white hover:bg-white/20',
  plain: 'bg-transparent text-white hover:opacity-80',
};

export function buttonClasses(variant: ButtonVariant = 'filled', size: ButtonSize = 'md', full = false, className?: string, onDark = false) {
  const v = (onDark && onDarkVariants[variant]) || variants[variant];
  return cn(base, sizes[size], v, variant === 'plain' && size !== 'lg' && 'px-2', full && 'w-full', className);
}

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  icon?: ReactNode;
  iconEnd?: ReactNode;
  loading?: boolean;
  onDark?: boolean;
};

export type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement>;

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-[17px] animate-spin rounded-full border-2 border-current border-e-transparent motion-reduce:animate-none"
    />
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'filled', size = 'md', full, icon, iconEnd, loading, onDark, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, full, className, onDark)}
      {...rest}
    >
      {/* Label crossfades to a spinner; width stays locked (tokens.button.states.loading). */}
      <span className={cn('inline-flex items-center gap-2', loading && 'invisible')}>
        {icon}
        {children}
        {iconEnd}
      </span>
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner />
        </span>
      )}
    </button>
  );
});

export type ButtonLinkProps = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function ButtonLink({ variant = 'filled', size = 'md', full, icon, iconEnd, onDark, className, children, href, loading: _loading, ...rest }: ButtonLinkProps) {
  void _loading;
  const external = /^https?:/.test(href);
  const cls = buttonClasses(variant, size, full, className, onDark);
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        {icon}
        {children}
        {iconEnd}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {icon}
      {children}
      {iconEnd}
    </Link>
  );
}

/** Icon-only round button (gray by default) with an accessible label and a 44×44 target. */
export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string; variant?: ButtonVariant; size?: 'md' | 'lg' }>(
  function IconButton({ label, variant = 'gray', size = 'md', className, children, type = 'button', ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={cn(
          base,
          variants[variant],
          // md is 34px visual; the ::before hit-slop extends it to 44×44 (QA P2-1).
          size === 'lg' ? 'size-11 rounded-full before:inset-y-0' : 'size-[34px] min-w-[34px] rounded-full before:-inset-[5px]',
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
