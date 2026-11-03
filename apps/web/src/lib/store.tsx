'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { inquiries as seedInquiries, type InquiryStatus, type OpportunityType, type CategoryId, type CityId, type OpportunityStage } from '@forsa/data';
import { dictionaries, type DictKey, type Locale } from './i18n';
import { readJSON, writeJSON } from './storage';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type Theme = 'system' | 'light' | 'dark';

export interface SessionUser {
  name: string;
  phone: string;
  verified: boolean;
  role: 'buyer' | 'seller' | 'both';
  joinedAt: string;
}

/** An inquiry in the demo pipeline. `direction` = sent by me, or received on my listing. */
export interface PipelineInquiry {
  id: string;
  opportunityId: number;
  direction: 'sent' | 'received';
  counterpart: string;
  message: string;
  budgetSar?: number;
  status: InquiryStatus;
  signedName?: string;
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyListing {
  id: string;
  type: OpportunityType;
  title: string;
  summary: string;
  categoryId: CategoryId;
  cityId: CityId;
  stage: OpportunityStage;
  priceSar: number;
  equityPercent?: number;
  annualRevenueSar?: number;
  profitMargin?: number;
  branches?: number;
  employees?: number;
  ndaRequired: boolean;
  negotiable: boolean;
  photos: number;
  /** US-ADM-01 quality flags (dictionary keys). */
  flags: DictKey[];
  status: 'review' | 'needs-fix' | 'live';
  createdAt: string;
  views: number;
  inquiries: number;
}

export interface ServiceRequest {
  id: string;
  kind: 'service' | 'booking';
  refId: number;
  title: string;
  note?: string;
  slot?: string;
  linkedListing?: string;
  status: 'pending' | 'confirmed';
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  label: string;
  query: string;
  createdAt: string;
}

interface Toast {
  id: number;
  message: string;
}

interface AppState {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  setLocale: (l: Locale) => void;
  t: (key: DictKey) => string;
  theme: Theme;
  setTheme: (t: Theme) => void;

  user: SessionUser | null;
  signIn: (u: Omit<SessionUser, 'joinedAt'>) => void;
  signOut: () => void;
  /** Runs `action` immediately when signed in; otherwise opens the S13 sheet and runs it after sign-in (US-AUTH-01). */
  requireAuth: (action: () => void) => void;
  authOpen: boolean;
  closeAuth: () => void;
  completeAuth: (u: Omit<SessionUser, 'joinedAt'>) => void;

  saved: number[];
  toggleSaved: (id: number) => void;
  isSaved: (id: number) => boolean;

  pipeline: PipelineInquiry[];
  addInquiry: (i: Omit<PipelineInquiry, 'id' | 'createdAt' | 'updatedAt' | 'direction'>) => PipelineInquiry;
  advanceInquiry: (id: string) => void;
  myInquiryFor: (opportunityId: number) => PipelineInquiry | undefined;

  listings: MyListing[];
  addListing: (l: Omit<MyListing, 'id' | 'createdAt' | 'views' | 'inquiries' | 'status'>) => MyListing;
  /** Demo: listings the current user owns among seeded data (so "إدارة الفرصة" can be shown). */
  ownsOpportunity: (opportunityId: number) => boolean;

  requests: ServiceRequest[];
  addRequest: (r: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>) => void;

  savedSearches: SavedSearch[];
  addSavedSearch: (s: Omit<SavedSearch, 'id' | 'createdAt'>) => void;

