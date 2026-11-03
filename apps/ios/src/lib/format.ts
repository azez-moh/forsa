import {
  getCategory,
  getCity,
  OPPORTUNITY_TYPE_LABELS,
  OpportunityType,
  type CityId,
  type CategoryId,
  type InquiryStatus,
  type OpportunityStage,
} from '@forsa/data';
import { formatSAR, opportunityTypes } from '@forsa/tokens';

import type { Lang, StringKey } from '@/i18n';

export const sar = (v: number, lang: Lang) => formatSAR(v, lang);

/** Full number with thousands separators, Western digits, e.g. "1,500,000 ر.س". */
export const sarFull = (v: number, lang: Lang) =>
  lang === 'ar' ? `${Math.round(v).toLocaleString('en-US')} ر.س` : `SAR ${Math.round(v).toLocaleString('en-US')}`;

export const num = (v: number) => Math.round(v).toLocaleString('en-US');

export const cityName = (id: CityId, lang: Lang) => getCity(id)?.name[lang] ?? id;
export const categoryName = (id: CategoryId, lang: Lang) => getCategory(id)?.name[lang] ?? id;

/** Short type label with the editorial spelling fix ("استثمارية", not "إستثمارية"). */
export const typeShort = (type: OpportunityType, lang: Lang) => OPPORTUNITY_TYPE_LABELS[type].short[lang];
export const typeLong = (type: OpportunityType, lang: Lang) =>
  lang === 'ar' ? OPPORTUNITY_TYPE_LABELS[type].ar.replace('إستثمارية', 'استثمارية') : OPPORTUNITY_TYPE_LABELS[type].en;

const typeColorById: Record<OpportunityType, string> = {
  [OpportunityType.ForSale]: opportunityTypes.sale.color,
  [OpportunityType.Investment]: opportunityTypes.investment.color,
  [OpportunityType.PartnerSearch]: opportunityTypes.partner.color,
  [OpportunityType.InvestorForIdea]: opportunityTypes.investor.color,
};
export const typeColor = (type: OpportunityType) => typeColorById[type];

export const TYPE_ORDER: OpportunityType[] = [
  OpportunityType.ForSale,
  OpportunityType.Investment,
  OpportunityType.PartnerSearch,
  OpportunityType.InvestorForIdea,
];

export const typeSymbol: Record<OpportunityType, string> = {
  [OpportunityType.ForSale]: 'storefront',
  [OpportunityType.Investment]: 'chart.line.uptrend.xyaxis',
  [OpportunityType.PartnerSearch]: 'person.2',
  [OpportunityType.InvestorForIdea]: 'lightbulb',
};

export const stageLabel: Record<OpportunityStage, { ar: string; en: string }> = {
  idea: { ar: 'فكرة', en: 'Idea' },
  early: { ar: 'مرحلة مبكرة', en: 'Early' },
  operating: { ar: 'قائم', en: 'Operating' },
  established: { ar: 'راسخ', en: 'Established' },
};

export const statusKey: Record<InquiryStatus, StringKey> = {
  new: 'stNew',
  'nda-sent': 'stNdaSent',
  'nda-signed': 'stNdaSigned',
  'in-discussion': 'stDiscussion',
  meeting: 'stMeeting',
  'closed-won': 'stWon',
  'closed-lost': 'stLost',
};

/** Pipeline segments on iPhone (US-DASH-02). */
export const PIPELINE: { key: StringKey; statuses: InquiryStatus[] }[] = [
  { key: 'pNew', statuses: ['new'] },
  { key: 'pNda', statuses: ['nda-sent', 'nda-signed'] },
  { key: 'pDiscussion', statuses: ['in-discussion'] },
  { key: 'pMeeting', statuses: ['meeting'] },
  { key: 'pClosed', statuses: ['closed-won', 'closed-lost'] },
];

export const daysSince = (iso: string, now = Date.now()) =>
  Math.max(0, Math.floor((now - new Date(iso).getTime()) / 86_400_000));

export const relativeTime = (iso: string, lang: Lang) => {
  const d = daysSince(iso);
  if (d === 0) return lang === 'ar' ? 'اليوم' : 'today';
  if (lang === 'ar') return d === 1 ? 'أمس' : `قبل ${d} يوم`;
  return d === 1 ? 'yesterday' : `${d}d ago`;
};

const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const hundreds = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة'];

function below1000(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h) parts.push(hundreds[h]);
  if (r >= 10 && r < 20) parts.push(teens[r - 10]);
  else if (r) {
    const o = r % 10;
    const t = Math.floor(r / 10);
    if (o && t) parts.push(`${ones[o]} و${tens[t]}`);
    else if (o) parts.push(ones[o]);
    else parts.push(tens[t]);
  }
  return parts.join(' و');
}

function scale(n: number, one: string, two: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${below1000(n)} ${few}`;
  return `${below1000(n)} ${many}`;
}

/** Price in Arabic words, e.g. 1,500,000 → "مليون وخمسمئة ألف ريال" (US-OPP-02). */
export function priceInWords(value: number): string {
  let n = Math.floor(value);
  if (n <= 0) return '';
  const parts: string[] = [];
  const b = Math.floor(n / 1e9);
  n %= 1e9;
  const m = Math.floor(n / 1e6);
  n %= 1e6;
  const k = Math.floor(n / 1e3);
  const r = n % 1e3;
  if (b) parts.push(scale(b, 'مليار', 'ملياران', 'مليارات', 'مليار'));
  if (m) parts.push(scale(m, 'مليون', 'مليونان', 'ملايين', 'مليون'));
  if (k) parts.push(scale(k, 'ألف', 'ألفان', 'آلاف', 'ألف'));
  if (r) parts.push(below1000(r));
  return `${parts.join(' و')} ريال`;
}

export const toLatinDigits = (s: string) =>
  s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

export const parseAmount = (s: string) => {
  const n = Number(toLatinDigits(s).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
