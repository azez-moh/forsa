'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BadgeCheck, Bookmark, CalendarDays, Eye, FileText, Lock, MapPin, MessageSquare, Share2, ShieldAlert, Unlock } from 'lucide-react';
import { getUser, type Opportunity } from './owner';
import { DEMO_OWNED_OPPORTUNITIES, useApp } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { categoryName, cityName, opportunityMetrics, priceLabelKey, similarOpportunities, STAGE_KEY, TYPE_COLOR_VAR, typeLabel, typeSlug } from '@/lib/opportunity';
import { arabicPriceWords } from '@/lib/arabicWords';
import { formatDate, formatSAR } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Media } from '@/components/ui/Media';
import { OpportunityCard } from '@/components/ui/OpportunityCard';
import { Breadcrumbs } from '@/components/layout/PageHeader';
import { InquirySheet } from '@/components/flows/InquirySheet';
import { OpportunityType } from '@forsa/data';
import type { DictKey } from '@/lib/i18n';

/**
 * S03 Opportunity detail (US-OPP-01..05, US-INQ-01, US-INQ-05).
 * Visible H1 + type chip + breadcrumb, structured metrics (undisclosed → "متاح بعد اتفاقية عدم الإفصاح"),
 * owner/verification block, labelled views/inquiries/date, sticky "طلب تواصل" CTA (or "إدارة الفرصة" for the owner),
 * NDA-gated documents, similar listings and a service cross-sell.
 */
