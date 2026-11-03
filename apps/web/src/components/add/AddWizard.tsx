'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, CheckCircle2, ImagePlus, Lightbulb, Store, TrendingUp, Users } from 'lucide-react';
import { categories, cities, OpportunityType, type CategoryId, type CityId, type OpportunityStage, type Opportunity } from '@forsa/data';
import { useApp } from '@/lib/store';
import { readJSON, writeJSON } from '@/lib/storage';
import { arabicPriceWords } from '@/lib/arabicWords';
import { STAGE_KEY, TYPE_ORDER, typeLabel } from '@/lib/opportunity';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { CheckboxRow, SelectField, TextArea, TextField } from '@/components/ui/TextField';
import { OpportunityCard } from '@/components/ui/OpportunityCard';
import { cn } from '@/lib/cn';
import type { DictKey } from '@/lib/i18n';
import { qualityFlags } from './quality';

export interface Draft {
  type: OpportunityType | null;
  title: string;
  summary: string;
  categoryId: CategoryId | '';
  cityId: CityId | '';
  stage: OpportunityStage | '';
  price: string;
  negotiable: boolean;
  equity: string;
  revenue: string;
  margin: string;
  branches: string;
  employees: string;
  nda: boolean;
  photos: number;
}

const EMPTY: Draft = {
  type: null,
  title: '',
  summary: '',
  categoryId: '',
  cityId: '',
  stage: '',
  price: '',
  negotiable: false,
  equity: '',
  revenue: '',
  margin: '',
  branches: '',
  employees: '',
  nda: true,
  photos: 0,
};

const DRAFT_KEY = 'forsa.addDraft.v1';
const STEP_KEYS: DictKey[] = ['stepType', 'stepBasics', 'stepFinancials', 'stepMedia', 'stepReview'];
const TYPE_META: Record<OpportunityType, { icon: typeof Store; desc: DictKey }> = {
  [OpportunityType.ForSale]: { icon: Store, desc: 'typeSaleDesc' },
  [OpportunityType.Investment]: { icon: TrendingUp, desc: 'typeInvestmentDesc' },
  [OpportunityType.PartnerSearch]: { icon: Users, desc: 'typePartnerDesc' },
  [OpportunityType.InvestorForIdea]: { icon: Lightbulb, desc: 'typeInvestorDesc' },
};

const digits = (s: string) => s.replace(/[^\d.]/g, '');
const num = (s: string) => (s ? Number(digits(s)) : undefined);

/**
 * S05 Add-opportunity wizard (US-LST-01..06, US-ADM-01).
 * type → basics → numbers → photos → review. Starts without login, autosaves the draft locally,
 * asks only type-relevant fields, validates numbers, runs quality checks, discloses the 2.5% commission
 * at publish (no pledge at sign-up), and gates only the publish action behind S13.
 */
