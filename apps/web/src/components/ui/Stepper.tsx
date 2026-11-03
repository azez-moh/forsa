'use client';

import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';

/**
 * Wizard progress (S05 "One step" flow, design system §11.7): a capsule that fills as the user advances,
 * plus labelled steps. Completed steps are neutral (no green chips), the current step is bold.
 */
export function Stepper({
  steps,
  current,
  label,
  stepWord,
  ofWord,
  onJump,
}: {
  steps: string[];
  current: number;
  label: string;
  stepWord: string;
  ofWord: string;
  onJump?: (i: number) => void;
}) {
  const reduce = useReducedMotion();
  const pct = ((current + 1) / steps.length) * 100;
  return (
    <nav aria-label={label} className="w-full">
      <p className="mb-3 text-[13px] font-medium text-label-2">
        {stepWord} <bdi className="tabular">{current + 1}</bdi> {ofWord} <bdi className="tabular">{steps.length}</bdi>
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-fill-3" aria-hidden>
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 158, damping: 20.7 }}
        />
      </div>
      <ol className="mt-4 hidden gap-2 md:flex">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = !!onJump && done;
          return (
            <li key={s} className="flex-1">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onJump?.(i)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex min-h-11 w-full items-center gap-2 rounded-md text-start text-[14px] transition-colors',
                  active ? 'font-bold text-label' : done ? 'text-label-2 hover:text-label' : 'text-label-3',
                  clickable ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full text-[12px] font-bold tabular',
                    active ? 'bg-label text-bg' : done ? 'bg-fill-2 text-label' : 'bg-fill-3 text-label-3',
                  )}
                  aria-hidden
                >
                  {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                </span>
                {s}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
