import { OpportunityType, cities, OPPORTUNITY_TYPE_LABELS } from '@forsa/data';
import type { DictKey } from '@/lib/i18n';
import type { Draft } from './AddWizard';

/** US-ADM-01 client-side quality rules, run at the review step. Returns dictionary keys of flags. */
export function qualityFlags(d: Draft): DictKey[] {
  const flags: DictKey[] = [];
  const title = d.title.trim();
  const typeNames = d.type ? [OPPORTUNITY_TYPE_LABELS[d.type].ar, OPPORTUNITY_TYPE_LABELS[d.type].short.ar] : [];
  const cityNames = cities.flatMap((c) => [c.name.ar, c.name.en]);
  if ([...typeNames, ...cityNames].some((n) => n === title)) flags.push('flagTitleGeneric');
  if (d.type === OpportunityType.ForSale && Number(d.price) > 0 && Number(d.price) < 10_000) flags.push('flagPriceLow');
  if (d.summary.trim().length < 80) flags.push('flagSummaryShort');
  if (d.type === OpportunityType.ForSale && !d.margin && !d.employees) flags.push('flagNoMetrics');
  if (d.type === OpportunityType.Investment && !d.payback && !d.roi) flags.push('flagNoMetrics');
  if (d.type === OpportunityType.InvestorForIdea && !d.traction.trim() && !d.hasMvp) flags.push('flagNoTraction');
  return flags;
}
