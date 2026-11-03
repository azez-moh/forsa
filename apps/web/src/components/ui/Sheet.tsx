'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
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
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Keep the sheet in the DOM for the exit transition (CSS only, no animation library: QA P2-9).
  const [render, setRender] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (open) {
      setRender(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const id = window.setTimeout(() => setRender(false), 320);
    return () => window.clearTimeout(id);
  }, [open]);

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

  const maxW = size === 'sm' ? 'md:max-w-[440px]' : size === 'lg' ? 'md:max-w-[720px]' : 'md:max-w-[560px]';

  return createPortal(
    render ? (
      <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6">
        <div
          className={cn('absolute inset-0 bg-black/40 transition-opacity duration-200', shown ? 'opacity-100' : 'opacity-0')}
          onClick={onClose}
          aria-hidden
        />
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          className={cn(
            'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-xl bg-elevated shadow-e4 outline-none',
            'md:rounded-xl',
            // spring.default feel: bottom sheet slides up on mobile, dialog scales in on desktop; crossfade under reduced motion
            'transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-opacity motion-reduce:duration-150',
            shown
              ? 'translate-y-0 opacity-100 md:scale-100'
              : 'translate-y-full opacity-100 md:translate-y-4 md:scale-[0.98] md:opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-0',
            maxW,
          )}
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
        </div>
      </div>
    ) : null,
    document.body,
  );
}
