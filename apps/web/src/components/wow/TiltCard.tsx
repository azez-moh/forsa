'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';
import { useFinePointer, usePrefersReducedMotion } from './shared';

export interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

const MAX_TILT = 3; // degrees
const DEPTH = 8; // px

/**
 * iOS-style parallax card: tilts at most 3° toward a desktop pointer, shifts its content up to 8px
 * for depth, and sweeps a faint specular highlight. Touch devices and reduced motion get a plain card.
 * CSS variables + transitions only (no animation library), so it can wrap cards on first-load pages
 * without adding the motion bundle (QA P2-9). Put radius/background on `className`.
 */
export function TiltCard({ children, className }: TiltCardProps) {
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const enabled = fine && !reduce;
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const set = (nx: number, ny: number, h: number) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty('--tx', nx.toFixed(3));
      el.style.setProperty('--ty', ny.toFixed(3));
      el.style.setProperty('--th', String(h));
    });
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1, 1);
  };
  const onLeave = () => set(0, 0, 0);

  if (!enabled) {
    return <div className={['relative', className].filter(Boolean).join(' ')}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={['relative will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]', className].filter(Boolean).join(' ')}
      style={{
        transform: `perspective(1000px) rotateX(calc(var(--ty, 0) * ${-MAX_TILT}deg)) rotateY(calc(var(--tx, 0) * ${MAX_TILT}deg))`,
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="relative h-full transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
        style={{ transform: `translate3d(calc(var(--tx, 0) * ${DEPTH}px), calc(var(--ty, 0) * ${DEPTH}px), 0)` }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          borderRadius: 'inherit',
          opacity: 'var(--th, 0)',
          mixBlendMode: 'soft-light',
          backgroundImage:
            'radial-gradient(520px circle at calc(50% + var(--tx, 0) * 50%) calc(50% + var(--ty, 0) * 50%), rgba(255,255,255,0.16), rgba(255,255,255,0.04) 40%, transparent 65%)',
        }}
      />
    </div>
  );
}

export default TiltCard;
