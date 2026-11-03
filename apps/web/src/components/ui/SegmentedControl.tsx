'use client';

import { useId, useRef, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { motion as motionTokens } from '@forsa/tokens';
import { cn } from '@/lib/cn';

export interface Segment<V extends string> {
  value: V;
  label: string;
  count?: number;
}

/**
 * iOS segmented control (US-DISC-03): capsule track in fill.tertiary, elevated thumb that springs
 * (spring.snappy) between segments; crossfade only under reduced motion. Radio-group semantics
 * with arrow-key navigation (mirrors in RTL).
 */
export function SegmentedControl<V extends string>({
  segments,
  value,
  onChange,
  label,
  size = 'md',
  className,
  scroll = false,
}: {
  segments: Segment<V>[];
  value: V;
  onChange: (v: V) => void;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
  scroll?: boolean;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = segments.findIndex((s) => s.value === value);
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    let next = idx;
    if (e.key === 'ArrowRight') next = idx + (rtl ? -1 : 1);
    else if (e.key === 'ArrowLeft') next = idx + (rtl ? 1 : -1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = segments.length - 1;
    else return;
    e.preventDefault();
    next = (next + segments.length) % segments.length;
    onChange(segments[next].value);
    refs.current[next]?.focus();
  };

  const spring = motionTokens.spring.snappy.web;

  return (
    <div className={cn(scroll && 'no-scrollbar -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0', className)}>
      <div
        role="radiogroup"
        aria-label={label}
        onKeyDown={onKey}
        className={cn('relative inline-flex w-max min-w-full items-stretch rounded-full bg-fill-3 p-[3px] md:min-w-0', size === 'sm' ? 'h-9' : 'h-11')}
      >
        {segments.map((s, i) => {
          const active = s.value === value;
          return (
            <button
              key={s.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(s.value)}
              className={cn(
                'relative z-0 flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 font-bold transition-colors duration-200',
                size === 'sm' ? 'text-[13px]' : 'text-[15px]',
                active ? 'text-label' : 'text-label-2 hover:text-label',
              )}
            >
              {active && (
                <motion.span
                  layoutId={`seg-thumb-${id}`}
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-bg shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)] dark:bg-[#636366]"
                  transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: spring.stiffness, damping: spring.damping, mass: spring.mass }}
                />
              )}
              <span>{s.label}</span>
              {typeof s.count === 'number' && <span className="tabular text-[12px] font-medium text-label-2">{s.count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
