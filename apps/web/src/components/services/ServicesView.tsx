'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BadgeCheck, Briefcase, Clock, Megaphone, Scale, Wallet } from 'lucide-react';
import { serviceCategories, services, type ServiceCategoryId } from '@forsa/data';
import { useApp } from '@/lib/store';
import { formatSAR } from '@/lib/format';
import { discountPercent, providerOf, serviceDuration } from '@/lib/services';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/layout/PageHeader';

export const SERVICE_ICON: Record<ServiceCategoryId, typeof Scale> = {
  legal: Scale,
  business: Briefcase,
  'design-marketing': Megaphone,
  'finance-advisory': Wallet,
};

/** S07 Services catalog (US-SRV-01): category tabs, clean prices, durations with units, discount badges. */
export function ServicesView() {
  const { t, locale } = useApp();
  const [cat, setCat] = useState<'all' | ServiceCategoryId>('all');
  const list = services.filter((s) => cat === 'all' || s.categoryId === cat);

  return (
    <>
      <PageHeader title={t('servicesPageTitle')} lead={t('servicesPageLead')} />
      <div className="container-page pb-28">
        <SegmentedControl
          label={t('category')}
          value={cat}
          onChange={setCat}
          scroll
          segments={[
            { value: 'all', label: t('allCategories'), count: services.length },
            ...serviceCategories.map((c) => ({ value: c.id, label: c.name[locale], count: services.filter((s) => s.categoryId === c.id).length })),
          ]}
        />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const Icon = SERVICE_ICON[s.categoryId];
            const p = providerOf(s);
            const off = discountPercent(s);
            const dur = serviceDuration(s, locale);
            return (
              <li key={s.id}>
                <Link href={`/services/${s.id}/`} className="flex h-full flex-col rounded-lg bg-bg-3 p-6 shadow-e1 ring-1 ring-separator/25 transition-shadow hover:shadow-e2">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-md bg-primary-tint text-primary">
                      <Icon size={20} aria-hidden />
                    </span>
                    {off && (
                      <Badge tone="primary">
                        <bdi className="tabular">-{off}%</bdi>
                      </Badge>
                    )}
                  </div>
                  <h2 className="t-headline mt-4">{s.title}</h2>
                  <p className="mt-1 line-clamp-2 text-[15px] text-label-2">{s.description}</p>
                  <p className="mt-3 flex items-center gap-1 text-[13px] text-label-2">
                    {p?.certified && <BadgeCheck size={14} aria-hidden className="text-success" />}
                    <span className="line-clamp-1">{p?.name}</span>
                  </p>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <div>
                      <p className="text-[12px] text-label-2">{t('startsFrom')}</p>
                      <p className="t-title3 tabular">
                        <bdi>{formatSAR(s.priceSar, locale)}</bdi>
                        {s.originalPriceSar && off && (
                          <s className="ms-2 text-[13px] font-normal text-label-3">
                            <bdi>{s.originalPriceSar.toLocaleString('en-US')}</bdi>
                          </s>
                        )}
                      </p>
                    </div>
                    {dur && (
                      <span className="flex max-w-[45%] items-center gap-1 text-end text-[12px] text-label-2">
                        <Clock size={12} aria-hidden className="shrink-0" />
                        <span className="line-clamp-2">{dur}</span>
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
