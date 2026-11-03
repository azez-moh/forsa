'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Inputs: 48px on web, radius 12, fill.tertiary, no border until focus (design system §10). */
const fieldBase =
  'w-full rounded-md bg-fill-3 px-4 text-[17px] text-label placeholder:text-label-3 outline-0 ' +
  'ring-0 transition-shadow duration-200 focus:bg-bg focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus focus:outline-[3px] focus:outline-offset-2 focus:outline-focus ' +
  'aria-[invalid=true]:shadow-[0_0_0_2px_var(--color-danger)]';

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
  id: string;
  children: ReactNode;
  className?: string;
}

function FieldShell({ label, hint, error, optionalLabel, id, children, className }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-[15px] font-bold text-label">
        <span>{label}</span>
        {optionalLabel && <span className="text-[13px] font-normal text-label-2">{optionalLabel}</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-label-2">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type TFProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  containerClassName?: string;
};

export const TextField = forwardRef<HTMLInputElement, TFProps>(function TextField(
  { label, hint, error, optionalLabel, leading, trailing, containerClassName, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell label={label} hint={hint} error={error} optionalLabel={optionalLabel} id={fid} className={containerClassName}>
      <div className="relative">
        {leading && <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-label-2">{leading}</span>}
        <input
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
          className={cn(fieldBase, 'h-12', leading && 'ps-11', trailing && 'pe-12', className)}
          {...rest}
        />
        {trailing && <span className="absolute inset-y-0 end-2 flex items-center">{trailing}</span>}
      </div>
    </FieldShell>
  );
});

type TAProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string; optionalLabel?: string; containerClassName?: string };

export const TextArea = forwardRef<HTMLTextAreaElement, TAProps>(function TextArea(
  { label, hint, error, optionalLabel, containerClassName, className, id, rows = 4, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell label={label} hint={hint} error={error} optionalLabel={optionalLabel} id={fid} className={containerClassName}>
      <textarea
        ref={ref}
        id={fid}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
        className={cn(fieldBase, 'min-h-28 resize-y py-3 leading-relaxed', className)}
        {...rest}
      />
    </FieldShell>
  );
});

type SelProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; error?: string; optionalLabel?: string; containerClassName?: string };

export const SelectField = forwardRef<HTMLSelectElement, SelProps>(function SelectField(
  { label, hint, error, optionalLabel, containerClassName, className, id, children, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell label={label} hint={hint} error={error} optionalLabel={optionalLabel} id={fid} className={containerClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
          className={cn(fieldBase, 'h-12 appearance-none pe-10', className)}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown aria-hidden size={18} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-label-2" />
      </div>
    </FieldShell>
  );
});

/** Checkbox row with a 44px target. */
export function CheckboxRow({ checked, onChange, children, id, error }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; id?: string; error?: string }) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div>
      <label htmlFor={fid} className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-[15px] leading-relaxed text-label">
        <input
          id={fid}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--color-primary)]"
        />
        <span>{children}</span>
      </label>
      {error && <p role="alert" className="text-[13px] text-danger">{error}</p>}
    </div>
  );
}
