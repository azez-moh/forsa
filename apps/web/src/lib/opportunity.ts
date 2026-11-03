import {
  OPPORTUNITY_TYPE_LABELS,
  OpportunityType,
  categories,
  cities,
  getCategory,
  getCity,
  opportunities,
  platformStats,
  type Opportunity,
  type OpportunityStage,
} from '@forsa/data';
import type { DictKey, Locale } from './i18n';
import { formatSAR } from '@forsa/tokens';

export const TYPE_ORDER: OpportunityType[] = [
  OpportunityType.ForSale,
  OpportunityType.Investment,
  OpportunityType.PartnerSearch,
  OpportunityType.InvestorForIdea,
];

/** CSS colour variable for the categorical type dot (tokens.opportunityTypes). */
export const TYPE_COLOR_VAR: Record<OpportunityType, string> = {
  [OpportunityType.ForSale]: 'var(--color-type-sale)',
  [OpportunityType.Investment]: 'var(--color-type-investment)',
  [OpportunityType.PartnerSearch]: 'var(--color-type-partner)',
  [OpportunityType.InvestorForIdea]: 'var(--color-type-investor)',
};

/** Editorial spelling fix: the data keeps the live label "إستثمارية"; the redesign uses "استثمارية". */
export function typeLabel(type: OpportunityType, locale: Locale, short = true): string {
  const l = OPPORTUNITY_TYPE_LABELS[type];
  const v = short ? l.short[locale] : l[locale];
  return v.replace('إستثمارية', 'استثمارية');
}

export function typeSlug(type: OpportunityType): string {
  return OPPORTUNITY_TYPE_LABELS[type].slug;
}

export function typeFromSlug(slug: string | null | undefined): OpportunityType | null {
  if (!slug) return null;
  const hit = TYPE_ORDER.find((t) => OPPORTUNITY_TYPE_LABELS[t].slug === slug);
  return hit ?? null;
}

export function cityName(id: Opportunity['cityId'], locale: Locale): string {
  return getCity(id)?.name[locale] ?? id;
}

export function categoryName(id: Opportunity['categoryId'], locale: Locale): string {
  return getCategory(id)?.name[locale] ?? id;
}

export const STAGE_KEY: Record<OpportunityStage, DictKey> = {
  idea: 'stageIdea',
  early: 'stageEarly',
  operating: 'stageOperating',
  established: 'stageEstablished',
};

export function priceLabelKey(type: OpportunityType): DictKey {
  return type === OpportunityType.ForSale ? 'askingPrice' : 'requiredInvestment';
}

/**
 * Metric honesty rule (US-OPP-02, product decision 4): undisclosed or junk values render as
 * "متاح بعد اتفاقية عدم الإفصاح", never 0 or "1 م²".
 */
export type MetricValue = { kind: 'value'; text: string } | { kind: 'locked' };

export interface MetricRow {
  key: DictKey;
  value: MetricValue;
}

function junk(n: number | undefined, min = 1): boolean {
  return n === undefined || n === null || Number.isNaN(n) || n < min;
}

export function opportunityMetrics(o: Opportunity, locale: Locale): MetricRow[] {
  const m = o.metrics;
  const isIdea = o.type === OpportunityType.InvestorForIdea || o.stage === 'idea';
  const sar = (n: number) => (locale === 'ar' ? `${n.toLocaleString('en-US')} ر.س` : `SAR ${n.toLocaleString('en-US')}`);
  const rows: MetricRow[] = [];
  const push = (key: DictKey, ok: boolean, text: () => string) => rows.push({ key, value: ok ? { kind: 'value', text: text() } : { kind: 'locked' } });

  push('equity', !junk(o.equityPercent), () => `${o.equityPercent}%`);
  push('revenue', !junk(m.annualRevenueSar, 1000), () => sar(m.annualRevenueSar!));
  push('margin', !junk(m.profitMargin, 0.001), () => `${Math.round(m.profitMargin! * 1000) / 10}%`);
  push('monthlyProfit', !junk(m.monthlyNetProfitSar, 100), () => sar(m.monthlyNetProfitSar!));
  push('payback', !junk(m.paybackMonths), () => `${m.paybackMonths} ${locale === 'ar' ? 'شهرًا' : 'months'}`);
  if (!isIdea) {
    push('branches', !junk(m.branches), () => `${m.branches}`);
    push('employees', !junk(m.employees, 2), () => `${m.employees}`);
    push('area', !junk(m.unitAreaSqm, 5), () => `${m.unitAreaSqm!.toLocaleString('en-US')} ${locale === 'ar' ? 'م²' : 'm²'}`);
    push('projectAge', !junk(m.projectAgeYears), () => `${m.projectAgeYears} ${locale === 'ar' ? (m.projectAgeYears! <= 10 && m.projectAgeYears! >= 3 ? 'سنوات' : 'سنة') : 'years'}`);
  }
  return rows;
}

