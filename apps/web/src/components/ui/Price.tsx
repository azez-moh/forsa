import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n';
import { formatSAR } from '@/lib/format';

/** Price in tabular numerals wrapped in <bdi> (US-A11Y-02); compact form with the full value in aria-label. */
export function Price({ value, max, locale, compact = true, className }: { value: number; max?: number; locale: Locale; compact?: boolean; className?: string }) {
  const full = locale === 'ar' ? `${value.toLocaleString('en-US')} ريال سعودي` : `${value.toLocaleString('en-US')} Saudi riyals`;
  const shown = compact ? formatSAR(value, locale) : locale === 'ar' ? `${value.toLocaleString('en-US')} ر.س` : `SAR ${value.toLocaleString('en-US')}`;
  const maxShown = max ? (compact ? formatSAR(max, locale) : max.toLocaleString('en-US')) : null;
  return (
    <span className={cn('tabular', className)} aria-label={full}>
      <bdi>{shown}</bdi>
      {maxShown && (
        <>
          {' – '}
          <bdi>{maxShown}</bdi>
        </>
      )}
    </span>
  );
}
