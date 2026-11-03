'use client';

import { OpportunityType } from '@forsa/data';
import { useApp } from '@/lib/store';
import { CheckboxRow, SelectField, TextArea, TextField } from '@/components/ui/TextField';
import type { DictKey } from '@/lib/i18n';
import type { Draft } from './AddWizard';

const digits = (s: string) => s.replace(/[^\d.]/g, '');
const money = (s: string) => (s ? Number(digits(s)).toLocaleString('en-US') : '');

type SetFn = <K extends keyof Draft>(k: K, v: Draft[K]) => void;

/**
 * US-LST-02: questions that fit the opportunity type, shown on the "الأرقام" step.
 * - للبيع: reason for sale, revenue, margin, branches, employees, lease
 * - استثمارية: use of funds, equity offered, expected payback, expected ROI
 * - البحث عن شريك: role sought, what I bring, proposed split, commitment
 * - مستثمر لفكرة: team size, traction / MVP, amount sought (price), equity — no area, branch or employee fields
 */
export function TypeFields({ d, set, errors }: { d: Draft; set: SetFn; errors: Record<string, string> }) {
  const { t } = useApp();
  const num = (name: keyof Draft, label: DictKey, opts: { optional?: boolean; money?: boolean; max?: number; inputMode?: 'numeric' | 'decimal' } = {}) => (
    <TextField
      name={name}
      label={t(label)}
      optionalLabel={opts.optional ? t('optional') : undefined}
      error={errors[name]}
      inputMode={opts.inputMode ?? 'numeric'}
      dir="ltr"
      className="text-start tabular"
      value={opts.money ? money(d[name] as string) : (d[name] as string)}
      onChange={(e) => set(name, digits(e.target.value).slice(0, opts.max ?? 12) as Draft[typeof name])}
    />
  );

  if (d.type === OpportunityType.ForSale) {
    return (
      <div className="grid gap-6">
        <SelectField name="saleReason" label={t('fieldSaleReason')} error={errors.saleReason} value={d.saleReason} onChange={(e) => set('saleReason', e.target.value)}>
          <option value="">{t('select')}</option>
          {(['reasonRelocation', 'reasonFocus', 'reasonRetire', 'reasonPartners', 'reasonOther'] as const).map((k) => (
            <option key={k} value={k}>
              {t(k)}
            </option>
          ))}
        </SelectField>
        <div className="grid gap-6 sm:grid-cols-2">
          {num('revenue', 'fieldRevenue', { money: true })}
          {num('margin', 'fieldMargin', { optional: true, inputMode: 'decimal', max: 5 })}
          {num('branches', 'fieldBranches', { optional: true, max: 4 })}
          {num('employees', 'fieldEmployees', { optional: true, max: 5 })}
          {num('equity', 'fieldEquitySale', { optional: true, max: 3 })}
          {num('leaseYears', 'fieldLeaseYears', { optional: true, max: 2 })}
        </div>
      </div>
    );
  }

  if (d.type === OpportunityType.Investment) {
    return (
      <div className="grid gap-6">
        <TextArea name="useOfFunds" label={t('fieldUseOfFunds')} hint={t('fieldUseOfFundsHint')} error={errors.useOfFunds} rows={3} value={d.useOfFunds} onChange={(e) => set('useOfFunds', e.target.value)} />
        <div className="grid gap-6 sm:grid-cols-2">
          {num('equity', 'fieldEquity', { max: 3 })}
          {num('payback', 'fieldPayback', { optional: true, max: 3 })}
          {num('roi', 'fieldRoi', { optional: true, inputMode: 'decimal', max: 5 })}
          {num('revenue', 'fieldRevenue', { optional: true, money: true })}
        </div>
      </div>
    );
  }

  if (d.type === OpportunityType.PartnerSearch) {
    return (
      <div className="grid gap-6">
        <SelectField name="roleSought" label={t('fieldRoleSought')} error={errors.roleSought} value={d.roleSought} onChange={(e) => set('roleSought', e.target.value)}>
          <option value="">{t('select')}</option>
          {(['roleFunding', 'roleOperating', 'roleStrategic', 'roleTechnical'] as const).map((k) => (
            <option key={k} value={k}>
              {t(k)}
            </option>
          ))}
        </SelectField>
        <TextArea name="contribution" label={t('fieldContribution')} hint={t('fieldContributionHint')} error={errors.contribution} rows={3} value={d.contribution} onChange={(e) => set('contribution', e.target.value)} />
        <div className="grid gap-6 sm:grid-cols-2">
          {num('equity', 'fieldSplit', { max: 3 })}
          <SelectField name="commitment" label={t('fieldCommitment')} optionalLabel={t('optional')} value={d.commitment} onChange={(e) => set('commitment', e.target.value)}>
            <option value="">{t('select')}</option>
            {(['commitFull', 'commitPart', 'commitCapital'] as const).map((k) => (
              <option key={k} value={k}>
                {t(k)}
              </option>
            ))}
          </SelectField>
        </div>
      </div>
    );
  }

  if (d.type === OpportunityType.InvestorForIdea) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {num('equity', 'fieldEquity', { max: 3 })}
          {num('teamSize', 'fieldTeamSize', { max: 3 })}
        </div>
        <TextArea name="traction" label={t('fieldTraction')} hint={t('fieldTractionHint')} optionalLabel={t('optional')} rows={3} value={d.traction} onChange={(e) => set('traction', e.target.value)} />
        <CheckboxRow checked={d.hasMvp} onChange={(v) => set('hasMvp', v)}>
          {t('fieldHasMvp')}
        </CheckboxRow>
      </div>
    );
  }
  return null;
}

/** Per-type validation for the numbers step. */
export function validateTypeFields(d: Draft, t: (k: DictKey) => string): Record<string, string> {
  const e: Record<string, string> = {};
  const n = (s: string) => (s ? Number(s) : undefined);
  const eq = n(d.equity);
  const needsEquity = d.type !== OpportunityType.ForSale;
  if (needsEquity && (eq === undefined || eq < 1 || eq > 100)) e.equity = t('equityInvalid');
  if (!needsEquity && eq !== undefined && (eq < 1 || eq > 100)) e.equity = t('equityInvalid');
  const m = n(d.margin);
  if (m !== undefined && (m < 0 || m > 100)) e.margin = t('marginInvalid');
  if (d.type === OpportunityType.ForSale) {
    if (!d.saleReason) e.saleReason = t('required');
    if (!n(d.revenue)) e.revenue = t('priceInvalid');
  }
  if (d.type === OpportunityType.Investment && d.useOfFunds.trim().length < 10) e.useOfFunds = t('required');
  if (d.type === OpportunityType.PartnerSearch) {
    if (!d.roleSought) e.roleSought = t('required');
    if (d.contribution.trim().length < 10) e.contribution = t('required');
  }
  if (d.type === OpportunityType.InvestorForIdea && !n(d.teamSize)) e.teamSize = t('required');
  return e;
}
