'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { articles, consultants, getOpportunity, services } from '@forsa/data';
import { useApp } from './store';
import type { DictKey } from './i18n';

/** Static routes -> dictionary key for their page title. */
const ROUTE_TITLES: Record<string, DictKey> = {
  '/opportunities/': 'exploreTitle',
  '/add/': 'addTitle',
  '/dashboard/': 'dashTitle',
  '/services/': 'servicesPageTitle',
  '/consultants/': 'consultantsPageTitle',
  '/culture-center/': 'cultureTitle',
  '/articles/': 'articlesTitle',
  '/login/': 'loginPageTitle',
  '/about/': 'aboutTitle',
  '/faq/': 'faqTitle',
  '/contact/': 'contactTitle',
};

/**
 * Keeps <title> in the active locale (QA P2-4). Static metadata is Arabic (the default locale);
 * this swaps it on the client whenever the route or language changes. Listing, service, consultant
 * and article names are Arabic-only data and stay as they are.
 */
export function DocumentTitle() {
  const { t, locale, hydrated } = useApp();
  const raw = usePathname();
  useEffect(() => {
    if (!hydrated) return;
    const path = raw.endsWith('/') ? raw : `${raw}/`;
    const brand = t('brand');
    let page: string | null = null;
    const key = ROUTE_TITLES[path];
    if (key) page = t(key);
    else if (path === '/') page = null;
    else {
      const [, section, id] = path.split('/');
      if (section === 'opportunities') page = getOpportunity(Number(id))?.title ?? null;
      else if (section === 'services') page = services.find((s) => String(s.id) === id)?.title ?? null;
      else if (section === 'consultants') page = consultants.find((c) => String(c.id) === id)?.name ?? null;
      else if (section === 'articles') page = articles.find((a) => a.slug === id)?.title ?? null;
      else page = t('notFound');
    }
    const want = page ? `${page} · ${brand}` : `${brand} — ${t('tagline')}`;
    const apply = () => {
      if (document.title !== want) document.title = want;
    };
    apply();
    // Next re-applies route metadata after navigation; keep the localized title in place.
    const head = document.querySelector('head');
    const mo = head ? new MutationObserver(apply) : null;
    mo?.observe(head!, { subtree: true, childList: true, characterData: true });
    const id = window.setTimeout(apply, 50);
    return () => {
      mo?.disconnect();
      window.clearTimeout(id);
    };
  }, [raw, locale, hydrated, t]);
  return null;
}
