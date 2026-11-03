'use client';

import Link from 'next/link';
import { platformContact, platformStats } from '@forsa/data';
import { useApp } from '@/lib/store';
import { Wordmark } from './Logo';
import type { DictKey } from '@/lib/i18n';
import { typeLabel, typeSlug, TYPE_ORDER } from '@/lib/opportunity';

/** Navy footer carrying the real IA (pain point 8). No IBAN anywhere (product decision 5). */
export function Footer() {
  const { t, locale } = useApp();
  const col = (title: string, links: Array<{ href: string; label: string; external?: boolean }>) => (
    <div>
      <h2 className="mb-4 text-[15px] font-bold text-white">{title}</h2>
      <ul className="space-y-1">
        {links.map((l) => (
          <li key={l.href + l.label}>
            {l.external ? (
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center text-[15px] text-white/65 hover:text-white">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="inline-flex min-h-9 items-center text-[15px] text-white/65 hover:text-white">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
  const k = (key: DictKey) => t(key);
  return (
    <footer className="bg-navy-deep pb-28 text-white md:pb-0" style={{ background: 'var(--fz-navy-deep)' }}>
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Wordmark label={t('brand')} onDark />
          <p className="mt-4 text-[15px] leading-relaxed text-white/65">{t('footerAbout')}</p>
          <p className="mt-4 text-[13px] text-white/50">
            {t('launched')}: <bdi className="tabular">25/06/2023</bdi>
          </p>
        </div>
        {col(
          k('footerExplore'),
          TYPE_ORDER.map((ty) => ({ href: `/opportunities/?type=${typeSlug(ty)}`, label: typeLabel(ty, locale, false) })),
        )}
        {col(k('footerCompany'), [
          { href: '/services/', label: k('navServices') },
          { href: '/consultants/', label: k('navConsultants') },
          { href: '/culture-center/', label: k('navCulture') },
          { href: '/articles/', label: k('navArticles') },
          { href: '/about/', label: k('navAbout') },
        ])}
        {col(k('footerHelp'), [
          { href: '/faq/', label: k('navFaq') },
          { href: '/contact/', label: k('navContact') },
          { href: `mailto:${platformContact.email}`, label: platformContact.email, external: true },
          { href: platformContact.whatsapp, label: k('whatsapp'), external: true },
        ])}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-[13px] text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © <bdi className="tabular">{new Date(platformStats.asOf).getUTCFullYear()}</bdi> {t('footerRights')}
          </p>
          <p>{t('footerConcept')}</p>
        </div>
      </div>
    </footer>
  );
}
