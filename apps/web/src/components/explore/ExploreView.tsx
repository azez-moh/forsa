'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowDownUp, BookmarkPlus, LayoutGrid, Map as MapIcon, Search, SlidersHorizontal, X } from 'lucide-react';
import { getCategory, getCity, opportunities, type CategoryId, type CityId, type OpportunityStage } from '@forsa/data';
import { useApp } from '@/lib/store';
import { cityStats, STAGE_KEY, TYPE_ORDER, typeFromSlug, typeLabel, typeSlug } from '@/lib/opportunity';
import { formatSAR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { RemovableChip } from '@/components/ui/Chip';
import { OpportunityCard } from '@/components/ui/OpportunityCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { CityMap, TiltCard } from '@/components/home/wow';
import { FilterPanel } from './FilterPanel';
import { activeFilterCount, applyFilters, EMPTY_FILTERS, type Filters, type SortKey } from './filters';
import type { DictKey } from '@/lib/i18n';

const SORTS: Array<[SortKey, DictKey]> = [
  ['featured', 'sortFeatured'],
  ['newest', 'sortNewest'],
  ['priceAsc', 'sortPriceAsc'],
  ['priceDesc', 'sortPriceDesc'],
  ['views', 'sortViews'],
  ['oldest', 'sortOldest'],
];

function fromParams(sp: URLSearchParams): Filters {
  const list = <T extends string>(k: string) => (sp.get(k)?.split(',').filter(Boolean) ?? []) as T[];
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : null);
  return {
    ...EMPTY_FILTERS,
    q: sp.get('q') ?? '',
    type: typeFromSlug(sp.get('type')),
    categories: list<CategoryId>('cat'),
    cities: list<CityId>('city'),
    stages: list<OpportunityStage>('stage'),
    priceMin: num('min'),
    priceMax: num('max'),
    equityMin: num('eq'),
    verifiedOnly: sp.get('verified') === '1',
    ndaOnly: sp.get('nda') === '1',
    sort: (sp.get('sort') as SortKey) || 'featured',
  };
}

