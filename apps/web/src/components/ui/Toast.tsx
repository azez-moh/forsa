'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';

/** Status toast (CSS transition only). */
export function Toast() {
  const { toast } = useApp();
  const [shown, setShown] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (toast) {
      setMsg(toast.message);
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
  }, [toast]);
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-28 z-[90] flex justify-center px-4 md:bottom-8">
      {msg && (
        <div
          className={`rounded-full bg-label px-5 py-3 text-[15px] font-medium text-bg shadow-e3 transition-[opacity,transform] duration-250 motion-reduce:transform-none ${shown && toast ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
        >
          {msg}
        </div>
      )}
    </div>
  );
}
