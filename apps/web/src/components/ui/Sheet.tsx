'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { motion as motionTokens } from '@forsa/tokens';
import { cn } from '@/lib/cn';
import { IconButton } from './Button';

/**
 * Sheet / Modal: bottom sheet on mobile (grabber, radius 22 top), centred dialog on ≥ md.
 * Focus-trapped, Esc closes, focus restored to the opener, body scroll locked.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeLabel = 'إغلاق',
  headerExtra,
  initialFocus,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeLabel?: string;
  headerExtra?: ReactNode;
  initialFocus?: string;
}) {
  const titleId = useId();
  const descId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFirst = () => {
      const el = panel.current;
      if (!el) return;
      const target = (initialFocus && el.querySelector<HTMLElement>(initialFocus)) || el.querySelector<HTMLElement>('[data-autofocus]') || el;
      target.focus({ preventScroll: true });
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const f = Array.from(
        panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'),
      ).filter((x) => x.offsetParent !== null || x === document.activeElement);
      if (!f.length) {
        e.preventDefault();
        return;
      }
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      restore.current?.focus?.({ preventScroll: true });
    };
  }, [open, initialFocus]);

  if (!mounted) return null;

  const spring = motionTokens.spring.default.web;
  const maxW = size === 'sm' ? 'md:max-w-[440px]' : size === 'lg' ? 'md:max-w-[720px]' : 'md:max-w-[560px]';

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-xl bg-elevated shadow-e4 outline-none',
              'md:rounded-xl',
              maxW,
            )}
            initial={reduce ? { opacity: 0 } : { y: '100%', opacity: 1 }}
            animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: '100%', opacity: 1 }}
            transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: spring.stiffness, damping: spring.damping * 1.35, mass: 1 }}
          >
            <div className="mx-auto mt-2 h-[5px] w-9 rounded-full bg-fill-1 md:hidden" aria-hidden />
            <header className="flex items-start justify-between gap-4 px-6 pb-2 pt-4 md:pt-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id={titleId} className="t-title3 text-label">
                    {title}
                  </h2>
                  {headerExtra}
                </div>
                {description && (
                  <p id={descId} className="mt-1 text-[15px] text-label-2">
                    {description}
                  </p>
                )}
              </div>
              <IconButton label={closeLabel} onClick={onClose} className="shrink-0">
                <X size={18} aria-hidden />
              </IconButton>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2">{children}</div>
            {footer && <div className="border-t border-separator/60 bg-elevated px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
