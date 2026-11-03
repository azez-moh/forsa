'use client';

import type { PointerEvent, ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useFinePointer, usePrefersReducedMotion } from './shared';

export interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

const MAX_TILT = 3; // degrees
const DEPTH = 8; // px
const SPRING = { stiffness: 220, damping: 22, mass: 0.5 };

/**
 * iOS-style parallax card: tilts at most 3° toward a desktop pointer, shifts its content up to 8px
 * for depth, and sweeps a faint specular highlight. Touch devices and reduced motion get a plain card.
 * Put radius/background on `className`; the highlight inherits the border radius.
 */
export function TiltCard({ children, className }: TiltCardProps) {
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const enabled = fine && !reduce;

  // Normalised pointer position, -1..1 on each axis (0 = centre).
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const hover = useMotionValue(0);
  const sx = useSpring(nx, SPRING);
  const sy = useSpring(ny, SPRING);
  const sh = useSpring(hover, { stiffness: 140, damping: 24 });

  const rotateY = useTransform(sx, (v) => v * MAX_TILT);
  const rotateX = useTransform(sy, (v) => -v * MAX_TILT);
  const depthX = useTransform(sx, (v) => v * DEPTH);
  const depthY = useTransform(sy, (v) => v * DEPTH);
  const lightX = useTransform(sx, (v) => `${50 + v * 50}%`);
  const lightY = useTransform(sy, (v) => `${50 + v * 50}%`);
  const highlight = useMotionTemplate`radial-gradient(520px circle at ${lightX} ${lightY}, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 40%, transparent 65%)`;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    nx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    ny.set(((e.clientY - r.top) / r.height) * 2 - 1);
    hover.set(1);
  };
  const onLeave = () => {
    nx.set(0);
    ny.set(0);
    hover.set(0);
  };

  if (!enabled) {
    return <div className={['relative', className].filter(Boolean).join(' ')}>{children}</div>;
  }

  return (
    <motion.div
      className={['relative will-change-transform', className].filter(Boolean).join(' ')}
      style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: 'preserve-3d' }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div className="relative h-full" style={{ x: depthX, y: depthY }}>
        {children}
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{ borderRadius: 'inherit', backgroundImage: highlight, opacity: sh, mixBlendMode: 'soft-light' }}
      />
    </motion.div>
  );
}

export default TiltCard;
