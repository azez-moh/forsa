'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Languages, Menu, Moon, Plus, Sun, UserRound } from 'lucide-react';
import { useApp } from '@/lib/store';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { cn } from '@/lib/cn';
import { ButtonLink, IconButton } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Wordmark } from './Logo';
import type { DictKey } from '@/lib/i18n';

export const NAV_ITEMS: Array<{ href: string; key: DictKey; wide?: boolean }> = [
  { href: '/opportunities/', key: 'navOpportunities' },
  { href: '/services/', key: 'navServices' },
  { href: '/consultants/', key: 'navConsultants' },
  { href: '/culture-center/', key: 'navLearn' },
  { href: '/articles/', key: 'navArticles', wide: true },
  { href: '/about/', key: 'navAbout', wide: true },
];

/**
 * Glass navigation (design system §11.6): transparent over the navy hero on "/", frosts with
 * material.bar + a hairline after 8px of scroll. 52px high. Wordmark at inline-start, one filled CTA
 * at inline-end. Every nav item has a real href (fixes pain point 8).
 */
export function GlassNav() {
  const { t, locale, setLocale, theme, setTheme, user } = useApp();
  const pathname = usePathname();
  const overHero = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setMenu(false), [pathname]);

  const transparent = overHero && !scrolled;
  // Hydration-safe (QA P1-1): the OS preference is read through useSyncExternalStore with a server snapshot of false.
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const isDark = theme === 'dark' || (theme === 'system' && systemDark);

  const linkCls = (href: string) =>
    cn(
      'relative inline-flex h-11 items-center whitespace-nowrap rounded-full px-3 text-[15px] font-medium transition-colors',
      transparent ? 'text-white/80 hover:text-white' : 'text-label-2 hover:text-label',
      pathname.startsWith(href) && (transparent ? 'text-white' : 'text-label font-bold'),
    );

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300',
          transparent ? 'bg-transparent' : 'material-bar shadow-[0_0.5px_0_var(--color-separator)]',
        )}
      >
        <div className="container-page flex h-[52px] items-center gap-4 md:h-16">
          <Link href="/" aria-label={t('brand')} className="-ms-1 rounded-md p-1">
            <Wordmark label={t('brand')} onDark={transparent} />
          </Link>
          <nav aria-label={t('navMain')} className="ms-4 hidden flex-1 items-center gap-0.5 lg:flex">
            {NAV_ITEMS.map((n) => (
              <Link key={n.href} href={n.href} className={cn(linkCls(n.href), n.wide && 'hidden xl:inline-flex')} aria-current={pathname.startsWith(n.href) ? 'page' : undefined}>
                {t(n.key)}
              </Link>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              aria-label={t('langToggleLabel')}
              lang={locale === 'ar' ? 'en' : 'ar'}
              className={cn(
                'inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-[15px] font-medium',
                transparent ? 'text-white/85 hover:text-white' : 'text-label-2 hover:text-label',
              )}
            >
              <Languages size={17} aria-hidden />
              <span className="hidden sm:inline">{t('langToggle')}</span>
            </button>
            <span className="hidden xl:contents">
              <IconButton
                label={t('themeToggle')}
                variant="plain"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={transparent ? 'text-white/85' : 'text-label-2'}
              >
                {isDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
              </IconButton>
            </span>
            <Link
              href={user ? '/dashboard/' : '/login/'}
              className={cn(
                'hidden h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[15px] font-medium md:inline-flex',
                transparent ? 'text-white/85 hover:text-white' : 'text-label-2 hover:text-label',
              )}
            >
              <UserRound size={17} aria-hidden />
              {user ? t('navDashboard') : t('navLogin')}
            </Link>
            <span className="hidden md:contents">
              <ButtonLink href="/add/" size="md" icon={<Plus size={17} aria-hidden />}>
                {t('navAdd')}
              </ButtonLink>
            </span>
            <IconButton
              label={t('navMenu')}
              variant="plain"
              onClick={() => setMenu(true)}
              className={cn('lg:hidden', transparent ? 'text-white' : 'text-label')}
              aria-expanded={menu}
            >
              <Menu size={22} aria-hidden />
            </IconButton>
          </div>
        </div>
      </header>

      <Sheet open={menu} onClose={() => setMenu(false)} title={t('navMenu')} closeLabel={t('close')} size="sm">
        <nav aria-label={t('navMain')} className="flex flex-col">
          {[{ href: '/', key: 'navHome' as DictKey }, ...NAV_ITEMS.map((n) => (n.href === '/culture-center/' ? { ...n, key: 'navCulture' as DictKey } : n)), { href: '/faq/', key: 'navFaq' as DictKey }, { href: '/contact/', key: 'navContact' as DictKey }].map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex min-h-12 items-center border-b border-separator/40 text-[17px] text-label last:border-0"
              onClick={() => setMenu(false)}
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>
        <div className="mt-6 grid gap-3">
          <ButtonLink href="/add/" size="lg" full icon={<Plus size={18} aria-hidden />}>
            {t('navAdd')}
          </ButtonLink>
          <ButtonLink href={user ? '/dashboard/' : '/login/'} variant="gray" size="lg" full>
            {user ? t('navDashboard') : t('navLogin')}
          </ButtonLink>
          <button type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')} className="min-h-11 text-[15px] text-primary-text">
            {t('themeToggle')}
          </button>
        </div>
      </Sheet>
    </>
  );
}
