'use client';

import { useApp } from '@/lib/store';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  const { t } = useApp();
  return (
    <div className="container-read flex flex-col items-center gap-4 pb-28 pt-40 text-center">
      <p className="tabular text-[72px] font-extrabold leading-none text-label-3">404</p>
      <h1 className="t-title1">{t('notFound')}</h1>
      <p className="text-[17px] text-label-2">{t('notFoundBody')}</p>
      <ButtonLink href="/" size="lg" className="mt-4">
        {t('backHome')}
      </ButtonLink>
    </div>
  );
}