/** Card-level quick facts: first two disclosed metrics, never junk. */
export function cardFacts(o: Opportunity, locale: Locale): Array<{ key: DictKey; text: string }> {
  return opportunityMetrics(o, locale)
    .filter((r): r is MetricRow & { value: { kind: 'value'; text: string } } => r.value.kind === 'value')
    .slice(0, 2)
    .map((r) => ({ key: r.key, text: r.value.text }));
}

export function similarOpportunities(o: Opportunity, n = 4): Opportunity[] {
  const same = opportunities.filter((x) => x.id !== o.id && (x.type === o.type || x.categoryId === o.categoryId));
  same.sort((a, b) => Number(b.type === o.type && b.categoryId === o.categoryId) - Number(a.type === o.type && a.categoryId === o.categoryId) || b.views - a.views);
  return same.slice(0, n);
}

export function searchHaystack(o: Opportunity): string {
  const c = getCity(o.cityId);
  const cat = getCategory(o.categoryId);
  return [o.title, o.shortDescription, o.description, c?.name.ar, c?.name.en, cat?.name.ar, cat?.name.en, ...o.highlights]
    .join(' ')
    .toLowerCase();
}

/** Normalise Arabic for search: unify alef/hamza, taa marbuta, alef maqsura; strip tashkeel. */
export function normalizeArabic(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}

export function cityStats() {
  return cities
    .map((c) => {
      const list = opportunities.filter((o) => o.cityId === c.id);
      return { id: c.id, nameAr: c.name.ar, nameEn: c.name.en, count: list.length, value: list.reduce((s, o) => s + o.priceSar, 0), lat: c.lat, lng: c.lng };
    })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}

const TYPE_DESC: Record<OpportunityType, { ar: string; en: string }> = {
  [OpportunityType.ForSale]: { ar: 'مشاريع قائمة تبحث عن مالك جديد، كاملة أو بحصة.', en: 'Running businesses looking for a new owner, in full or in part.' },
  [OpportunityType.Investment]: { ar: 'مشاريع تطلب تمويلًا مقابل حصة واضحة وعائد متوقع.', en: 'Businesses raising capital for clear equity and expected returns.' },
  [OpportunityType.PartnerSearch]: { ar: 'أصحاب مشاريع يبحثون عن شريك تشغيلي أو ممول.', en: 'Owners looking for an operating or funding partner.' },
  [OpportunityType.InvestorForIdea]: { ar: 'أفكار ومشاريع ناشئة تحتاج مستثمرًا يؤمن بها.', en: 'Ideas and early ventures that need a believing investor.' },
};

/**
 * Platform totals per type from the August 2026 report (platformStats). The report publishes only
 * for-sale (389) and investment (285); partner and investor-for-idea have no published figure, so
 * no count is shown for them rather than a demo number (QA P1-5).
 */
const PLATFORM_TYPE_TOTALS: Partial<Record<OpportunityType, number>> = {
  [OpportunityType.ForSale]: platformStats.forSaleOpportunities,
  [OpportunityType.Investment]: platformStats.investmentOpportunities,
};

export function typeCounts(locale: Locale = 'ar') {
  return TYPE_ORDER.map((t) => {
    const ex = opportunities.filter((o) => o.type === t).sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.verified) - Number(a.verified) || b.views - a.views)[0];
    return {
      id: t as number,
      nameAr: typeLabel(t, 'ar', false),
      nameEn: typeLabel(t, 'en', false),
      count: PLATFORM_TYPE_TOTALS[t],
      descriptionAr: TYPE_DESC[t].ar,
      descriptionEn: TYPE_DESC[t].en,
      href: `/opportunities/?type=${typeSlug(t)}`,
      example: ex
        ? {
            title: ex.title,
            meta: `${cityName(ex.cityId, locale)} · ${formatSAR(ex.priceSar, locale)}`,
            href: `/opportunities/${ex.id}/`,
          }
        : undefined,
    };
  });
}

export { categories, cities };