function toQuery(f: Filters, view: 'grid' | 'map'): string {
  const sp = new URLSearchParams();
  if (f.q) sp.set('q', f.q);
  if (f.type !== null) sp.set('type', typeSlug(f.type));
  if (f.categories.length) sp.set('cat', f.categories.join(','));
  if (f.cities.length) sp.set('city', f.cities.join(','));
  if (f.stages.length) sp.set('stage', f.stages.join(','));
  if (f.priceMin !== null) sp.set('min', String(f.priceMin));
  if (f.priceMax !== null) sp.set('max', String(f.priceMax));
  if (f.equityMin !== null) sp.set('eq', String(f.equityMin));
  if (f.verifiedOnly) sp.set('verified', '1');
  if (f.ndaOnly) sp.set('nda', '1');
  if (f.sort !== 'featured') sp.set('sort', f.sort);
  if (view === 'map') sp.set('view', 'map');
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/** S02 Explore (US-DISC-02..05): search, type segmented control, filter sheet/sidebar, sort, grid/map, save search. */
export function ExploreView() {
  const { t, locale, requireAuth, addSavedSearch, showToast } = useApp();
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [f, setF] = useState<Filters>(() => fromParams(new URLSearchParams(sp.toString())));
  const [qInput, setQInput] = useState(f.q);
  const [view, setView] = useState<'grid' | 'map'>(sp.get('view') === 'map' ? 'map' : 'grid');
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState<Filters>(f);
  const [ready, setReady] = useState(false);
  const first = useRef(true);

  useEffect(() => setReady(true), []);

  // Debounced keyword (250ms).
  useEffect(() => {
    const id = setTimeout(() => setF((x) => (x.q === qInput ? x : { ...x, q: qInput })), 250);
    return () => clearTimeout(id);
  }, [qInput]);

  // Reflect state in the URL without a reload.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    router.replace(`${pathname}${toQuery(f, view)}`, { scroll: false });
  }, [f, view, pathname, router]);

  const results = useMemo(() => applyFilters(f), [f]);
  const base = useMemo(() => applyFilters(f, opportunities, true), [f]);
  const count = activeFilterCount(f);

  const segments = [
    { value: 'all', label: t('allTypes'), count: base.length },
    ...TYPE_ORDER.map((ty) => ({ value: typeSlug(ty), label: typeLabel(ty, locale), count: base.filter((o) => o.type === ty).length })),
  ];

  const chips: Array<{ key: string; label: string; remove: () => void }> = [
    ...f.categories.map((c) => ({ key: `c-${c}`, label: getCategory(c)?.name[locale] ?? c, remove: () => setF({ ...f, categories: f.categories.filter((x) => x !== c) }) })),
    ...f.cities.map((c) => ({ key: `ci-${c}`, label: getCity(c)?.name[locale] ?? c, remove: () => setF({ ...f, cities: f.cities.filter((x) => x !== c) }) })),
    ...f.stages.map((s) => ({ key: `s-${s}`, label: t(STAGE_KEY[s]), remove: () => setF({ ...f, stages: f.stages.filter((x) => x !== s) }) })),
    ...(f.priceMin !== null || f.priceMax !== null
      ? [
          {
            key: 'price',
            label: `${f.priceMin !== null ? formatSAR(f.priceMin, locale) : t('any')} – ${f.priceMax !== null ? formatSAR(f.priceMax, locale) : t('any')}`,
            remove: () => setF({ ...f, priceMin: null, priceMax: null }),
          },
        ]
      : []),
    ...(f.equityMin !== null ? [{ key: 'eq', label: `${t('equityMin')} ${f.equityMin}%`, remove: () => setF({ ...f, equityMin: null }) }] : []),
    ...(f.verifiedOnly ? [{ key: 'ver', label: t('verifiedOnly'), remove: () => setF({ ...f, verifiedOnly: false }) }] : []),
    ...(f.ndaOnly ? [{ key: 'nda', label: t('ndaOnly'), remove: () => setF({ ...f, ndaOnly: false }) }] : []),
  ];

  const saveSearch = () =>
    requireAuth(() => {
      addSavedSearch({ label: [f.q, f.type !== null ? typeLabel(f.type, locale) : null, ...chips.map((c) => c.label)].filter(Boolean).join(' · ') || t('allTypes'), query: toQuery(f, 'grid') });
      showToast(t('searchSaved'));
    });

  const mapCities = useMemo(() => {
    const byCity = new Map<string, { count: number; value: number }>();
    for (const o of results) {
      const v = byCity.get(o.cityId) ?? { count: 0, value: 0 };
      byCity.set(o.cityId, { count: v.count + 1, value: v.value + o.priceSar });
    }
    return cityStats()
      .filter((c) => byCity.has(c.id))
      .map((c) => ({ id: c.id, nameAr: c.nameAr, nameEn: c.nameEn, ...byCity.get(c.id)! }));
  }, [results]);

  return (
    <div className="container-page pb-24 pt-24 md:pt-32">
      <header className="mb-8">
        <h1 className="t-display-m">{t('exploreTitle')}</h1>
        <p className="mt-3 max-w-2xl text-[17px] text-label-2 md:text-[19px]">{t('exploreLead')}</p>
      </header>

      {/* Search + controls */}
      <div className="flex flex-col gap-4">
        <div role="search" className="relative">
          <label htmlFor="explore-q" className="sr-only">
            {t('searchLabel')}
          </label>
          <Search size={20} aria-hidden className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-label-2" />
          <input
            id="explore-q"
            type="search"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder={t('heroSearch')}
            className="h-14 w-full rounded-lg bg-fill-3 ps-12 pe-12 text-[17px] outline-0 transition-shadow focus:bg-bg focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus focus:outline-[3px] focus:outline-offset-2 focus:outline-focus"
          />
          {qInput && (
            <button type="button" onClick={() => setQInput('')} aria-label={t('clearAll')} className="absolute end-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-label-2 hover:text-label">
              <X size={18} aria-hidden />
            </button>
          )}
        </div>

        <SegmentedControl
          label={t('type')}
          value={f.type === null ? 'all' : typeSlug(f.type)}
          onChange={(v) => setF({ ...f, type: v === 'all' ? null : typeFromSlug(v) })}
          segments={segments}
          scroll
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="gray"
            size="md"
            icon={<SlidersHorizontal size={17} aria-hidden />}
            onClick={() => {
              setDraft(f);
              setSheet(true);
            }}
            className="lg:hidden"
          >
            {t('filters')}
            {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[12px] text-on-primary tabular">{count}</span>}
          </Button>
          <label className="relative inline-flex">
            <span className="sr-only">{t('sort')}</span>
            <ArrowDownUp size={16} aria-hidden className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-label" />
            <select
              value={f.sort}
              onChange={(e) => setF({ ...f, sort: e.target.value as SortKey })}
              className="h-11 appearance-none rounded-[12px] bg-fill-3 ps-9 pe-4 text-[15px] font-bold text-label outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              {SORTS.map(([k, label]) => (
                <option key={k} value={k}>
                  {t(label)}
                </option>
              ))}
            </select>
          </label>
          <Button variant="plain" size="md" icon={<BookmarkPlus size={17} aria-hidden />} onClick={saveSearch}>
            {t('saveSearch')}
          </Button>
          <div className="ms-auto">
            <SegmentedControl
              size="sm"
              label={t('viewMode')}
              value={view}
              onChange={setView}
              segments={[
                { value: 'grid', label: t('viewGrid') },
                { value: 'map', label: t('viewMap') },
              ]}
            />
          </div>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <RemovableChip key={c.key} onRemove={c.remove} removeLabel={t('close')}>
                {c.label}
              </RemovableChip>
            ))}
            <Button variant="plain" size="sm" onClick={() => setF({ ...EMPTY_FILTERS, q: f.q, type: f.type, sort: f.sort })}>
              {t('clearAll')}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside aria-label={t('filters')} className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pe-2">
            <FilterPanel value={f} onChange={setF} />
          </div>
        </aside>

        <section aria-labelledby="results-h">
          {/* h2 so card h3s follow the page h1 (QA N-P2-3) */}
          <h2 id="results-h" aria-live="polite" className="mb-5 text-[15px] font-normal text-label-2">
            <bdi className="tabular font-bold text-label">{results.length}</bdi> {t('results')}
          </h2>

          {!ready ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={<Search size={24} aria-hidden />}
              title={t('noResultsTitle')}
              body={t('noResultsBody')}
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="tinted" onClick={() => { setQInput(''); setF({ ...EMPTY_FILTERS }); }}>
                    {t('clearAll')}
                  </Button>
                  <Button variant="plain" onClick={saveSearch}>
                    {t('saveSearch')}
                  </Button>
                </div>
              }
            />
          ) : view === 'map' ? (
            <div className="flex flex-col gap-8">
              {/* US-DISC-05: the Wow agent's CityMap renders city clusters; selecting one filters the list. */}
              <div className="flex items-center gap-2 text-[15px] text-label-2">
                <MapIcon size={17} aria-hidden /> {t('mapLead')}
              </div>
              <CityMap
                cities={mapCities.map(({ nameAr, nameEn, count, value }) => ({ nameAr, nameEn, count, value }))}
                onNavigate={(c) => {
                  const hit = mapCities.find((x) => x.nameEn === c.nameEn);
                  if (hit) {
                    setF({ ...f, cities: [hit.id] });
                    setView('grid');
                  }
                }}
                locale={locale}
              />
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((o, i) => (
                <li key={o.id}>
                  <TiltCard className="h-full">
                    <OpportunityCard o={o} priority={i < 3} />
                  </TiltCard>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title={t('filters')}
        closeLabel={t('close')}
        footer={
          <div className="flex gap-3">
            <Button variant="gray" size="lg" onClick={() => setDraft({ ...EMPTY_FILTERS, q: f.q, type: f.type, sort: f.sort })}>
              {t('clearAll')}
            </Button>
            <Button
              size="lg"
              full
              icon={<LayoutGrid size={17} aria-hidden />}
              onClick={() => {
                setF(draft);
                setSheet(false);
              }}
            >
              {t('apply')} (<bdi className="tabular">{applyFilters(draft).length}</bdi>)
            </Button>
          </div>
        }
      >
        <FilterPanel value={draft} onChange={setDraft} />
      </Sheet>
    </div>
  );
}