export function DetailView({ o }: { o: Opportunity }) {
  const { t, locale, requireAuth, isSaved, toggleSaved, showToast, myInquiryFor, ownsOpportunity } = useApp();
  const router = useRouter();
  const [inq, setInq] = useState(false);
  const [img, setImg] = useState(0);
  const saved = isSaved(o.id);
  const mine = myInquiryFor(o.id);
  const owner = ownsOpportunity(o.id);
  const metrics = opportunityMetrics(o, locale);
  const similar = similarOpportunities(o);
  const ownerUser = getUser(o.ownerId);
  const signed = mine && (mine.status === 'nda-signed' || mine.status === 'in-discussion' || mine.status === 'meeting' || mine.status === 'closed-won');
  const approved = mine && (mine.status === 'in-discussion' || mine.status === 'meeting' || mine.status === 'closed-won');
  const type = typeLabel(o.type, locale);

  // QA P1-3 / US-INQ-01: ownership is re-checked after sign-in (the callback runs once the user exists),
  // so the owner of a listing is sent to "إدارة الفرصة" instead of an inquiry on their own listing.
  const startInquiry = () =>
    requireAuth(() => {
      if (DEMO_OWNED_OPPORTUNITIES.includes(o.id)) {
        showToast(t('ownListingNote'));
        router.push('/dashboard/?tab=listings');
        return;
      }
      setInq(true);
    });
  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `${o.title} · ${formatSAR(o.priceSar, locale)}`;
    try {
      const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
      if (nav.share) {
        await nav.share({ title: o.title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast(t('copied'));
    } catch {
      /* user cancelled */
    }
  };

  const primaryCta = owner ? (
    <ButtonLink href="/dashboard/?tab=listings" size="lg" full>
      {t('manageListing')}
    </ButtonLink>
  ) : mine ? (
    <ButtonLink href="/dashboard/?tab=pipeline" size="lg" full variant="tinted">
      {t('viewRequestStatus')}
    </ButtonLink>
  ) : (
    <Button size="lg" full onClick={startInquiry} icon={<MessageSquare size={18} aria-hidden />}>
      {t('requestContact')}
    </Button>
  );

  const docs: DictKey[] = ['docFinancials', 'docCr', 'docLease', 'docDeck'];

  return (
    <article className="pb-48 pt-20 md:pb-24 md:pt-24">
      <div className="container-page">
        <Breadcrumbs
          label={t('breadcrumbHome')}
          items={[
            { href: '/opportunities/', label: t('navOpportunities') },
            { href: `/opportunities/?type=${typeSlug(o.type)}`, label: type },
            { label: o.title },
          ]}
        />
      </div>

      <div className="container-page mt-6 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="min-w-0">
          {/* Gallery — shares view-transition-name with the card media */}
          <div className="relative overflow-hidden rounded-xl" style={{ viewTransitionName: `opp-media-${o.id}` }}>
            <Media src={o.images[img]} alt={o.title} categoryId={o.categoryId} priority className="aspect-[16/10]" />
            {o.images.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                <span className="rounded-full bg-black/55 px-3 py-1 text-[13px] text-white tabular backdrop-blur">
                  <bdi>
                    {img + 1} / {o.images.length}
                  </bdi>
                </span>
                <div className="flex gap-2">
                  {o.images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImg(i)}
                      aria-label={`${i + 1}`}
                      aria-pressed={i === img}
                      className="relative grid size-6 place-items-center before:absolute before:-inset-2.5 before:content-['']"
                    >
                      <span className={`block size-2 rounded-full ${i === img ? 'bg-white' : 'bg-white/50'}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Header */}
          <header className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 items-center gap-2 rounded-full bg-fill-3 px-3 text-[13px] font-bold text-label">
                <span aria-hidden className="size-2 rounded-full" style={{ background: TYPE_COLOR_VAR[o.type] }} />
                {type}
              </span>
              {o.verified ? (
                <Badge tone="success" icon={<BadgeCheck size={13} aria-hidden />}>
                  {t('verified')}
                </Badge>
              ) : (
                <Badge>{t('notVerifiedYet')}</Badge>
              )}
              {o.featured && <Badge tone="primary">{t('featured')}</Badge>}
              {o.ndaRequired && (
                <Badge icon={<Lock size={12} aria-hidden />}>{t('ndaRequired')}</Badge>
              )}
            </div>
            <h1 className="t-display-m mt-4 text-label">{o.title}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-label-2">
              <span className="inline-flex items-center gap-1">
                <MapPin size={15} aria-hidden /> {cityName(o.cityId, locale)} · {categoryName(o.categoryId, locale)}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={15} aria-hidden /> {t('postedOn')} <bdi className="tabular">{formatDate(o.createdAt, locale)}</bdi>
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye size={15} aria-hidden /> <bdi className="tabular">{o.views.toLocaleString('en-US')}</bdi> {t('views')}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare size={15} aria-hidden /> <bdi className="tabular">{o.inquiries}</bdi> {t('inquiriesCount')}
              </span>
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                variant="gray"
                icon={<Bookmark size={17} aria-hidden className={saved ? 'fill-primary text-primary-text' : ''} />}
                aria-pressed={saved}
                onClick={() => {
                  toggleSaved(o.id);
                  showToast(saved ? t('unsaveToast') : t('saveToast'));
                }}
              >
                {saved ? t('saved') : t('save')}
              </Button>
              <Button variant="gray" icon={<Share2 size={17} aria-hidden />} onClick={share}>
                {t('share')}
              </Button>
            </div>
          </header>

          {/* Price (mobile; desktop shows it in the side panel) */}
          <section className="mt-8 rounded-xl bg-bg-2 p-6 lg:hidden" aria-label={t(priceLabelKey(o.type))}>
            <PriceBlock o={o} />
          </section>

          {/* Metrics */}
          <section className="mt-12" aria-labelledby="metrics-h">
            <h2 id="metrics-h" className="t-title2 mb-5">
              {t('keyMetrics')}
            </h2>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-separator/40 ring-1 ring-separator/40 md:grid-cols-3">
              <div className="bg-bg p-5">
                <dt className="text-[13px] text-label-2">{t('stage')}</dt>
                <dd className="t-headline mt-1">{t(STAGE_KEY[o.stage])}</dd>
              </div>
              {metrics.map((m) => (
                <div key={m.key} className="bg-bg p-5">
                  <dt className="text-[13px] text-label-2">{t(m.key)}</dt>
                  {m.value.kind === 'value' ? (
                    <dd className="t-headline mt-1 tabular">
                      <bdi>{m.value.text}</bdi>
                    </dd>
                  ) : (
                    <dd className="mt-1 flex items-center gap-1.5 text-[14px] font-medium text-label-2">
                      <Lock size={13} aria-hidden className="shrink-0" />
                      {t('afterNda')}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </section>

          {/* About */}
          <section className="mt-12" aria-labelledby="about-h">
            <h2 id="about-h" className="t-title2 mb-4">
              {t('aboutOpportunity')}
            </h2>
            <p className="max-w-[65ch] text-[17px] leading-[1.9] text-label">{o.description}</p>
            {o.highlights.length > 0 && (
              <>
                <h3 className="t-headline mb-3 mt-8">{t('highlights')}</h3>
                <ul className="flex flex-wrap gap-2">
                  {o.highlights.map((h) => (
                    <li key={h} className="rounded-full bg-fill-3 px-4 py-2 text-[15px]">
                      {h}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* NDA-gated documents (US-INQ-05) */}
          <section className="mt-12" aria-labelledby="docs-h">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="docs-h" className="t-title2">
                {t('documents')}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-label-2">
                {approved ? <Unlock size={14} aria-hidden /> : <Lock size={14} aria-hidden />}
                {approved ? t('documentsUnlocked') : signed ? t('awaitingOwner') : t('documentsLocked')}
              </span>
            </div>
            <ul className="divide-y divide-separator/40 overflow-hidden rounded-xl ring-1 ring-separator/40">
              {docs.map((d) => (
                <li key={d} className="flex min-h-16 items-center gap-4 px-5">
                  <FileText size={20} aria-hidden className={approved ? 'text-primary-text' : 'text-label-3'} />
                  <span className={`flex-1 text-[15px] ${approved ? 'text-label' : 'text-label-2'}`}>
                    {approved ? t(d) : <span className="select-none blur-[3px]" aria-hidden>{t(d)}</span>}
                    {!approved && <span className="sr-only">{t('documentsLocked')}</span>}
                  </span>
                  {approved ? <Badge tone="primary">PDF</Badge> : <Lock size={16} aria-hidden className="text-label-3" />}
                </li>
              ))}
            </ul>
            {!signed && !owner && (
              <Button variant="tinted" className="mt-4" icon={<Lock size={16} aria-hidden />} onClick={startInquiry}>
                {t('unlockDocs')}
              </Button>
            )}
          </section>

          {/* Service cross-sell (US-OPP-05) */}
          {(o.type === OpportunityType.ForSale || o.type === OpportunityType.Investment) && (
            <aside className="mt-12 flex flex-col gap-4 rounded-xl bg-primary-tint p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="t-headline text-label">{t('needEvaluation')}</h2>
                <p className="mt-1 text-[15px] text-label-2">{t('needEvaluationBody')}</p>
              </div>
              <ButtonLink href="/services/2/" variant="filled">
                {t('requestService')}
              </ButtonLink>
            </aside>
          )}

          <p className="mt-10 text-[13px] text-label-2">
            {t('source')}:{' '}
            <a href={o.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary-text underline-offset-2 hover:underline">
              forsh.sa/opportunities/{o.id}
            </a>
          </p>
        </div>

        {/* Side panel (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-4">
            <div className="rounded-xl bg-bg-3 p-6 shadow-e2 ring-1 ring-separator/30">
              <PriceBlock o={o} />
              <div className="mt-6">{primaryCta}</div>
              {mine && <p className="mt-3 text-center text-[13px] text-label-2">{t('inquiryOpen')}</p>}
            </div>
            <OwnerBlock verified={o.verified} name={ownerUser?.displayName} joinedAt={ownerUser?.joinedAt} />
          </div>
        </aside>
      </div>

      <div className="container-page mt-8 lg:hidden">
        <OwnerBlock verified={o.verified} name={ownerUser?.displayName} joinedAt={ownerUser?.joinedAt} />
      </div>

      {similar.length > 0 && (
        <section className="container-page mt-20" aria-labelledby="similar-h">
          <h2 id="similar-h" className="t-title1 mb-6">
            {t('similar')}
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <li key={s.id}>
                <OpportunityCard o={s} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Mobile sticky CTA bar (above the floating tab bar) */}
      <div className="material-bar fixed inset-x-0 bottom-[88px] z-30 border-t border-separator/40 px-5 py-3 md:bottom-0 lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <div className="min-w-0">
            <p className="text-[12px] text-label-2">{t(priceLabelKey(o.type))}</p>
            <p className="t-headline tabular">
              <bdi>{formatSAR(o.priceSar, locale)}</bdi>
            </p>
          </div>
          <div className="ms-auto w-44 shrink-0">{primaryCta}</div>
        </div>
      </div>

      <InquirySheet o={o} open={inq} onClose={() => setInq(false)} />
    </article>
  );
}

function PriceBlock({ o }: { o: Opportunity }) {
  const { t, locale } = useApp();
  return (
    <div>
      <p className="text-[13px] text-label-2">{t(priceLabelKey(o.type))}</p>
      <p className="t-display-m mt-1 tabular text-label" aria-label={`${o.priceSar.toLocaleString('en-US')} ${locale === 'ar' ? 'ريال سعودي' : 'Saudi riyals'}`}>
        <bdi>{o.priceSar.toLocaleString('en-US')}</bdi>
        <span className="ms-2 text-[17px] font-bold text-label-2">{locale === 'ar' ? 'ر.س' : 'SAR'}</span>
      </p>
      {o.priceMaxSar && (
        <p className="mt-1 text-[13px] text-label-2">
          – <bdi className="tabular">{formatSAR(o.priceMaxSar, locale)}</bdi>
        </p>
      )}
      {locale === 'ar' && <p className="mt-2 text-[13px] text-label-2">{arabicPriceWords(o.priceSar)}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {o.priceNegotiable && <Badge>{t('negotiable')}</Badge>}
        {o.equityPercent !== undefined && o.equityPercent > 0 && o.equityPercent < 100 && (
          <Badge tone="primary">
            {t('equity')} <bdi className="tabular">{o.equityPercent}%</bdi>
          </Badge>
        )}
      </div>
    </div>
  );
}

function OwnerBlock({ verified, name, joinedAt }: { verified: boolean; name?: string; joinedAt?: string }) {
  const { t } = useApp();
  return (
    <section className="rounded-xl bg-bg-2 p-6" aria-labelledby="owner-h">
      <h2 id="owner-h" className="text-[13px] text-label-2">
        {t('ownerBlock')}
      </h2>
      <p className="t-headline mt-1">{name ?? t('notStated')}</p>
      {verified ? (
        <ul className="mt-4 space-y-2 text-[15px]">
          <li className="flex items-center gap-2">
            <BadgeCheck size={17} aria-hidden className="text-success" /> {t('idVerified')}
          </li>
          <li className="flex items-center gap-2">
            <BadgeCheck size={17} aria-hidden className="text-success" /> {t('crVerified')}
          </li>
        </ul>
      ) : (
        <p className="mt-3 flex items-center gap-2 text-[15px] text-label-2">
          <ShieldAlert size={17} aria-hidden /> {t('notVerifiedYet')}
        </p>
      )}
      {joinedAt && (
        <p className="mt-4 text-[13px] text-label-2">
          {t('memberSince')} <bdi className="tabular">{new Date(joinedAt).getUTCFullYear()}</bdi>
        </p>
      )}
      <Link href="/faq/" className="mt-3 inline-flex min-h-11 items-center text-[13px] text-primary-text">
        {t('faqTrust')}
      </Link>
    </section>
  );
}
