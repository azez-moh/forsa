import { opportunities, type CategoryId, type CityId, type Opportunity, type OpportunityStage, type OpportunityType } from '@forsa/data';
import { normalizeArabic, searchHaystack } from '@/lib/opportunity';

export type SortKey = 'newest' | 'oldest' | 'priceAsc' | 'priceDesc' | 'views' | 'featured';

export interface Filters {
  q: string;
  type: OpportunityType | null;
  categories: CategoryId[];
  cities: CityId[];
  stages: OpportunityStage[];
  /** log-scale price bounds, SAR */
  priceMin: number | null;
  priceMax: number | null;
  equityMin: number | null;
  verifiedOnly: boolean;
  ndaOnly: boolean;
  sort: SortKey;
}

export const EMPTY_FILTERS: Filters = {
  q: '',
  type: null,
  categories: [],
  cities: [],
  stages: [],
  priceMin: null,
  priceMax: null,
  equityMin: null,
  verifiedOnly: false,
  ndaOnly: false,
  sort: 'featured',
};

/** Log-scale price slider, 10K–300M (US-DISC-04). Position 0..100 <-> SAR. */
export const PRICE_FLOOR = 10_000;
export const PRICE_CEIL = 300_000_000;
const LMIN = Math.log10(PRICE_FLOOR);
const LMAX = Math.log10(PRICE_CEIL);
export const posToPrice = (p: number) => {
  const raw = 10 ** (LMIN + ((LMAX - LMIN) * p) / 100);
  const mag = 10 ** Math.max(0, Math.floor(Math.log10(raw)) - 1);
  return Math.round(raw / mag) * mag;
};
export const priceToPos = (v: number) => Math.max(0, Math.min(100, ((Math.log10(Math.max(v, PRICE_FLOOR)) - LMIN) / (LMAX - LMIN)) * 100));

export function applyFilters(f: Filters, list: Opportunity[] = opportunities, ignoreType = false): Opportunity[] {
  const q = normalizeArabic(f.q.trim());
  const tokens = q ? q.split(/\s+/) : [];
  const out = list.filter((o) => {
    if (!ignoreType && f.type !== null && o.type !== f.type) return false;
    if (f.categories.length && !f.categories.includes(o.categoryId)) return false;
    if (f.cities.length && !f.cities.includes(o.cityId)) return false;
    if (f.stages.length && !f.stages.includes(o.stage)) return false;
    if (f.priceMin !== null && o.priceSar < f.priceMin) return false;
    if (f.priceMax !== null && o.priceSar > f.priceMax) return false;
    if (f.equityMin !== null && (o.equityPercent ?? 0) < f.equityMin) return false;
    if (f.verifiedOnly && !o.verified) return false;
    if (f.ndaOnly && !o.ndaRequired) return false;
    if (tokens.length) {
      const hay = normalizeArabic(searchHaystack(o));
      if (!tokens.every((tk) => hay.includes(tk))) return false;
    }
    return true;
  });
  const by: Record<SortKey, (a: Opportunity, b: Opportunity) => number> = {
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
    priceAsc: (a, b) => a.priceSar - b.priceSar,
    priceDesc: (a, b) => b.priceSar - a.priceSar,
    views: (a, b) => b.views - a.views,
    featured: (a, b) => Number(b.featured) - Number(a.featured) || Number(b.verified) - Number(a.verified) || b.createdAt.localeCompare(a.createdAt),
  };
  return out.sort(by[f.sort]);
}

export function activeFilterCount(f: Filters): number {
  return (
    f.categories.length +
    f.cities.length +
    f.stages.length +
    (f.priceMin !== null || f.priceMax !== null ? 1 : 0) +
    (f.equityMin !== null ? 1 : 0) +
    (f.verifiedOnly ? 1 : 0) +
    (f.ndaOnly ? 1 : 0)
  );
}
