'use client';

import { categories, cities, type CategoryId, type CityId, type OpportunityStage } from '@forsa/data';
import { useApp } from '@/lib/store';
import { Chip } from '@/components/ui/Chip';
import { CheckboxRow } from '@/components/ui/TextField';
import { formatSAR } from '@/lib/format';
import { STAGE_KEY } from '@/lib/opportunity';
import { posToPrice, priceToPos, PRICE_CEIL, PRICE_FLOOR, type Filters } from './filters';

const STAGES: OpportunityStage[] = ['idea', 'early', 'operating', 'established'];

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

/** Filter body used in the mobile sheet and the desktop sidebar (US-DISC-04). */
export function FilterPanel({ value, onChange }: { value: Filters; onChange: (f: Filters) => void }) {
  const { t, locale } = useApp();
  const set = (p: Partial<Filters>) => onChange({ ...value, ...p });
  const minPos = value.priceMin === null ? 0 : priceToPos(value.priceMin);
  const maxPos = value.priceMax === null ? 100 : priceToPos(value.priceMax);

  // Cities grouped by region.
  const regions = new Map<string, typeof cities>();
  for (const c of cities) {
    const k = c.region[locale];
    regions.set(k, [...(regions.get(k) ?? []), c]);
  }

  const presets: Array<{ key: 'pricePresetLow' | 'pricePresetMid' | 'pricePresetHigh'; min: number | null; max: number | null }> = [
    { key: 'pricePresetLow', min: null, max: 500_000 },
    { key: 'pricePresetMid', min: 500_000, max: 2_000_000 },
    { key: 'pricePresetHigh', min: 2_000_000, max: null },
  ];

  return (
    <div className="flex flex-col gap-8">
      <fieldset>
        <legend className="t-headline mb-3">{t('priceRange')}</legend>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Chip key={p.key} selected={value.priceMin === p.min && value.priceMax === p.max} onClick={() => set({ priceMin: p.min, priceMax: p.max })}>
              {t(p.key)}
            </Chip>
          ))}
        </div>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-1 text-[13px] text-label-2">
            <span className="flex justify-between">
              {t('priceMin')}
              <bdi className="tabular font-bold text-label">{value.priceMin === null ? t('any') : formatSAR(value.priceMin, locale)}</bdi>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={minPos}
              aria-valuetext={value.priceMin === null ? t('any') : formatSAR(value.priceMin, locale)}
              onChange={(e) => {
                const p = Number(e.target.value);
                set({ priceMin: p <= 0 ? null : Math.min(posToPrice(p), value.priceMax ?? PRICE_CEIL) });
              }}
              className="h-11 w-full accent-[var(--color-primary)]"
            />
          </label>
          <label className="grid gap-1 text-[13px] text-label-2">
            <span className="flex justify-between">
              {t('priceMax')}
              <bdi className="tabular font-bold text-label">{value.priceMax === null ? t('any') : formatSAR(value.priceMax, locale)}</bdi>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={maxPos}
              aria-valuetext={value.priceMax === null ? t('any') : formatSAR(value.priceMax, locale)}
              onChange={(e) => {
                const p = Number(e.target.value);
                set({ priceMax: p >= 100 ? null : Math.max(posToPrice(p), value.priceMin ?? PRICE_FLOOR) });
              }}
              className="h-11 w-full accent-[var(--color-primary)]"
            />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="t-headline mb-3">{t('category')}</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Chip key={c.id} selected={value.categories.includes(c.id)} onClick={() => set({ categories: toggle<CategoryId>(value.categories, c.id) })}>
              {c.name[locale]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="t-headline mb-3">{t('stagesTitle')}</legend>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <Chip key={s} selected={value.stages.includes(s)} onClick={() => set({ stages: toggle(value.stages, s) })}>
              {t(STAGE_KEY[s])}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="t-headline mb-3">
          {t('equityMin')}{' '}
          <bdi className="tabular text-primary-text">{value.equityMin === null ? t('any') : `${value.equityMin}%`}</bdi>
        </legend>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={value.equityMin ?? 0}
          aria-label={t('equityMin')}
          aria-valuetext={value.equityMin === null ? t('any') : `${value.equityMin}%`}
          onChange={(e) => set({ equityMin: Number(e.target.value) || null })}
          className="h-11 w-full accent-[var(--color-primary)]"
        />
      </fieldset>

      <fieldset>
        <legend className="t-headline mb-3">{t('city')}</legend>
        <div className="flex flex-col gap-4">
          {Array.from(regions.entries()).map(([region, list]) => (
            <div key={region}>
              <p className="mb-2 text-[13px] text-label-2">{region}</p>
              <div className="flex flex-wrap gap-2">
                {list.map((c) => (
                  <Chip key={c.id} selected={value.cities.includes(c.id)} onClick={() => set({ cities: toggle<CityId>(value.cities, c.id) })}>
                    {c.name[locale]}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col">
        <CheckboxRow checked={value.verifiedOnly} onChange={(v) => set({ verifiedOnly: v })}>
          {t('verifiedOnly')}
        </CheckboxRow>
        <CheckboxRow checked={value.ndaOnly} onChange={(v) => set({ ndaOnly: v })}>
          {t('ndaOnly')}
        </CheckboxRow>
      </div>
    </div>
  );
}
