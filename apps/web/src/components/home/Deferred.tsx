'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Mounts `children` only when the placeholder approaches the viewport (QA P2-9, mobile performance).
 * Used with next/dynamic so below-the-fold wow sections do not download, parse or hydrate on load.
 * `minHeight` reserves space so there is no layout shift when the section arrives.
 */
export function Deferred({ children, minHeight, rootMargin = '600px 0px', className, style }: { children: ReactNode; minHeight: string; rootMargin?: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return (
    <div ref={ref} className={className} style={show ? style : { minHeight, ...style }}>
      {show ? children : null}
    </div>
  );
}
