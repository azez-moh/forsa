import { consultants, getProvider, type Service } from '@forsa/data';
import type { Locale } from './i18n';

/** Live grid shows bare durations ("5", "2"); the redesign always adds a unit (US-SRV-01). */
export function serviceDuration(s: Service, locale: Locale): string | undefined {
  if (!s.duration) return undefined;
  if (/^\d+$/.test(s.duration.trim())) {
    const n = Number(s.duration);
    if (locale === 'en') return `${n} business days`;
    return n === 1 ? 'يوم عمل' : n === 2 ? 'يوما عمل' : n <= 10 ? `${n} أيام عمل` : `${n} يوم عمل`;
  }
  return s.duration;
}

export function discountPercent(s: Service): number | null {
  if (!s.originalPriceSar || s.originalPriceSar <= s.priceSar) return null;
  return Math.round((1 - s.priceSar / s.originalPriceSar) * 100);
}

export const providerOf = (s: Service) => getProvider(s.providerId);

/** Real public consultants only; invented placeholder profiles are not shown in the pitch. */
export const publicConsultants = () => consultants.filter((c) => !c.placeholder);
