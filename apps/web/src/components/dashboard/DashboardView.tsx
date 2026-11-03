'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, ArrowLeft, BadgeCheck, Bookmark, CalendarClock, Eye, FileSignature, Inbox, LayoutGrid, LogOut, MessageSquare, Plus, Search, Wrench } from 'lucide-react';
import { getOpportunity, opportunities, type InquiryStatus } from '@forsa/data';
import { columnOf, DEMO_OWNED_OPPORTUNITIES, useApp, type MyListing, type PipelineColumn, type PipelineInquiry } from '@/lib/store';
import { categoryName, cityName, typeLabel } from '@/lib/opportunity';
import { formatDate, formatSAR } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { OpportunityCard } from '@/components/ui/OpportunityCard';
import { StatTile } from '@/components/ui/StatTile';
import { Skeleton } from '@/components/ui/Skeleton';
import type { DictKey } from '@/lib/i18n';

type Tab = 'listings' | 'pipeline' | 'saved' | 'requests';

const STATUS_KEY: Record<InquiryStatus, { ar: string; en: string }> = {
  new: { ar: 'جديد', en: 'New' },
  'nda-sent': { ar: 'بانتظار الموافقة', en: 'Awaiting NDA' },
  'nda-signed': { ar: 'وُقّعت الاتفاقية', en: 'NDA signed' },
  'in-discussion': { ar: 'قيد النقاش', en: 'In discussion' },
  meeting: { ar: 'اجتماع', en: 'Meeting' },
  'closed-won': { ar: 'تمت الصفقة', en: 'Deal closed' },
  'closed-lost': { ar: 'مغلق', en: 'Closed' },
};

const COLUMNS: Array<{ id: PipelineColumn; key: DictKey }> = [
  { id: 'new', key: 'colNew' },
  { id: 'nda', key: 'colNda' },
  { id: 'meeting', key: 'colMeeting' },
  { id: 'closed', key: 'colClosed' },
];

