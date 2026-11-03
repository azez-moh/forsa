import { formatSAR } from '@forsa/tokens';
import type { Locale } from './i18n';

export { formatSAR };

export function formatNumber(n: number, locale: Locale = 'ar'): string {
  return n.toLocaleString('en-US');
  void locale;
}

export function formatPriceFull(n: number, locale: Locale): string {
  const v = n.toLocaleString('en-US');
  return locale === 'ar' ? `${v} ر.س` : `SAR ${v}`;
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 1000) / 10}%`;
}

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const m = (locale === 'ar' ? AR_MONTHS : EN_MONTHS)[d.getUTCMonth()];
  return locale === 'ar' ? `${d.getUTCDate()} ${m} ${d.getUTCFullYear()}` : `${m} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function formatCompact(n: number, locale: Locale): string {
  if (n >= 1e6) return locale === 'ar' ? `${(n / 1e6).toLocaleString('en-US', { maximumFractionDigits: 2 })} مليون` : `${(n / 1e6).toLocaleString('en-US', { maximumFractionDigits: 2 })}M`;
  if (n >= 1e4) return locale === 'ar' ? `${(n / 1e3).toLocaleString('en-US', { maximumFractionDigits: 1 })} ألف` : `${(n / 1e3).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`;
  return n.toLocaleString('en-US');
}
