'use client';

import type { PointerEvent, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { clamp, useFinePointer, usePrefersReducedMotion } from './shared';

export interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /** Fraction of the pointer offset applied to the child (default 0.3). Movement is capped at 6px. */
  strength?: number;
}

const MAX_SHIFT = 6;
const SPRING = { stiffness: 260, damping: 18, mass: 0.4 };

/** Wraps a CTA so it leans gently toward a desktop pointer. No effect on touch or reduced motion. */
export function MagneticButton({ children, className, strength = 0.3 }: MagneticButtonProps) {
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const enabled = fine && !reduce;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, SPRING);
  const y = useSpring(my, SPRING);

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (!enabled || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(clamp((e.clientX - (r.left + r.width / 2)) * strength, -MAX_SHIFT, MAX_SHIFT));
    my.set(clamp((e.clientY - (r.top + r.height / 2)) * strength, -MAX_SHIFT, MAX_SHIFT));
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.span
      className={['inline-block will-change-transform', className].filter(Boolean).join(' ')}
      style={enabled ? { x, y } : undefined}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onBlur={reset}
    >
      {children}
    </motion.span>
  );
}

export default MagneticButton;
