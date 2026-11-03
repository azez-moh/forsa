'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play } from 'lucide-react';
import { opportunities, services, videoCategories, videos, OpportunityType, type VideoCategoryId } from '@forsa/data';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/cn';
import { PageHeader } from '@/components/layout/PageHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { OpportunityCard } from '@/components/ui/OpportunityCard';
import { formatSAR } from '@/lib/format';

/** Map each video category to opportunity types and one service, so learning leads to action (US-LRN-01). */
const RELATED: Record<VideoCategoryId, { types: OpportunityType[]; serviceId: number }> = {
  founding: { types: [OpportunityType.InvestorForIdea, OpportunityType.PartnerSearch], serviceId: 14 },
  investor: { types: [OpportunityType.Investment, OpportunityType.ForSale], serviceId: 6 },
};

/** S11 Culture center: audience switch, inline nocookie player, related opportunities and a service. */
export function CultureView() {
  const { t, locale } = useApp();
  const sp = useSearchParams();
  const [aud, setAud] = useState<VideoCategoryId>('founding');
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const v = videos.find((x) => x.id === sp.get('v'));
    if (v) {
      setAud(v.categoryId);
      setActive(v.id);
    }
  }, [sp]);

  const list = videos.filter((v) => v.categoryId === aud);
  const current = videos.find((v) => v.id === active) ?? list[0];
  const rel = RELATED[aud];
  const relatedOpps = opportunities.filter((o) => rel.types.includes(o.type)).sort((a, b) => b.views - a.views).slice(0, 3);
  const svc = services.find((s) => s.id === rel.serviceId);
  const cat = videoCategories.find((c) => c.id === aud);

  return (
    <>
      <PageHeader title={t('cultureTitle')} lead={t('culturePageLead')} />
      <div className="container-page pb-28">
        <SegmentedControl
          label={t('audienceLabel')}
          value={aud}
          onChange={(v) => {
            setAud(v);
            setActive(null);
          }}
          segments={[
            { value: 'founding', label: t('audienceEntre') },
            { value: 'investor', label: t('audienceInvestor') },
          ]}
        />
        {cat && <p className="mt-4 text-[15px] text-label-2">{cat.description}</p>}

        {current && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="aspect-video overflow-hidden rounded-xl bg-black">
                <iframe
                  key={current.youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?rel=0`}
                  title={current.title}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="size-full"
                />
              </div>
              <h2 className="t-title2 mt-5">{current.title}</h2>
              <p className="mt-1 text-[15px] text-label-2">
                <bdi className="tabular">{current.views}</bdi> {t('views')}
              </p>
            </div>
            <ul className="flex flex-col gap-2" aria-label={t('cultureTitle')}>
              {list.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => setActive(v.id)}
                    aria-current={v.id === current.id}
                    className={cn('flex w-full items-center gap-3 rounded-lg p-2 text-start transition-colors', v.id === current.id ? 'bg-primary-tint' : 'hover:bg-bg-2')}
                  >
                    <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-fill-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.thumbnail} alt="" loading="lazy" className="size-full object-cover" />
                      <Play size={18} aria-hidden className="absolute inset-0 m-auto fill-white text-white drop-shadow" />
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-[15px] font-bold">{v.title}</span>
                      <span className="text-[12px] text-label-2">
                        <bdi className="tabular">{v.views}</bdi> {t('views')}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="mt-20" aria-labelledby="rel-h">
          <h2 id="rel-h" className="t-title1 mb-6">
            {t('relatedOpps')}
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedOpps.map((o) => (
              <li key={o.id}>
                <OpportunityCard o={o} />
              </li>
            ))}
          </ul>
          {svc && (
            <Link href={`/services/${svc.id}/`} className="mt-8 flex flex-col gap-2 rounded-xl bg-primary-tint p-6 md:flex-row md:items-center md:justify-between">
              <span>
                <span className="block text-[13px] text-label-2">{t('navServices')}</span>
                <span className="t-headline">{svc.title}</span>
              </span>
              <span className="tabular font-bold text-primary-text">
                {t('startsFrom')} <bdi>{formatSAR(svc.priceSar, locale)}</bdi>
              </span>
            </Link>
          )}
        </section>
      </div>
    </>
  );
}