  toast: Toast | null;
  showToast: (message: string) => void;
  hydrated: boolean;
}

const Ctx = createContext<AppState | null>(null);

const K = {
  locale: 'forsa.locale',
  theme: 'forsa.theme',
  user: 'forsa.user',
  saved: 'forsa.saved',
  pipeline: 'forsa.pipeline.v2',
  listings: 'forsa.listings.v1',
  requests: 'forsa.requests.v1',
  searches: 'forsa.searches.v1',
} as const;

/**
 * Seed the received pipeline for the demo persona, who owns listing #1124 (DEMO_OWNED_OPPORTUNITIES).
 * The first card is the real seeded inquiry from @forsa/data; the others are fictional, spread across
 * stages so the kanban reads well. Inquiries the user sends from S04 are added as `sent`.
 */
function seedPipeline(): PipelineInquiry[] {
  const seed = seedInquiries.find((i) => i.opportunityId === 1124);
  const base: PipelineInquiry[] = [];
  if (seed) {
    base.push({
      id: seed.id,
      opportunityId: 1124,
      direction: 'received',
      counterpart: 'شركة أفق القابضة',
      message: seed.message,
      budgetSar: seed.investmentBudgetSar,
      status: seed.status,
      signedName: 'شركة أفق القابضة',
      signedAt: seed.updatedAt,
      createdAt: seed.createdAt,
      updatedAt: seed.updatedAt,
    });
  }
  const extra: Array<Omit<PipelineInquiry, 'opportunityId' | 'direction'>> = [
    { id: 'demo-r1', counterpart: 'سارة (مستثمرة)', message: 'أرغب في معرفة عدد الأطفال المسجلين حاليًا ومدة عقد الإيجار المتبقية.', budgetSar: 1_200_000, status: 'new', createdAt: '2026-11-02T09:30:00+03:00', updatedAt: '2026-11-02T09:30:00+03:00' },
    { id: 'demo-r2', counterpart: 'خالد (مستثمر ملائكي)', message: 'هل الترخيص قابل للنقل؟ وهل توجد التزامات على المنشأة؟', budgetSar: 900_000, status: 'new', createdAt: '2026-11-01T20:10:00+03:00', updatedAt: '2026-11-01T20:10:00+03:00' },
    { id: 'demo-r3', counterpart: 'مكتب عائلي في الرياض', message: 'نود ترتيب زيارة للمركز الأسبوع القادم بعد مراجعة القوائم المالية.', budgetSar: 1_500_000, status: 'meeting', createdAt: '2026-10-20T11:00:00+03:00', updatedAt: '2026-10-29T15:00:00+03:00' },
  ];
  return [...base, ...extra.map((x) => ({ ...x, opportunityId: 1124, direction: 'received' as const }))];
}

/**
 * Demo persona: the signed-in user also owns listing #1124 (the day-care centre that receives seeded
 * inquiries), so US-INQ-01 "إدارة الفرصة" can be shown. All other listings behave as someone else's.
 */
export const DEMO_OWNED_OPPORTUNITIES = [1124];

const ORDER: InquiryStatus[] = ['new', 'nda-sent', 'nda-signed', 'in-discussion', 'meeting', 'closed-won'];

export function nextStatus(s: InquiryStatus): InquiryStatus {
  const i = ORDER.indexOf(s);
  if (i < 0 || i === ORDER.length - 1) return s;
  return ORDER[i + 1];
}

export type PipelineColumn = 'new' | 'nda' | 'meeting' | 'closed';
export function columnOf(s: InquiryStatus): PipelineColumn {
  if (s === 'new') return 'new';
  if (s === 'nda-sent' || s === 'nda-signed') return 'nda';
  if (s === 'in-discussion' || s === 'meeting') return 'meeting';
  return 'closed';
}

const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [locale, setLocaleState] = useState<Locale>('ar');
  const [theme, setThemeState] = useState<Theme>('system');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [saved, setSaved] = useState<number[]>([]);
  const [pipeline, setPipeline] = useState<PipelineInquiry[]>([]);
  const [listings, setListings] = useState<MyListing[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const pending = useRef<(() => void) | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from storage once on the client.
  useEffect(() => {
    setLocaleState(readJSON<Locale>(K.locale, 'ar') === 'en' ? 'en' : 'ar');
    setThemeState(readJSON<Theme>(K.theme, 'system'));
    setUser(readJSON<SessionUser | null>(K.user, null));
    setSaved(readJSON<number[]>(K.saved, []));
    setPipeline(readJSON<PipelineInquiry[]>(K.pipeline, seedPipeline()));
    setListings(readJSON<MyListing[]>(K.listings, []));
    setRequests(readJSON<ServiceRequest[]>(K.requests, []));
    setSavedSearches(readJSON<SavedSearch[]>(K.searches, []));
    setHydrated(true);
  }, []);

  // Persist.
  useEffect(() => { if (hydrated) writeJSON(K.user, user); }, [hydrated, user]);
  useEffect(() => { if (hydrated) writeJSON(K.saved, saved); }, [hydrated, saved]);
  useEffect(() => { if (hydrated) writeJSON(K.pipeline, pipeline); }, [hydrated, pipeline]);
  useEffect(() => { if (hydrated) writeJSON(K.listings, listings); }, [hydrated, listings]);
  useEffect(() => { if (hydrated) writeJSON(K.requests, requests); }, [hydrated, requests]);
  useEffect(() => { if (hydrated) writeJSON(K.searches, savedSearches); }, [hydrated, savedSearches]);

  // Locale -> <html lang dir>.
  useEffect(() => {
    const el = document.documentElement;
    el.lang = locale;
    el.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  // Theme -> <html data-theme>.
  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'system') el.removeAttribute('data-theme');
    else el.setAttribute('data-theme', theme);
  }, [theme]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    writeJSON(K.locale, l);
  }, []);
  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    writeJSON(K.theme, t);
  }, []);

  const t = useCallback((key: DictKey) => dictionaries[locale][key] ?? key, [locale]);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const signIn = useCallback((u: Omit<SessionUser, 'joinedAt'>) => {
    setUser({ ...u, joinedAt: new Date().toISOString() });
  }, []);
  const signOut = useCallback(() => setUser(null), []);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (user) {
        action();
        return;
      }
      pending.current = action;
      setAuthOpen(true);
    },
    [user],
  );
  const closeAuth = useCallback(() => {
    pending.current = null;
    setAuthOpen(false);
  }, []);
  const completeAuth = useCallback(
    (u: Omit<SessionUser, 'joinedAt'>) => {
      setUser({ ...u, joinedAt: new Date().toISOString() });
      setAuthOpen(false);
      const run = pending.current;
      pending.current = null;
      // Let the auth sheet unmount and restore focus before opening the next step.
      if (run) setTimeout(run, 60);
    },
    [],
  );

  const toggleSaved = useCallback((id: number) => {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [id, ...s]));
  }, []);
  const isSaved = useCallback((id: number) => saved.includes(id), [saved]);

  const addInquiry = useCallback<AppState['addInquiry']>((i) => {
    const now = new Date().toISOString();
    const rec: PipelineInquiry = { ...i, id: uid('inq'), direction: 'sent', createdAt: now, updatedAt: now };
    setPipeline((p) => [rec, ...p]);
    return rec;
  }, []);
  const advanceInquiry = useCallback((id: string) => {
    setPipeline((p) => p.map((x) => (x.id === id ? { ...x, status: nextStatus(x.status), updatedAt: new Date().toISOString() } : x)));
  }, []);
  const myInquiryFor = useCallback(
    (opportunityId: number) => pipeline.find((p) => p.direction === 'sent' && p.opportunityId === opportunityId),
    [pipeline],
  );

  const addListing = useCallback<AppState['addListing']>((l) => {
    const rec: MyListing = {
      ...l,
      id: uid('lst'),
      createdAt: new Date().toISOString(),
      views: 0,
      inquiries: 0,
      status: l.flags.length ? 'needs-fix' : 'review',
    };
    setListings((s) => [rec, ...s]);
    // US-LST-06: flips to "منشورة" after a moment when there are no quality flags (mock).
    if (!l.flags.length) {
      setTimeout(() => setListings((s) => s.map((x) => (x.id === rec.id ? { ...x, status: 'live' } : x))), 3000);
    }
    return rec;
  }, []);

  const ownsOpportunity = useCallback((id: number) => !!user && DEMO_OWNED_OPPORTUNITIES.includes(id), [user]);

  const addRequest = useCallback<AppState['addRequest']>((r) => {
    setRequests((s) => [{ ...r, id: uid('req'), createdAt: new Date().toISOString(), status: r.kind === 'booking' ? 'confirmed' : 'pending' }, ...s]);
  }, []);

  const addSavedSearch = useCallback<AppState['addSavedSearch']>((s) => {
    setSavedSearches((x) => [{ ...s, id: uid('srch'), createdAt: new Date().toISOString() }, ...x.filter((y) => y.query !== s.query)]);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      locale,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      setLocale,
      t,
      theme,
      setTheme,
      user,
      signIn,
      signOut,
      requireAuth,
      authOpen,
      closeAuth,
      completeAuth,
      saved,
      toggleSaved,
      isSaved,
      pipeline,
      addInquiry,
      advanceInquiry,
      myInquiryFor,
      listings,
      addListing,
      ownsOpportunity,
      requests,
      addRequest,
      savedSearches,
      addSavedSearch,
      toast,
      showToast,
      hydrated,
    }),
    [locale, setLocale, t, theme, setTheme, user, signIn, signOut, requireAuth, authOpen, closeAuth, completeAuth, saved, toggleSaved, isSaved, pipeline, addInquiry, advanceInquiry, myInquiryFor, listings, addListing, ownsOpportunity, requests, addRequest, savedSearches, addSavedSearch, toast, showToast, hydrated],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside <AppProvider>');
  return v;
}

export function useT() {
  const { t, locale } = useApp();
  return { t, locale };
}
