'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { EASE_OUT, usePrefersReducedMotion } from './shared';

export interface RevealOnScrollProps {
  children: ReactNode;
  /** Seconds before the reveal starts once in view. */
  delay?: number;
  /** Rise distance in px. */
  y?: number;
  className?: string;
}

/** Fades and rises its content once, the first time it enters the viewport. */
export function RevealOnScroll({ children, delay = 0, y = 16, className }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2, margin: '0px 0px -8% 0px' });
  const reduce = usePrefersReducedMotion();
  const visible = inView || reduce;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={reduce ? { duration: 0 } : { duration: 0.7, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

export default RevealOnScroll;
