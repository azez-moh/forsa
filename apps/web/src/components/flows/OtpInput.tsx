'use client';

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

/** 4-digit OTP field with one-time-code autofill, paste support and per-digit labels. */
export function OtpInput({ value, onChange, label, digitLabel, error, autoFocus }: { value: string; onChange: (v: string) => void; label: string; digitLabel: string; error?: boolean; autoFocus?: boolean }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 4 }, (_, i) => value[i] ?? '');

  const set = (i: number, d: string) => {
    const arr = digits.slice();
    arr[i] = d;
    onChange(arr.join('').slice(0, 4));
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
      set(i - 1, '');
    }
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const txt = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (txt) {
      e.preventDefault();
      onChange(txt);
      refs.current[Math.min(txt.length, 3)]?.focus();
    }
  };

  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      {/* Digits always read left-to-right, even in RTL. */}
      <div dir="ltr" className="flex justify-center gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-autofocus={autoFocus && i === 0 ? true : undefined}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            pattern="[0-9]*"
            maxLength={1}
            aria-label={`${digitLabel} ${i + 1}`}
            value={d}
            onPaste={onPaste}
            onKeyDown={(e) => onKey(i, e)}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(-1);
              set(i, v);
              if (v && i < 3) refs.current[i + 1]?.focus();
            }}
            className={cn(
              'size-14 rounded-md bg-fill-3 text-center text-[24px] font-bold tabular text-label outline-none transition-shadow focus:bg-bg focus:shadow-[0_0_0_2px_var(--color-primary)]',
              error && 'shadow-[0_0_0_2px_var(--color-danger)]',
            )}
          />
        ))}
      </div>
    </fieldset>
  );
}
