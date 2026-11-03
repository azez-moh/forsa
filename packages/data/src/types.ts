/**
 * @forsa/data — domain types for the Forsa w Tamkeen (فرصة وتمكين) redesign concept.
 * Data is DUMMY/mock, seeded from public content on https://forsh.sa (captured 2026-11-03).
 */

export type ISODate = string;
export type Localized = { ar: string; en: string };

/** Opportunity type ids match the live site's `?type=` query param. */
export enum OpportunityType {
  ForSale = 1,
  Investment = 2,
  PartnerSearch = 5,
  InvestorForIdea = 6,
}

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, Localized & { short: Localized; slug: string }> = {
  [OpportunityType.ForSale]: {
    ar: 'فرص للبيع',
    en: 'Businesses for sale',
    short: { ar: 'للبيع', en: 'For sale' },
    slug: 'for-sale',
  },
  [OpportunityType.Investment]: {
    ar: 'فرص إستثمارية',
    en: 'Investment opportunities',
    short: { ar: 'استثمارية', en: 'Investment' },
    slug: 'investment',
  },
  [OpportunityType.PartnerSearch]: {
    ar: 'فرص البحث عن شريك',
    en: 'Seeking a partner',
    short: { ar: 'البحث عن شريك', en: 'Partner search' },
    slug: 'partner',
  },
  [OpportunityType.InvestorForIdea]: {
    ar: 'البحث عن مستثمر لفكرة أو مشروع',
    en: 'Seeking an investor for an idea or project',
    short: { ar: 'مستثمر لفكرة', en: 'Investor for idea' },
    slug: 'investor-for-idea',
  },
};

export type CategoryId =
  | 'commercial'
  | 'food'
  | 'tech'
  | 'industrial'
  | 'services'
  | 'medical'
  | 'education'
  | 'sports'
  | 'logistics'
  | 'other';

export interface Category {
  id: CategoryId;
  name: Localized;
  /** Suggested icon key (lucide-style) for the redesign. */
  icon: string;
}

export type CityId =
  | 'riyadh' | 'jeddah' | 'makkah' | 'dammam' | 'madinah' | 'qassim' | 'abha'
  | 'tabuk' | 'hail' | 'arar' | 'jazan' | 'najran' | 'sakaka' | 'albaha'
  | 'taif' | 'khobar' | 'ahsa';

export interface City {
  id: CityId;
  name: Localized;
  region: Localized;
  lat: number;
  lng: number;
}

/** Stage of the business, used for the redesigned filters (not on the live site). */
export type OpportunityStage = 'idea' | 'early' | 'operating' | 'established';

export interface OpportunityMetrics {
  unitAreaSqm?: number;
  projectAgeYears?: number;
  branches?: number;
  employees?: number;
  annualRevenueSar?: number;
  /** Net margin as a fraction (0.21 = 21%). */
  profitMargin?: number;
  monthlyNetProfitSar?: number;
  paybackMonths?: number;
}

export interface Opportunity {
  id: number;
  type: OpportunityType;
  title: string;
  /** One-to-two line summary for cards. */
  shortDescription: string;
  /** Condensed description (<= ~600 chars). */
  description: string;
  /** Asking price / required investment in SAR. */
  priceSar: number;
  /** Optional upper bound when the listing states a range. */
  priceMaxSar?: number;
  priceNegotiable: boolean;
  /** Equity offered, 0–100. Undefined when not stated. */
  equityPercent?: number;
  cityId: CityId;
  address?: string;
  categoryId: CategoryId;
  stage: OpportunityStage;
  metrics: OpportunityMetrics;
  highlights: string[];
  featured: boolean;
  /** Listing says details are shared only after an NDA. */
  ndaRequired: boolean;
  /** Mock: platform verified docs (CR, licence). Not a live-site feature. */
  verified: boolean;
  views: number;
  /** Count of inquiries received (mock). */
  inquiries: number;
  images: string[];
  sourceUrl: string;
  createdAt: ISODate;
  ownerId: string;
  /** True where values were filled in for the mock (not from the live page). */
  mockFilled?: string[];
}

export type ServiceCategoryId = 'legal' | 'business' | 'design-marketing' | 'finance-advisory';

export interface ServiceCategory {
  id: ServiceCategoryId;
  name: Localized;
}

export interface ServiceProvider {
  id: string;
  name: string;
  cityId?: CityId;
  certified: boolean;
  completedOrders: number;
  kind: 'platform' | 'law-firm' | 'audit-firm' | 'research-center' | 'agency';
  logo?: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  categoryId: ServiceCategoryId;
  providerId: string;
  priceSar: number;
  /** Struck-through original price where the live site shows a discount. */
  originalPriceSar?: number;
  /** Free-text duration as shown on the site. */
  duration?: string;
  deliverables?: string[];
  requirements?: string[];
  audience?: string[];
  language?: string;
  disclaimer?: string;
  sourceUrl: string;
}

export interface Consultant {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  yearsExperience: number;
  tags: string[];
  rating: number;
  reviews: number;
  sessions: number;
  feeSar: number;
  cityId: CityId;
  languages: string[];
  availability: string;
  certified: boolean;
  /** No photos on the live site (initial-letter avatars). */
  avatar?: string;
  placeholder: boolean;
  sourceUrl: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  headings: string[];
  publishedAt: ISODate;
  views: number;
  image?: string;
  readingMinutes: number;
  relatedTypes?: OpportunityType[];
  sourceUrl?: string;
}

export type VideoCategoryId = 'founding' | 'investor';

export interface VideoCategory {
  id: VideoCategoryId;
  name: string;
  audience: 'entrepreneur' | 'entrepreneur-investor';
  description: string;
}

export interface Video {
  id: string;
  title: string;
  categoryId: VideoCategoryId;
  youtubeId: string;
  thumbnail: string;
  views: number;
  /** Unlabelled second counter on the live site (likely likes). */
  likes: number;
  durationSec?: number;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  group: 'general' | 'listing' | 'fees' | 'support' | 'trust';
  /** True when the answer is written for the mock (live page shows no answers). */
  answerIsMock: boolean;
}

export interface PlatformStats {
  asOf: ISODate;
  users: number;
  opportunities: number;
  investmentOpportunities: number;
  forSaleOpportunities: number;
  serviceRequests: number;
  totalValueSar: number;
  totalViews: number;
  consultants: number;
  commissionPercent: number;
  launchedAt: ISODate;
}

export type UserRole =
  | 'entrepreneur'
  | 'idea-owner'
  | 'seller'
  | 'investor'
  | 'company'
  | 'service-provider'
  | 'consultant'
  | 'admin';

export interface User {
  id: string;
  displayName: string;
  role: UserRole;
  cityId: CityId;
  verified: boolean;
  joinedAt: ISODate;
  avatar?: string;
  /** Always true here: all users are fictional. */
  mock: true;
}

export type InquiryStatus = 'new' | 'nda-sent' | 'nda-signed' | 'in-discussion' | 'meeting' | 'closed-won' | 'closed-lost';

export interface Inquiry {
  id: string;
  opportunityId: number;
  fromUserId: string;
  toUserId: string;
  message: string;
  investmentBudgetSar?: number;
  status: InquiryStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
}
