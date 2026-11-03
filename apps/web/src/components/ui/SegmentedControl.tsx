'use client';

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
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
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const track = useRef<HTMLDivElement>(null);
  // Thumb geometry is measured from the active segment and moved with a CSS transition (spring-like
  // curve). No layout-projection library, so the control stays out of the motion bundle (QA P2-9).
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  const activeIndex = segments.findIndex((s) => s.value === value);
  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[activeIndex];
      const tr = track.current;
      if (!el || !tr) return;
      setThumb({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro && track.current) ro.observe(track.current);
    return () => ro?.disconnect();
  }, [activeIndex, segments.length]);

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

  return (
    <div
      className={cn(
        scroll &&
          // Scroll affordance at narrow widths (QA P2-3): the far edge fades so a clipped segment reads as "more".
          'no-scrollbar -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0 max-md:[mask-image:linear-gradient(to_left,transparent,#000_40px,#000)] max-md:rtl:[mask-image:linear-gradient(to_right,transparent,#000_40px,#000)]',
        className,
      )}
    >
      <div
        ref={track}
        role="radiogroup"
        aria-label={label}
        onKeyDown={onKey}
        className={cn('relative inline-flex w-max min-w-full items-stretch rounded-full bg-fill-3 p-[3px] md:min-w-0', size === 'sm' ? 'h-9' : 'h-[50px]')}
      >
        {thumb && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-[3px] z-0 rounded-full bg-bg shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)] transition-[transform,width] duration-[350ms] ease-[cubic-bezier(0.32,1.25,0.5,1)] motion-reduce:transition-none dark:bg-[#636366]"
            // offsetLeft is a measured physical offset, so the thumb is positioned from the physical left in both directions.
            style={{ left: 0, width: thumb.w, transform: `translate3d(${thumb.x}px,0,0)` }}
          />
        )}
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
                "relative z-[1] flex min-w-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 font-bold transition-colors duration-200 before:absolute before:inset-x-0 before:content-['']",
                size === 'sm' ? 'before:-inset-y-[7px]' : 'before:inset-y-0',
                size === 'sm' ? 'text-[13px]' : 'text-[15px]',
                active ? 'text-label' : 'text-label-2 hover:text-label',
              )}
            >
              <span>{s.label}</span>
              {typeof s.count === 'number' && <span className="tabular text-[12px] font-medium text-label-2">{s.count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
