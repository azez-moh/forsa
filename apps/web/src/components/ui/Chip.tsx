'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Toggle chip (filters) — capsule, 36px visual with 44px hit area. */
export function Chip({
  selected,
  children,
  icon,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; icon?: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "relative inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[15px] font-medium whitespace-nowrap transition-colors duration-200",
        "before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']",
        selected ? 'bg-label text-bg' : 'bg-fill-3 text-label hover:bg-fill-2',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/** Active filter chip with a remove button. */
export function RemovableChip({ children, onRemove, removeLabel }: { children: ReactNode; onRemove: () => void; removeLabel: string }) {
  return (
    <span className="inline-flex h-8 items-center gap-1 rounded-full bg-primary-tint ps-3 pe-1 text-[14px] font-medium text-primary-text">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${removeLabel}: ${typeof children === 'string' ? children : ''}`}
        className="relative grid size-6 place-items-center rounded-full hover:bg-primary-tint before:absolute before:-inset-2.5 before:content-['']"
      >
        <X size={14} aria-hidden />
      </button>
    </span>
  );
}