/** S06 Dashboard (US-DASH-01..05): my listings, inquiry pipeline kanban, saved, service requests & bookings. */
export function DashboardView() {
  const { t, locale, user, hydrated, requireAuth, signOut, listings, pipeline, saved, requests, savedSearches } = useApp();
  const sp = useSearchParams();
  const router = useRouter();
  const initial = (sp.get('tab') as Tab) || 'listings';
  const [tab, setTab] = useState<Tab>(['listings', 'pipeline', 'saved', 'requests'].includes(initial) ? initial : 'listings');

  useEffect(() => {
    const q = sp.get('tab');
    if (q && q !== tab && ['listings', 'pipeline', 'saved', 'requests'].includes(q)) setTab(q as Tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const changeTab = (v: Tab) => {
    setTab(v);
    router.replace(`/dashboard/?tab=${v}`, { scroll: false });
  };

  if (!hydrated) {
    return (
      <div className="container-page pb-24 pt-32">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="mt-8 h-11 w-full max-w-xl" />
        <Skeleton className="mt-8 h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page pb-24 pt-32">
        <EmptyState
          icon={<LayoutGrid size={24} aria-hidden />}
          title={t('guestDashTitle')}
          body={t('guestDashBody')}
          action={
            <Button size="lg" onClick={() => requireAuth(() => undefined)}>
              {t('navLogin')}
            </Button>
          }
        />
      </div>
    );
  }

  const received = pipeline.filter((p) => p.direction === 'received');
  const sent = pipeline.filter((p) => p.direction === 'sent');
  const newCount = received.filter((p) => p.status === 'new').length;

  return (
    <div className="container-page pb-28 pt-24 md:pt-32">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[15px] text-label-2">
            {t('welcomeBack')}، {user.name}
            {user.verified && (
              <Badge tone="success" icon={<BadgeCheck size={13} aria-hidden />}>
                {t('idVerified')}
              </Badge>
            )}
          </p>
          <h1 className="t-display-m mt-1">{t('dashTitle')}</h1>
          <p className="mt-2 text-[17px] text-label-2">{t('dashLead')}</p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/add/" icon={<Plus size={17} aria-hidden />}>
            {t('navAdd')}
          </ButtonLink>
          <Button variant="gray" icon={<LogOut size={17} aria-hidden />} onClick={signOut}>
            {t('signOut')}
          </Button>
        </div>
      </header>

      <SegmentedControl
        label={t('dashTitle')}
        value={tab}
        onChange={changeTab}
        scroll
        segments={[
          { value: 'listings', label: t('tabListings'), count: listings.length + DEMO_OWNED_OPPORTUNITIES.length },
          { value: 'pipeline', label: t('tabPipeline'), count: newCount || undefined },
          { value: 'saved', label: t('tabSaved'), count: saved.length },
          { value: 'requests', label: t('tabRequests'), count: requests.length },
        ]}
      />

      <div className="mt-10">
        {tab === 'listings' && <ListingsTab listings={listings} />}
        {tab === 'pipeline' && <PipelineTab received={received} sent={sent} />}
        {tab === 'saved' && (
          <div className="flex flex-col gap-10">
            {saved.length === 0 ? (
              <EmptyState icon={<Bookmark size={24} aria-hidden />} title={t('emptySaved')} body={t('emptySavedBody')} action={<ButtonLink href="/opportunities/">{t('findOpportunity')}</ButtonLink>} />
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {saved
                  .map((id) => getOpportunity(id))
                  .filter((o): o is NonNullable<typeof o> => !!o)
                  .map((o) => (
                    <li key={o.id}>
                      <OpportunityCard o={o} />
                    </li>
                  ))}
              </ul>
            )}
            {savedSearches.length > 0 && (
              <section aria-labelledby="ss-h">
                <h2 id="ss-h" className="t-title3 mb-4">
                  {t('savedSearches')}
                </h2>
                <ul className="divide-y divide-separator/40 overflow-hidden rounded-xl ring-1 ring-separator/40">
                  {savedSearches.map((s) => (
                    <li key={s.id}>
                      <Link href={`/opportunities/${s.query}`} className="flex min-h-14 items-center gap-3 px-5 hover:bg-bg-2">
                        <Search size={17} aria-hidden className="text-label-2" />
                        <span className="flex-1">{s.label}</span>
                        <ArrowLeft size={16} aria-hidden className="text-label-3 ltr:rotate-180" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
        {tab === 'requests' &&
          (requests.length === 0 ? (
            <EmptyState icon={<Wrench size={24} aria-hidden />} title={t('emptyRequests')} body={t('emptyRequestsBody')} action={<ButtonLink href="/services/">{t('navServices')}</ButtonLink>} />
          ) : (
            <ul className="divide-y divide-separator/40 overflow-hidden rounded-xl ring-1 ring-separator/40">
              {requests.map((r) => (
                <li key={r.id} className="flex flex-col gap-1 px-5 py-4 md:flex-row md:items-center md:gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-fill-3 text-label-2">
                    {r.kind === 'booking' ? <CalendarClock size={18} aria-hidden /> : <Wrench size={18} aria-hidden />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="t-headline">{r.title}</p>
                    <p className="text-[13px] text-label-2">
                      {r.slot ? <bdi>{r.slot}</bdi> : <bdi className="tabular">{formatDate(r.createdAt, locale)}</bdi>}
                      {r.linkedListing && <> · {r.linkedListing}</>}
                    </p>
                  </div>
                  <Badge tone={r.status === 'confirmed' ? 'success' : 'warning'}>{r.status === 'confirmed' ? t('statusConfirmed') : t('statusPending')}</Badge>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </div>
  );
}

function ListingsTab({ listings }: { listings: MyListing[] }) {
  const { t, locale } = useApp();
  const reduce = useReducedMotion();
  const demo = DEMO_OWNED_OPPORTUNITIES.map((id) => getOpportunity(id)).filter((o): o is NonNullable<typeof o> => !!o);
  const totalViews = demo.reduce((s, o) => s + o.views, 0) + listings.reduce((s, l) => s + l.views, 0);
  const totalInq = demo.reduce((s, o) => s + o.inquiries, 0) + listings.reduce((s, l) => s + l.inquiries, 0);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-6 rounded-xl bg-bg-2 p-6 md:grid-cols-3">
        <StatTile value={String(listings.length + demo.length)} label={t('tabListings')} />
        <StatTile value={totalViews.toLocaleString('en-US')} label={t('views')} />
        <StatTile value={String(totalInq)} label={t('inquiriesCount')} />
      </div>
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {listings.map((l) => (
            <motion.li
              key={l.id}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 158, damping: 17.6 }}
              className="flex flex-col gap-3 rounded-xl bg-bg-3 p-5 shadow-e1 ring-1 ring-separator/30 md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <ListingStatus status={l.status} />
                  <span className="text-[13px] text-label-2">{typeLabel(l.type, locale)}</span>
                </div>
                <p className="t-headline mt-2">{l.title}</p>
                <p className="text-[13px] text-label-2">
                  {cityName(l.cityId, locale)} · {categoryName(l.categoryId, locale)} · <bdi className="tabular">{formatSAR(l.priceSar, locale)}</bdi>
                </p>
                {l.status === 'needs-fix' && l.flags.length > 0 && (
                  <ul className="mt-2 list-disc ps-5 text-[13px] text-label-2">
                    {l.flags.map((f) => (
                      <li key={f}>{t(f)}</li>
                    ))}
                  </ul>
                )}
              </div>
              <dl className="flex gap-6 text-[13px]">
                <div>
                  <dt className="text-label-2">{t('views')}</dt>
                  <dd className="t-headline tabular">{l.views}</dd>
                </div>
                <div>
                  <dt className="text-label-2">{t('inquiriesCount')}</dt>
                  <dd className="t-headline tabular">{l.inquiries}</dd>
                </div>
              </dl>
            </motion.li>
          ))}
        </AnimatePresence>
        {demo.map((o) => (
          <li key={o.id} className="flex flex-col gap-3 rounded-xl bg-bg-3 p-5 shadow-e1 ring-1 ring-separator/30 md:flex-row md:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <ListingStatus status="live" />
                <span className="text-[13px] text-label-2">{typeLabel(o.type, locale)}</span>
              </div>
              <Link href={`/opportunities/${o.id}/`} className="t-headline mt-2 block hover:text-primary-text">
                {o.title}
              </Link>
              <p className="text-[13px] text-label-2">
                {cityName(o.cityId, locale)} · <bdi className="tabular">{formatSAR(o.priceSar, locale)}</bdi>
              </p>
            </div>
            <dl className="flex gap-6 text-[13px]">
              <div>
                <dt className="text-label-2">{t('views')}</dt>
                <dd className="t-headline tabular">{o.views.toLocaleString('en-US')}</dd>
              </div>
              <div>
                <dt className="text-label-2">{t('inquiriesCount')}</dt>
                <dd className="t-headline tabular">{o.inquiries}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListingStatus({ status }: { status: MyListing['status'] }) {
  const { t } = useApp();
  if (status === 'live') return <Badge tone="success">{t('live')}</Badge>;
  if (status === 'needs-fix')
    return (
      <Badge tone="warning" icon={<AlertTriangle size={12} aria-hidden />}>
        {t('needsFix')}
      </Badge>
    );
  return <Badge tone="warning">{t('underReview')}</Badge>;
}

function PipelineTab({ received, sent }: { received: PipelineInquiry[]; sent: PipelineInquiry[] }) {
  const { t } = useApp();
  const [mode, setMode] = useState<'received' | 'sent'>(sent.length && !received.length ? 'sent' : 'received');
  const list = mode === 'received' ? received : sent;
  return (
    <div className="flex flex-col gap-6">
      <SegmentedControl
        size="sm"
        label={t('tabPipeline')}
        value={mode}
        onChange={setMode}
        segments={[
          { value: 'received', label: t('receivedInquiries'), count: received.length },
          { value: 'sent', label: t('sentInquiries'), count: sent.length },
        ]}
      />
      {list.length === 0 ? (
        <EmptyState icon={<Inbox size={24} aria-hidden />} title={t('noResultsTitle')} action={<ButtonLink href="/opportunities/">{t('findOpportunity')}</ButtonLink>} />
      ) : (
        <div className="no-scrollbar -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
          <div className="grid min-w-[880px] grid-cols-4 gap-4">
            {COLUMNS.map((c) => {
              const items = list.filter((p) => columnOf(p.status) === c.id);
              return (
                <section key={c.id} aria-labelledby={`col-${c.id}`} className="flex flex-col gap-3 rounded-xl bg-bg-2 p-3">
                  <h3 id={`col-${c.id}`} className="flex items-center justify-between px-2 pt-1 text-[15px] font-bold">
                    {t(c.key)}
                    <span className="tabular text-[13px] font-medium text-label-2">{items.length}</span>
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {items.map((p) => (
                      <PipelineCard key={p.id} p={p} />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PipelineCard({ p }: { p: PipelineInquiry }) {
  const { t, locale, advanceInquiry } = useApp();
  const reduce = useReducedMotion();
  const o = getOpportunity(p.opportunityId) ?? opportunities[0];
  const canAdvance = p.direction === 'received' && !['closed-won', 'closed-lost'].includes(p.status);
  const isNdaSigned = p.status === 'nda-signed';
  return (
    <motion.li layout={!reduce} transition={{ type: 'spring', stiffness: 322, damping: 30.5 }} className="rounded-lg bg-bg-3 p-4 shadow-e1">
      <div className="flex items-start justify-between gap-2">
        {p.direction === 'received' ? (
          <p className="text-[15px] font-bold">{p.counterpart}</p>
        ) : (
          <Link href={`/opportunities/${o.id}/`} className="line-clamp-2 text-[15px] font-bold hover:text-primary-text">
            {o.title}
          </Link>
        )}
        <Badge tone={p.status === 'closed-won' ? 'success' : p.status === 'closed-lost' ? 'neutral' : 'primary'}>{STATUS_KEY[p.status][locale]}</Badge>
      </div>
      {p.direction === 'received' && (
        <Link href={`/opportunities/${o.id}/`} className="mt-1 line-clamp-1 text-[13px] text-label-2 hover:text-primary-text">
          {o.title}
        </Link>
      )}
      <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-label">
        <MessageSquare size={12} aria-hidden className="me-1 inline text-label-3" />
        {p.message}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-label-2">
        {p.budgetSar && (
          <span>
            <bdi className="tabular">{formatSAR(p.budgetSar, locale)}</bdi>
          </span>
        )}
        <span>
          <bdi className="tabular">{formatDate(p.updatedAt, locale)}</bdi>
        </span>
        {p.signedName && (
          <span className="inline-flex items-center gap-1">
            <FileSignature size={12} aria-hidden /> {p.signedName}
          </span>
        )}
      </div>
      {canAdvance && (
        <Button variant={isNdaSigned ? 'tinted' : 'plain'} size="sm" className="mt-3" onClick={() => advanceInquiry(p.id)}>
          {isNdaSigned ? t('grantAccess') : t('moveNext')}
        </Button>
      )}
      {p.direction === 'sent' && (
        <p className="mt-3 flex items-center gap-1 text-[12px] text-label-2">
          <Eye size={12} aria-hidden /> {t('sent')}
        </p>
      )}
    </motion.li>
  );
}
