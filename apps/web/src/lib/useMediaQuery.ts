'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** Hydration-safe media query: the server (and the first client render) sees `false`, then the real value. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  const get = useCallback(() => (typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches), [query]);
  return useSyncExternalStore(subscribe, get, () => false);
}
