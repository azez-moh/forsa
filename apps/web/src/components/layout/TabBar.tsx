'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, LayoutGrid, Plus, Inbox, UserRound } from 'lucide-react';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/cn';

/**
 * Floating glass tab bar on mobile web, mirroring the iOS tabs (S01–S06):
 * اكتشف · الفرص · (+) أضف · الوارد · حسابي.
 */
export function TabBar() {
  const { t, locale, pipeline, user } = useApp();
  const pathname = usePathname();
  const newCount = user ? pipeline.filter((p) => p.direction === 'received' && p.status === 'new').length : 0;
  const items = [
    { href: '/', label: locale === 'ar' ? 'اكتشف' : 'Discover', icon: Compass, match: (p: string) => p === '/' },
    { href: '/opportunities/', label: t('navOpportunities'), icon: LayoutGrid, match: (p: string) => p.startsWith('/opportunities') },
    { href: '/add/', label: locale === 'ar' ? 'أضف' : 'Add', icon: Plus, match: (p: string) => p.startsWith('/add'), primary: true },
    { href: '/dashboard/?tab=pipeline', label: locale === 'ar' ? 'الوارد' : 'Inbox', icon: Inbox, match: () => false, badge: newCount },
    { href: user ? '/dashboard/' : '/login/', label: t('navDashboard'), icon: UserRound, match: (p: string) => p.startsWith('/dashboard') || p.startsWith('/login') },
  ];
  return (
    <nav aria-label={t('navTabs')} className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden">
      <ul className="material-thick mx-auto flex h-16 max-w-md items-center justify-around rounded-full px-2 shadow-e3 ring-1 ring-separator/30">
        {items.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          return (
            <li key={it.label} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? 'page' : undefined}
                className={cn('relative mx-auto flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium', active ? 'text-primary-text' : 'text-label-2')}
              >
                {it.primary ? (
                  <span className="grid size-10 place-items-center rounded-full bg-primary text-on-primary">
                    <Icon size={22} aria-hidden />
                  </span>
                ) : (
                  <Icon size={22} aria-hidden strokeWidth={active ? 2.25 : 1.75} />
                )}
                <span className={cn(it.primary && 'sr-only')}>{it.label}</span>
                {!!it.badge && (
                  <span className="absolute end-[calc(50%-20px)] top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[11px] font-bold text-white tabular">
                    {it.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
