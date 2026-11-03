'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useApp } from '@/lib/store';

export function Toast() {
  const { toast } = useApp();
  const reduce = useReducedMotion();
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-28 z-[90] flex justify-center px-4 md:bottom-8">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-full bg-label px-5 py-3 text-[15px] font-medium text-bg shadow-e3"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
