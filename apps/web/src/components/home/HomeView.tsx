'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowLeft, BadgeCheck, FileLock2, Percent, PlayCircle, Search } from 'lucide-react';
import { featuredOpportunities, opportunities, platformStats, services, videos, getProvider } from '@forsa/data';
import { useApp } from '@/lib/store';
import { cityStats, typeCounts } from '@/lib/opportunity';
import { publicConsultants } from '@/lib/services';
import { formatCompact, formatSAR } from '@/lib/format';
import { ButtonLink } from '@/components/ui/Button';
import { OpportunityCard } from '@/components/ui/OpportunityCard';
import { StatTile } from '@/components/ui/StatTile';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SectionHeader } from '@/components/layout/PageHeader';
import { ConsultantAvatar, ReputationLabel } from '@/components/ui/Reputation';
import { CityMap, HeroCounter, TiltCard, TypeStory } from './wow';
import { Deferred } from './Deferred';
import type { DictKey } from '@/lib/i18n';

/** S01 Home (US-DISC-01): one cinematic moment (hero), everything else quiet. */
export function HomeView() {
  const { t, locale } = useApp();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [how, setHow] = useState<'buyer' | 'seller' | 'idea'>('buyer');
  // Always 6 cards (2 or 3 per row, never an orphan gap): featured first, then most-viewed verified.
  const featured = [...featuredOpportunities(), ...opportunities.filter((o) => !o.featured && o.verified).sort((a, b) => b.views - a.views)].slice(0, 6);
  const types = typeCounts(locale);
  const cities = cityStats();
  const Arrow = <ArrowLeft size={17} aria-hidden className="ltr:rotate-180" />;

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/opportunities/${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
  };

  const howSteps: Record<typeof how, DictKey[]> = {
    buyer: ['howBuyer1', 'howBuyer2', 'howBuyer3'],
    seller: ['howSeller1', 'howSeller2', 'howSeller3'],
    idea: ['howIdea1', 'howIdea2', 'howIdea3'],
  };

  return (
    <>
      {/* 1 · Cinematic hero (Wow agent). It renders the H1 and the live counter; we supply search + CTAs. */}
      <HeroCounter totalValueSar={platformStats.totalValueSar} users={platformStats.users} opportunities={platformStats.opportunities} locale={locale}>
        <div className="flex w-full flex-col items-center gap-5">
          <form onSubmit={onSearch} role="search" className="flex w-full max-w-xl items-center gap-2 rounded-full bg-white/10 p-1.5 ring-1 ring-white/20 backdrop-blur focus-within:ring-white/50">
            <Search size={18} aria-hidden className="ms-3 shrink-0 text-white/70" />
            <label htmlFor="hero-q" className="sr-only">
              {t('searchLabel')}
            </label>
            <input
              id="hero-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('heroSearch')}
              className="h-11 min-w-0 flex-1 bg-transparent text-[16px] text-white placeholder:text-white/55 outline-none"
            />
          </form>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/opportunities/" size="lg" onDark>
              {t('heroCtaExplore')}
            </ButtonLink>
            <ButtonLink href="/add/" size="lg" variant="tinted" onDark>
              {t('heroCtaAdd')}
            </ButtonLink>
          </div>
        </div>
      </HeroCounter>

      {/* 2 · Four types story (Wow agent) — full-bleed navy chapter that continues the hero */}
      <Deferred minHeight="100svh" style={{ background: 'var(--fz-navy-deep)' }}>
        <TypeStory types={types} locale={locale} />
      </Deferred>

      {/* 3 · Proof band: figures the hero and the type story do not already show */}
      <section aria-labelledby="stats-h" className="border-b border-separator/40">
        <h2 id="stats-h" className="sr-only">
          {t('statsValue')}
        </h2>
        <div className="container-page grid grid-cols-2 gap-8 py-12 md:grid-cols-4 md:py-16">
          <StatTile value={formatCompact(platformStats.totalViews, locale)} label={t('statsViews')} />
          <StatTile value={platformStats.serviceRequests.toLocaleString('en-US')} label={locale === 'ar' ? 'طلب خدمة' : 'service requests'} />
          <StatTile value={platformStats.consultants.toLocaleString('en-US')} label={locale === 'ar' ? 'مستشارون معتمدون' : 'certified consultants'} />
          <StatTile value={`${platformStats.commissionPercent}%`} label={locale === 'ar' ? 'عمولة على الصفقات المكتملة فقط' : 'commission on completed deals only'} />
        </div>
        <p className="container-page -mt-6 pb-12 text-[13px] text-label-2">{t('statsAsOf')}</p>
      </section>

      {/* 4 · Featured */}
      <section className="section-gap bg-bg-2" aria-labelledby="featured-h">
        <div className="container-page">
          <SectionHeader
              id="featured-h"
              title={t('featuredTitle')}
              lead={t('featuredLead')}
              action={
                <ButtonLink href="/opportunities/" variant="plain" iconEnd={Arrow}>
                  {t('viewAll')}
                </ButtonLink>
              }
            />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((o, i) => (
              <li key={o.id}>
                <TiltCard className="h-full">
                  <OpportunityCard o={o} priority={i < 3} />
                </TiltCard>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5 · City map (Wow agent) */}
      <section className="section-gap" aria-labelledby="map-h">
        <div className="container-page">
          <SectionHeader id="map-h" title={t('mapTitle')} lead={t('mapLead')} />
          <Deferred minHeight="560px">
            <CityMap
              cities={cities.map(({ nameAr, nameEn, count, value }) => ({ nameAr, nameEn, count, value }))}
              onSelect={(c) => {
                const hit = cities.find((x) => x.nameEn === c.nameEn);
                if (hit) router.push(`/opportunities/?city=${hit.id}`);
              }}
              locale={locale}
            />
          </Deferred>
        </div>
      </section>

      {/* 6 · How it works (tabs per persona) */}
      <section className="section-gap bg-bg-2" aria-labelledby="how-h">
        <div className="container-page">
          <h2 id="how-h" className="t-display-m mb-8">
            {t('howTitle')}
          </h2>
          <SegmentedControl
            label={t('howTitle')}
            value={how}
            onChange={setHow}
            segments={[
              { value: 'buyer', label: t('howBuyerTitle') },
              { value: 'seller', label: t('howSellerTitle') },
              { value: 'idea', label: t('howIdeaTitle') },
            ]}
            scroll
          />
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {howSteps[how].map((k, i) => (
              <li key={k} className="flex flex-col gap-3">
                <span className="tabular text-[44px] font-extrabold leading-none text-label-3">{String(i + 1).padStart(2, '0')}</span>
                <p className="t-title3 max-w-xs text-label">{t(k)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7 · Trust */}
      <section className="section-gap" aria-labelledby="trust-h">
        <div className="container-page">
          <h2 id="trust-h" className="t-display-m mb-10 md:mb-14">
            {t('trustTitle')}
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {(
              [
                [BadgeCheck, 'trustVerified', 'trustVerifiedBody'],
                [FileLock2, 'trustNda', 'trustNdaBody'],
                [Percent, 'trustCommission', 'trustCommissionBody'],
              ] as const
            ).map(([Icon, h, b]) => (
              <div key={h}>
                <Icon size={28} strokeWidth={1.5} aria-hidden className="text-primary-text" />
                <h3 className="t-title3 mt-4">{t(h)}</h3>
                <p className="mt-2 text-[17px] leading-relaxed text-label-2">{t(b)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 · Services */}
      <section className="section-gap bg-bg-2" aria-labelledby="services-h">
        <div className="container-page">
          <SectionHeader
              id="services-h"
              title={t('servicesTitle')}
              lead={t('servicesLead')}
              action={
                <ButtonLink href="/services/" variant="plain" iconEnd={Arrow}>
                  {t('viewAll')}
                </ButtonLink>
              }
            />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services
              .filter((s) => [2, 6, 9, 5].includes(s.id))
              .map((s) => (
                <li key={s.id}>
                  <Link href={`/services/${s.id}/`} className="flex h-full flex-col gap-2 rounded-lg bg-bg-3 p-6 shadow-e1 transition-shadow hover:shadow-e2">
                    <span className="text-[13px] text-label-2">{getProvider(s.providerId)?.name}</span>
                    <span className="t-headline">{s.title}</span>
                    <span className="mt-auto pt-4 text-[13px] text-label-2">
                      {t('startsFrom')}{' '}
                      <bdi className="tabular text-[17px] font-bold text-label">{formatSAR(s.priceSar, locale)}</bdi>
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* 9 · Consultants */}
      <section className="section-gap" aria-labelledby="consult-h">
        <div className="container-page">
          <SectionHeader
              id="consult-h"
              title={t('consultantsTitle')}
              lead={t('consultantsLead')}
              action={
                <ButtonLink href="/consultants/" variant="plain" iconEnd={Arrow}>
                  {t('viewAll')}
                </ButtonLink>
              }
            />
          <ul className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-5">
            {publicConsultants().map((c) => (
              <li key={c.id} className="w-60 shrink-0 snap-start md:w-auto">
                <Link href={`/consultants/${c.id}/`} className="flex h-full flex-col items-start gap-3 rounded-lg bg-bg-2 p-5 hover:bg-fill-3">
                  <ConsultantAvatar name={c.name} />
                  <span className="t-headline">{c.name}</span>
                  <span className="text-[15px] text-label-2">{c.specialty}</span>
                  <ReputationLabel reviews={c.reviews} rating={c.rating} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 10 · Culture center */}
      <section className="section-gap bg-bg-2" aria-labelledby="culture-h">
        <div className="container-page">
          <SectionHeader
              id="culture-h"
              title={t('cultureTitle')}
              lead={t('cultureLead')}
              action={
                <ButtonLink href="/culture-center/" variant="plain" iconEnd={Arrow}>
                  {t('viewAll')}
                </ButtonLink>
              }
            />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {videos.slice(0, 4).map((v) => (
              <li key={v.id}>
                <Link href={`/culture-center/?v=${v.id}`} className="group block">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-fill-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.thumbnail} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <PlayCircle aria-hidden size={44} strokeWidth={1.25} className="absolute inset-0 m-auto text-white drop-shadow" />
                  </div>
                  <p className="t-headline mt-3">{v.title}</p>
                  <p className="text-[13px] text-label-2">
                    <bdi className="tabular">{v.views}</bdi> {t('views')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 11 · Final CTA (navy) */}
      <section className="section-gap text-white" style={{ background: 'var(--fz-navy)' }} aria-labelledby="final-h">
        <div className="container-page flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 id="final-h" className="t-display-l">
              {t('finalTitle')}
            </h2>
            <p className="mt-4 text-[19px] text-white/70">{t('finalLead')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/add/" size="lg" onDark>
              {t('heroCtaAdd')}
            </ButtonLink>
            <ButtonLink href="/opportunities/" size="lg" variant="tinted" onDark>
              {t('heroCtaExplore')}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
