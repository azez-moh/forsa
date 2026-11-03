'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

/**
 * Shared-element card → detail transition (design system §11.5) using the View Transitions API,
 * guarded by feature detection and prefers-reduced-motion. Falls back to a normal navigation.
 */
let resolvePending: (() => void) | null = null;

type VTDocument = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };

export function ViewTransitionListener() {
  const pathname = usePathname();
  useEffect(() => {
    if (resolvePending) {
      const r = resolvePending;
      resolvePending = null;
      // Wait one frame so the new route has painted its named elements.
      requestAnimationFrame(() => r());
    }
  }, [pathname]);
  return null;
}

export function useTransitionNavigate() {
  const router = useRouter();
  return useCallback(
    (href: string, named?: HTMLElement | null, name?: string) => {
      const doc = document as VTDocument;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!doc.startViewTransition || reduce) {
        router.push(href);
        return;
      }
      if (named && name) named.style.viewTransitionName = name;
      const vt = doc.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            resolvePending = resolve;
            router.push(href);
            setTimeout(() => {
              if (resolvePending === resolve) {
                resolvePending = null;
                resolve();
              }
            }, 1200);
          }),
      );
      vt.finished.finally(() => {
        if (named) named.style.viewTransitionName = '';
      });
    },
    [router],
  );
}