export function AddWizard() {
  const { t, locale, requireAuth, addListing } = useApp();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [d, setD] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [restored, setRestored] = useState(false);
  const [agree, setAgree] = useState(false);
  const [agreeErr, setAgreeErr] = useState('');
  const [published, setPublished] = useState<null | { flagged: boolean }>(null);
  const top = useRef<HTMLDivElement>(null);

  // US-LST-01: restore an autosaved draft.
  useEffect(() => {
    const saved = readJSON<{ d: Draft; step: number } | null>(DRAFT_KEY, null);
    if (saved && (saved.d.type || saved.d.title)) {
      setD({ ...EMPTY, ...saved.d });
      setStep(Math.min(saved.step, 4));
      setRestored(true);
    }
  }, []);
  useEffect(() => {
    if (!published) writeJSON(DRAFT_KEY, { d, step });
  }, [d, step, published]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const isIdea = d.type === OpportunityType.InvestorForIdea;
  const needsEquity = d.type === OpportunityType.Investment || d.type === OpportunityType.InvestorForIdea || d.type === OpportunityType.PartnerSearch;
  const flags = useMemo(() => qualityFlags(d), [d]);

  const validate = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 0 && !d.type) e.type = t('required');
    if (s === 1) {
      const title = d.title.trim();
      if (!title) e.title = t('required');
      else if (title.length < 10) e.title = t('titleShort');
      if (!d.summary.trim()) e.summary = t('required');
      if (!d.categoryId) e.categoryId = t('required');
      if (!d.cityId) e.cityId = t('required');
      if (!d.stage) e.stage = t('required');
    }
    if (s === 2) {
      const p = num(d.price);
      if (!p || p <= 0) e.price = t('priceInvalid');
      const eq = num(d.equity);
      if (needsEquity && (eq === undefined || eq < 1 || eq > 100)) e.equity = t('equityInvalid');
      if (!needsEquity && eq !== undefined && (eq < 1 || eq > 100)) e.equity = t('equityInvalid');
      const m = num(d.margin);
      if (m !== undefined && (m < 0 || m > 100)) e.margin = t('equityInvalid');
    }
    return e;
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }));
  };
  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) {
      const firstKey = Object.keys(e)[0];
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus());
      return;
    }
    go(step + 1);
  };

  const publish = () => {
    if (!agree) {
      setAgreeErr(t('required'));
      return;
    }
    setAgreeErr('');
    requireAuth(() => {
      addListing({
        type: d.type!,
        title: d.title.trim(),
        summary: d.summary.trim(),
        categoryId: d.categoryId as CategoryId,
        cityId: d.cityId as CityId,
        stage: d.stage as OpportunityStage,
        priceSar: num(d.price) ?? 0,
        equityPercent: num(d.equity),
        annualRevenueSar: num(d.revenue),
        profitMargin: num(d.margin) !== undefined ? num(d.margin)! / 100 : undefined,
        branches: isIdea ? undefined : num(d.branches),
        employees: isIdea ? undefined : num(d.employees),
        ndaRequired: d.nda,
        negotiable: d.negotiable,
        photos: d.photos,
        flags,
      });
      writeJSON(DRAFT_KEY, null);
      setPublished({ flagged: flags.length > 0 });
    });
  };

  /** Live card preview (US-LST-05) built from the draft. */
  const preview: Opportunity = {
    id: 0,
    type: d.type ?? OpportunityType.ForSale,
    title: d.title || t('fieldTitle'),
    shortDescription: d.summary,
    description: d.summary,
    priceSar: num(d.price) ?? 0,
    priceNegotiable: d.negotiable,
    equityPercent: num(d.equity),
    cityId: (d.cityId || 'riyadh') as CityId,
    categoryId: (d.categoryId || 'other') as CategoryId,
    stage: (d.stage || 'operating') as OpportunityStage,
    metrics: {
      annualRevenueSar: num(d.revenue),
      profitMargin: num(d.margin) !== undefined ? num(d.margin)! / 100 : undefined,
      branches: isIdea ? undefined : num(d.branches),
      employees: isIdea ? undefined : num(d.employees),
    },
    highlights: [],
    featured: false,
    ndaRequired: d.nda,
    verified: false,
    views: 0,
    inquiries: 0,
    images: [],
    sourceUrl: '',
    createdAt: new Date().toISOString(),
    ownerId: 'me',
  };

  if (published) {
    return (
      <div className="container-read flex flex-col items-center gap-5 pb-32 pt-32 text-center" role="status">
        <motion.span
          initial={reduce ? { opacity: 0 } : { scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 158, damping: 17.6 }}
          className={cn('grid size-24 place-items-center rounded-full', published.flagged ? 'bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-warning' : 'bg-primary-tint text-primary')}
        >
          {published.flagged ? <AlertTriangle size={44} strokeWidth={1.5} aria-hidden /> : <CheckCircle2 size={44} strokeWidth={1.5} aria-hidden />}
        </motion.span>
        <h1 className="t-display-m">{published.flagged ? t('needsFix') : t('publishedTitle')}</h1>
        <p className="max-w-md text-[17px] text-label-2">{t('publishedBody')}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/dashboard/?tab=listings" size="lg">
            {t('goDashboard')}
          </ButtonLink>
          <ButtonLink href="/opportunities/" size="lg" variant="gray">
            {t('findOpportunity')}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const variants = {
    enter: (dd: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: (locale === 'ar' ? -1 : 1) * dd * 32 }),
    center: { opacity: 1, x: 0 },
    exit: (dd: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: (locale === 'ar' ? 1 : -1) * dd * 32 }),
  };

  return (
    <div ref={top} className="container-page scroll-mt-24 pb-32 pt-24 md:pt-32">
      <header className="mb-8 max-w-2xl">
        <h1 className="t-display-m">{t('addTitle')}</h1>
        <p className="mt-3 text-[17px] text-label-2 md:text-[19px]">{t('addLead')}</p>
      </header>

      {restored && step < 4 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg bg-primary-tint px-5 py-3 text-[15px] text-label">
          <span className="font-bold">{t('draftRestored')}</span>
          <Button
            variant="plain"
            size="sm"
            onClick={() => {
              setD(EMPTY);
              setStep(0);
              setRestored(false);
              writeJSON(DRAFT_KEY, null);
            }}
          >
            {t('discardDraft')}
          </Button>
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <Stepper steps={STEP_KEYS.map((k) => t(k))} current={step} label={t('addTitle')} stepWord={t('stepOf')} ofWord={t('of')} onJump={go} />

          <div className="relative mt-10 min-h-[420px]">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.section
                key={step}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 322, damping: 30.5 }}
                aria-labelledby={`step-h-${step}`}
              >
                {step === 0 && (
                  <fieldset>
                    <legend id="step-h-0" className="t-title2 mb-6">
                      {t('chooseType')}
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t('chooseType')}>
                      {TYPE_ORDER.map((ty) => {
                        const Icon = TYPE_META[ty].icon;
                        const active = d.type === ty;
                        return (
                          <button
                            key={ty}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            name="type"
                            onClick={() => set('type', ty)}
                            className={cn(
                              'flex min-h-28 flex-col items-start gap-2 rounded-lg p-5 text-start transition-[box-shadow,background-color] duration-200',
                              active ? 'bg-primary-tint shadow-[0_0_0_2px_var(--color-primary)]' : 'bg-bg-2 hover:bg-fill-3',
                            )}
                          >
                            <Icon size={24} strokeWidth={1.5} aria-hidden className={active ? 'text-primary' : 'text-label-2'} />
                            <span className="t-headline">{typeLabel(ty, locale, false)}</span>
                            <span className="text-[15px] text-label-2">{t(TYPE_META[ty].desc)}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.type && (
                      <p role="alert" className="mt-3 text-[13px] text-danger">
                        {errors.type}
                      </p>
                    )}
                  </fieldset>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-6">
                    <h2 id="step-h-1" className="t-title2">
                      {t('stepBasics')}
                    </h2>
                    <TextField name="title" label={t('fieldTitle')} hint={t('fieldTitleHint')} error={errors.title} value={d.title} maxLength={80} onChange={(e) => set('title', e.target.value)} />
                    <TextArea name="summary" label={t('fieldSummary')} hint={t('fieldSummaryHint')} error={errors.summary} value={d.summary} maxLength={280} rows={3} onChange={(e) => set('summary', e.target.value)} />
                    <div className="grid gap-6 sm:grid-cols-3">
                      <SelectField name="categoryId" label={t('fieldCategory')} error={errors.categoryId} value={d.categoryId} onChange={(e) => set('categoryId', e.target.value as CategoryId)}>
                        <option value="">{t('select')}</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name[locale]}
                          </option>
                        ))}
                      </SelectField>
                      <SelectField name="cityId" label={t('fieldCity')} error={errors.cityId} value={d.cityId} onChange={(e) => set('cityId', e.target.value as CityId)}>
                        <option value="">{t('select')}</option>
                        {cities.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name[locale]}
                          </option>
                        ))}
                      </SelectField>
                      <SelectField name="stage" label={t('fieldStage')} error={errors.stage} value={d.stage} onChange={(e) => set('stage', e.target.value as OpportunityStage)}>
                        <option value="">{t('select')}</option>
                        {(Object.keys(STAGE_KEY) as OpportunityStage[]).map((s) => (
                          <option key={s} value={s}>
                            {t(STAGE_KEY[s])}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-6">
                    <h2 id="step-h-2" className="t-title2">
                      {t('stepFinancials')}
                    </h2>
                    <div>
                      <TextField
                        name="price"
                        label={t('fieldPrice')}
                        error={errors.price}
                        inputMode="numeric"
                        dir="ltr"
                        className="text-start tabular"
                        value={d.price ? Number(digits(d.price)).toLocaleString('en-US') : ''}
                        onChange={(e) => set('price', digits(e.target.value))}
                        hint={num(d.price) ? (locale === 'ar' ? arabicPriceWords(num(d.price)!) : undefined) : undefined}
                      />
                      {d.type === OpportunityType.ForSale && num(d.price)! > 0 && num(d.price)! < 10_000 && (
                        <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-label">
                          <AlertTriangle size={14} aria-hidden className="text-warning" />
                          {t('priceWarnLow')} <bdi className="tabular font-bold">{(num(d.price)! * 1000).toLocaleString('en-US')} {locale === 'ar' ? 'ر.س' : 'SAR'}</bdi>؟
                          <Button variant="plain" size="sm" onClick={() => set('price', String(num(d.price)! * 1000))}>
                            {t('applyFix')}
                          </Button>
                        </p>
                      )}
                    </div>
                    <CheckboxRow checked={d.negotiable} onChange={(v) => set('negotiable', v)}>
                      {t('fieldNegotiable')}
                    </CheckboxRow>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <TextField
                        name="equity"
                        label={t('fieldEquity')}
                        optionalLabel={needsEquity ? undefined : t('optional')}
                        error={errors.equity}
                        inputMode="numeric"
                        dir="ltr"
                        className="text-start tabular"
                        value={d.equity}
                        onChange={(e) => set('equity', digits(e.target.value).slice(0, 3))}
                      />
                      <TextField name="revenue" label={t('fieldRevenue')} optionalLabel={t('optional')} inputMode="numeric" dir="ltr" className="text-start tabular" value={d.revenue ? Number(d.revenue).toLocaleString('en-US') : ''} onChange={(e) => set('revenue', digits(e.target.value))} />
                      <TextField name="margin" label={t('fieldMargin')} optionalLabel={t('optional')} error={errors.margin} inputMode="decimal" dir="ltr" className="text-start tabular" value={d.margin} onChange={(e) => set('margin', digits(e.target.value).slice(0, 5))} />
                      {!isIdea && (
                        <>
                          <TextField name="branches" label={t('fieldBranches')} optionalLabel={t('optional')} inputMode="numeric" dir="ltr" className="text-start tabular" value={d.branches} onChange={(e) => set('branches', digits(e.target.value).slice(0, 4))} />
                          <TextField name="employees" label={t('fieldEmployees')} optionalLabel={t('optional')} inputMode="numeric" dir="ltr" className="text-start tabular" value={d.employees} onChange={(e) => set('employees', digits(e.target.value).slice(0, 5))} />
                        </>
                      )}
                    </div>
                    <CheckboxRow checked={d.nda} onChange={(v) => set('nda', v)}>
                      {t('fieldNda')}
                    </CheckboxRow>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-6">
                    <h2 id="step-h-3" className="t-title2">
                      {t('mediaTitle')}
                    </h2>
                    <p className="text-[17px] text-label-2">{t('mediaBody')}</p>
                    <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-separator bg-bg-2 p-8 text-center hover:bg-fill-3 focus-within:shadow-[0_0_0_3px_var(--color-focus)]">
                      <ImagePlus size={32} strokeWidth={1.5} aria-hidden className="text-primary" />
                      <span className="t-headline text-primary">{t('mediaPick')}</span>
                      <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => set('photos', Math.min(10, e.target.files?.length ?? 0))} />
                      {d.photos > 0 && (
                        <span className="text-[15px] text-label-2">
                          <bdi className="tabular">{d.photos}</bdi> {t('mediaCount')}
                        </span>
                      )}
                    </label>
                    <p className="text-[13px] text-label-2">{t('mediaNote')}</p>
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col gap-8">
                    <h2 id="step-h-4" className="t-title2">
                      {t('reviewTitle')}
                    </h2>
                    <ReviewCard d={d} onEdit={go} />

                    {/* US-ADM-01 quality flags */}
                    <section aria-labelledby="q-h" className={cn('rounded-xl p-5', flags.length ? 'bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]' : 'bg-bg-2')}>
                      <h3 id="q-h" className="t-headline flex items-center gap-2">
                        {flags.length ? <AlertTriangle size={18} aria-hidden className="text-warning" /> : <CheckCircle2 size={18} aria-hidden className="text-success" />}
                        {t('qualityTitle')}
                      </h3>
                      {flags.length ? (
                        <>
                          <ul className="mt-3 list-disc space-y-1 ps-5 text-[15px] text-label">
                            {flags.map((f) => (
                              <li key={f}>{t(f)}</li>
                            ))}
                          </ul>
                          <p className="mt-3 text-[13px] font-bold text-label-2">{t('needsFix')}</p>
                        </>
                      ) : (
                        <p className="mt-2 text-[15px] text-label-2">{t('qualityOk')}</p>
                      )}
                    </section>

                    {/* US-LST-06 commission disclosure at publish (no pledge at sign-up) */}
                    <section className="rounded-xl bg-bg-2 p-5">
                      <p className="text-[15px] leading-relaxed text-label">{t('commissionDisclosure')}</p>
                      <CheckboxRow checked={agree} onChange={(v) => { setAgree(v); if (v) setAgreeErr(''); }} error={agreeErr || undefined}>
                        {t('commissionAgree')}
                      </CheckboxRow>
                    </section>
                  </div>
                )}
              </motion.section>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex gap-3 border-t border-separator/40 pt-6">
            {step > 0 && (
              <Button variant="gray" size="lg" onClick={() => go(step - 1)}>
                {t('back')}
              </Button>
            )}
            {step < 4 ? (
              <Button size="lg" onClick={next} className="min-w-40">
                {t('next')}
              </Button>
            ) : (
              <Button size="lg" onClick={publish} className="min-w-48">
                {flags.length ? t('publishAnyway') : t('publish')}
              </Button>
            )}
          </div>
        </div>

        {/* Live preview (desktop) */}
        <aside className="hidden lg:block" aria-label={t('reviewTitle')}>
          <div className="sticky top-28">
            <p className="mb-3 text-[13px] font-bold text-label-2">{t('reviewTitle')}</p>
            <div className="pointer-events-none" aria-hidden inert>
              <OpportunityCard o={preview} preview />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReviewCard({ d, onEdit }: { d: Draft; onEdit: (step: number) => void }) {
  const { t, locale } = useApp();
  const row = (label: string, value: string | undefined) => (
    <div className="flex justify-between gap-4 py-2 text-[15px]">
      <dt className="text-label-2">{label}</dt>
      <dd className="text-end font-medium tabular">
        <bdi>{value || '—'}</bdi>
      </dd>
    </div>
  );
  const section = (title: string, step: number, children: React.ReactNode) => (
    <div className="py-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="t-headline">{title}</h3>
        <Button variant="plain" size="sm" onClick={() => onEdit(step)}>
          {t('edit')}
        </Button>
      </div>
      <dl className="divide-y divide-separator/30">{children}</dl>
    </div>
  );
  const sar = (s: string) => (s ? (locale === 'ar' ? `${Number(s).toLocaleString('en-US')} ر.س` : `SAR ${Number(s).toLocaleString('en-US')}`) : undefined);
  return (
    <div className="divide-y divide-separator/40 rounded-xl px-5 ring-1 ring-separator/40">
      {section(t('stepType'), 0, row(t('typeName'), d.type ? typeLabel(d.type, locale, false) : undefined))}
      {section(
        t('stepBasics'),
        1,
        <>
          {row(t('fieldTitle'), d.title)}
          {row(t('fieldCategory'), categories.find((c) => c.id === d.categoryId)?.name[locale])}
          {row(t('fieldCity'), cities.find((c) => c.id === d.cityId)?.name[locale])}
          {row(t('fieldStage'), d.stage ? t(STAGE_KEY[d.stage]) : undefined)}
        </>,
      )}
      {section(
        t('stepFinancials'),
        2,
        <>
          {row(t('fieldPrice'), sar(d.price))}
          {row(t('fieldEquity'), d.equity ? `${d.equity}%` : undefined)}
          {row(t('fieldRevenue'), sar(d.revenue))}
          {row(t('fieldMargin'), d.margin ? `${d.margin}%` : undefined)}
          {row(t('ndaRequired'), d.nda ? '✓' : '—')}
        </>,
      )}
      {section(t('stepMedia'), 3, row(t('mediaCount'), String(d.photos)))}
    </div>
  );
}
