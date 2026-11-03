'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { useApp } from '@/lib/store';
import { publicConsultants } from '@/lib/services';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConsultantAvatar, ReputationLabel } from '@/components/ui/Reputation';

/** S09 Consultants list (US-CNS-01): specialty chips, honest reputation, fee per session. */
export function ConsultantsView() {
  const { t } = useApp();
  const list = publicConsultants();
  const specialties = Array.from(new Set(list.map((c) => c.specialty)));
  const [spec, setSpec] = useState<string | null>(null);
  const shown = list.filter((c) => !spec || c.specialty === spec);

  return (
    <>
      <PageHeader title={t('consultantsPageTitle')} lead={t('consultantsPageLead')} />
      <div className="container-page pb-28">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label={t('expertise')}>
          <Chip selected={!spec} onClick={() => setSpec(null)}>
            {t('allCategories')}
          </Chip>
          {specialties.map((s) => (
            <Chip key={s} selected={spec === s} onClick={() => setSpec(s)}>
              {s}
            </Chip>
          ))}
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <li key={c.id}>
              <Link href={`/consultants/${c.id}/`} className="flex h-full flex-col gap-4 rounded-lg bg-bg-3 p-6 shadow-e1 ring-1 ring-separator/25 transition-shadow hover:shadow-e2">
                <div className="flex items-center gap-4">
                  <ConsultantAvatar name={c.name} />
                  <div className="min-w-0">
                    <p className="t-headline flex items-center gap-1.5">
                      {c.name}
                      {c.certified && <BadgeCheck size={16} aria-label={t('certified')} className="text-success" />}
                    </p>
                    <p className="text-[15px] text-label-2">{c.specialty}</p>
                  </div>
                </div>
                <p className="line-clamp-3 text-[15px] leading-relaxed text-label-2">{c.bio}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                  <Badge>
                    <bdi className="tabular">{c.yearsExperience}</bdi>&nbsp;{t('yearsExp')}
                  </Badge>
                  <ReputationLabel reviews={c.reviews} rating={c.rating} />
                </div>
                <p className="border-t border-separator/40 pt-4 text-[15px]">
                  <bdi className="tabular font-bold">{c.feeSar}</bdi> {t('bookingFee')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-[13px] text-label-2">{t('consultDisclaimer')}</p>
      </div>
    </>
  );
}
