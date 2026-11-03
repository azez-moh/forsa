import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  inquiries as seedInquiries,
  OpportunityType,
  users,
  type CategoryId,
  type CityId,
  type InquiryStatus,
  type OpportunityStage,
} from '@forsa/data';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Client-side mock state (no backend). Persisted to AsyncStorage.
 * Demo identity: the signed-in user owns the day-care listing (#1124, owner u-seller-06),
 * so the owner pipeline in Inbox and the "إدارة الفرصة" CTA can be demoed alongside the investor flow.
 */
export const DEMO_OWNER_ID = 'u-seller-06';

export type Role = 'investor' | 'owner' | 'entrepreneur' | 'partner' | 'provider';
export type Session = { name: string; phone: string; roles: Role[]; via: 'otp' | 'nafath'; since: string };

export type Message = { id: string; from: 'me' | 'them'; text: string; at: string };

/** Inquiry the user SENT as an investor. */
export type SentInquiry = {
  id: string;
  opportunityId: number;
  message: string;
  budget?: string;
  timeline?: string;
  investorType?: string;
  status: InquiryStatus;
  ndaSignedAt?: string;
  ndaSignedName?: string;
  /** Owner approved document access (US-DASH-03). */
  docsApproved: boolean;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

/** Inquiry RECEIVED on one of the user's listings (owner pipeline). */
export type IncomingInquiry = {
  id: string;
  opportunityId: number;
  fromName: string;
  fromVerified: boolean;
  investorType: string;
  budgetSar?: number;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  dealValueSar?: number;
  unread: boolean;
};

export type MyListing = {
  id: number;
  type: OpportunityType;
  title: string;
  /** Everything else entered in the wizard (description, metrics, type-specific fields). */
  details?: Record<string, string | number | boolean>;
  priceSar: number;
  cityId: CityId;
  categoryId: CategoryId;
  status: 'review' | 'published';
  views: number;
  saves: number;
  inquiries: number;
  createdAt: string;
  /** Present when the listing comes from @forsa/data (pre-existing). */
  seeded?: boolean;
};

export type ServiceRequest = { id: string; serviceId: number; notes: string; createdAt: string };
export type Booking = { id: string; consultantId: number; day: string; time: string; createdAt: string };

export type ListingDraft = {
  step: number;
  type?: OpportunityType;
  title: string;
  description: string;
  categoryId?: CategoryId;
  cityId?: CityId;
  stage?: OpportunityStage;
  extra1: string;
  extra2: string;
  /** Type-specific: payback months (investment), split + commitment (partner). */
  extra3: string;
  extra4: string;
  branches: string;
  employees: string;
  price: string;
  negotiable: boolean;
  equity: string;
  margin: string;
  revenue: string;
  photos: number[];
  cover: number;
  ndaRequired: boolean;
  files: string[];
  updatedAt: string;
};

export const emptyDraft = (): ListingDraft => ({
  step: 0,
  title: '',
  description: '',
  extra1: '',
  extra2: '',
  extra3: '',
  extra4: '',
  branches: '',
  employees: '',
  price: '',
  negotiable: false,
  equity: '',
  margin: '',
  revenue: '',
  photos: [],
  cover: 0,
  ndaRequired: true,
  files: [],
  updatedAt: new Date().toISOString(),
});

const nameOf = (id: string) => users.find((u) => u.id === id);
const investorTypeOf = (id: string) => (nameOf(id)?.role === 'company' ? 'شركة' : 'مستثمر ملائكي');

/**
 * Seed for the owner pipeline: inquiries on the demo owner's listing (#1124). The first one is the
 * real mock inquiry from @forsa/data addressed to u-seller-06; the rest are written for the demo so
 * every pipeline stage has content. Investor names come from the fictional users in @forsa/data.
 */
const seedIncoming = (): IncomingInquiry[] => {
  const fromData: IncomingInquiry[] = seedInquiries
    .filter((q) => q.toUserId === DEMO_OWNER_ID)
    .map((q) => ({
      id: q.id,
      opportunityId: q.opportunityId,
      fromName: nameOf(q.fromUserId)?.displayName ?? 'مستثمر',
      fromVerified: nameOf(q.fromUserId)?.verified ?? false,
      investorType: investorTypeOf(q.fromUserId),
      budgetSar: q.investmentBudgetSar,
      message: q.message,
      status: q.status,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      unread: false,
    }));
  const extra: IncomingInquiry[] = [
    { id: 'inc-101', opportunityId: 1124, fromName: nameOf('u-investor-01')?.displayName ?? 'مستثمرة', fromVerified: true, investorType: 'مستثمر ملائكي', budgetSar: 1_200_000, message: 'هل الترخيص ساري لمدة سنتين على الأقل؟ وما متوسط عدد الأطفال شهريًا؟', status: 'new', createdAt: '2026-11-02T20:10:00+03:00', updatedAt: '2026-11-02T20:10:00+03:00', unread: true },
    { id: 'inc-102', opportunityId: 1124, fromName: nameOf('u-investor-03')?.displayName ?? 'مستثمر', fromVerified: false, investorType: 'مستثمر ملائكي', budgetSar: 900_000, message: 'مهتم بشراكة تشغيلية مع حصة 40%، هل هذا ممكن؟', status: 'new', createdAt: '2026-11-03T08:30:00+03:00', updatedAt: '2026-11-03T08:30:00+03:00', unread: true },
    { id: 'inc-103', opportunityId: 1124, fromName: nameOf('u-company-01')?.displayName ?? 'شركة', fromVerified: true, investorType: 'شركة', budgetSar: 2_000_000, message: 'نرغب في زيارة الموقع الأسبوع القادم ومراجعة العقود مع الموظفين.', status: 'meeting', createdAt: '2026-09-20T11:00:00+03:00', updatedAt: '2026-10-01T15:00:00+03:00', unread: false },
    { id: 'inc-104', opportunityId: 1124, fromName: 'صندوق نماء للاستثمار (تجريبي)', fromVerified: true, investorType: 'صندوق', budgetSar: 1_500_000, message: 'أرسلوا لنا نموذج الإيرادات لآخر 12 شهرًا.', status: 'in-discussion', createdAt: '2026-10-10T09:00:00+03:00', updatedAt: '2026-10-20T13:00:00+03:00', unread: false },
    { id: 'inc-105', opportunityId: 1124, fromName: nameOf('u-investor-02')?.displayName ?? 'شركة', fromVerified: true, investorType: 'شركة', budgetSar: 600_000, message: 'نبحث عن حصة أقلية فقط.', status: 'closed-lost', createdAt: '2026-08-01T10:00:00+03:00', updatedAt: '2026-08-05T10:00:00+03:00', unread: false },
  ];
  return [...extra, ...fromData];
};

const seedListings = (): MyListing[] => [
  {
    id: 1124,
    type: OpportunityType.Investment,
    title: 'فرصة استحواذ استثمارية كبرى: مركز رعاية نهارية قائم ومجهّز بالكامل',
    priceSar: 1_500_000,
    cityId: 'riyadh',
    categoryId: 'medical',
    status: 'published',
    views: 5200,
    saves: 61,
    inquiries: 18,
    createdAt: '2026-06-08T10:00:00+03:00',
    seeded: true,
  },
];

type State = {
  hydrated: boolean;
  lang: 'ar' | 'en';
  session: Session | null;
  saved: number[];
  savedSearches: string[];
  sent: SentInquiry[];
  incoming: IncomingInquiry[];
  myListings: MyListing[];
  serviceRequests: ServiceRequest[];
  bookings: Booking[];
  draft: ListingDraft | null;
  /** Bumps when a listing is published; Profile uses it to play the fly-in animation once. */
  lastPublishedId: number | null;
  /** Guard for the one-time direction reload at launch (never loops). */
  rtlBootReloads: number;
  /** US-IOS-05: the pre-permission explainer has been shown once. */
  notifAsked: boolean;

  setLang: (l: 'ar' | 'en') => void;
  signIn: (s: Omit<Session, 'since'>) => void;
  signOut: () => void;
  toggleSave: (id: number) => boolean;
  saveSearch: (label: string) => void;
  sendInquiry: (q: Omit<SentInquiry, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'docsApproved'>) => SentInquiry;
  approveDocs: (inquiryId: string) => void;
  sendMessage: (inquiryId: string, text: string) => void;
  setIncomingStatus: (id: string, status: InquiryStatus, dealValueSar?: number) => void;
  markIncomingRead: (id: string) => void;
  saveDraft: (d: Partial<ListingDraft>) => void;
  clearDraft: () => void;
  publish: (l: Omit<MyListing, 'id' | 'status' | 'views' | 'saves' | 'inquiries' | 'createdAt'>) => number;
  markPublished: (id: number) => void;
  consumePublished: () => void;
  requestService: (serviceId: number, notes: string) => void;
  book: (consultantId: number, day: string, time: string) => void;
};

/** No-op storage used only while pre-rendering the web preview in Node. */
const ssrStorage = { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} };

const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      lang: 'ar',
      session: null,
      saved: [931],
      savedSearches: [],
      sent: [],
      incoming: seedIncoming(),
      myListings: seedListings(),
      serviceRequests: [],
      bookings: [],
      draft: null,
      lastPublishedId: null,
      rtlBootReloads: 0,
      notifAsked: false,

      setLang: (lang) => set({ lang }),
      signIn: (s) => set({ session: { ...s, since: now() } }),
      signOut: () => set({ session: null }),
      toggleSave: (id) => {
        const has = get().saved.includes(id);
        set({ saved: has ? get().saved.filter((x) => x !== id) : [id, ...get().saved] });
        return !has;
      },
      saveSearch: (label) => set({ savedSearches: [label, ...get().savedSearches.filter((x) => x !== label)].slice(0, 10) }),
      sendInquiry: (q) => {
        const created: SentInquiry = {
          ...q,
          id: uid('my-inq'),
          docsApproved: false,
          createdAt: now(),
          updatedAt: now(),
          messages: [{ id: uid('m'), from: 'me', text: q.message, at: now() }],
        };
        set({ sent: [created, ...get().sent.filter((x) => x.opportunityId !== q.opportunityId)] });
        return created;
      },
      approveDocs: (inquiryId) =>
        set({
          sent: get().sent.map((x) =>
            x.id === inquiryId ? { ...x, docsApproved: true, status: 'in-discussion', updatedAt: now() } : x,
          ),
        }),
      sendMessage: (inquiryId, text) => {
        const msg: Message = { id: uid('m'), from: 'me', text, at: now() };
        set({
          sent: get().sent.map((x) => (x.id === inquiryId ? { ...x, messages: [...x.messages, msg], updatedAt: now() } : x)),
        });
      },
      setIncomingStatus: (id, status, dealValueSar) =>
        set({
          incoming: get().incoming.map((x) =>
            x.id === id ? { ...x, status, dealValueSar: dealValueSar ?? x.dealValueSar, updatedAt: now(), unread: false } : x,
          ),
        }),
      markIncomingRead: (id) => set({ incoming: get().incoming.map((x) => (x.id === id ? { ...x, unread: false } : x)) }),
      saveDraft: (d) => set({ draft: { ...(get().draft ?? emptyDraft()), ...d, updatedAt: now() } }),
      clearDraft: () => set({ draft: null }),
      publish: (l) => {
        const id = Math.floor(Date.now() / 1000);
        const listing: MyListing = { ...l, id, status: 'review', views: 0, saves: 0, inquiries: 0, createdAt: now() };
        set({ myListings: [listing, ...get().myListings], draft: null, lastPublishedId: id });
        return id;
      },
      markPublished: (id) =>
        set({ myListings: get().myListings.map((x) => (x.id === id ? { ...x, status: 'published' } : x)) }),
      consumePublished: () => set({ lastPublishedId: null }),
      requestService: (serviceId, notes) =>
        set({ serviceRequests: [{ id: uid('sr'), serviceId, notes, createdAt: now() }, ...get().serviceRequests] }),
      book: (consultantId, day, time) =>
        set({ bookings: [{ id: uid('bk'), consultantId, day, time, createdAt: now() }, ...get().bookings] }),
    }),
    {
      name: 'forsa-ios-v1',
      version: 2,
      // v1 sessions had a single `role`; v2 has `roles` (multi-select, US-AUTH-04).
      migrate: (persisted, version) => {
        const st = persisted as { session?: (Partial<Session> & { role?: Role }) | null };
        if (version < 2 && st.session && !st.session.roles) {
          st.session = { ...st.session, roles: st.session.role ? [st.session.role] : ['investor'] } as Session;
        }
        return st as unknown as State;
      },
      // Static web rendering runs in Node without `window`; skip persistence there.
      storage: createJSONStorage(() => (typeof window === 'undefined' ? ssrStorage : AsyncStorage)),
      partialize: ({ hydrated: _h, lastPublishedId: _p, ...rest }) => rest,
      onRehydrateStorage: () => () => {
        useApp.setState({ hydrated: true });
      },
    },
  ),
);

/** Is the demo user the owner of this listing? */
export const isOwnListing = (ownerId: string, id: number, mine: MyListing[]) =>
  ownerId === DEMO_OWNER_ID || mine.some((m) => m.id === id);
