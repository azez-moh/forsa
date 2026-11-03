'use client';

import Link from 'next/link';
import { useRef, type MouseEvent } from 'react';
import { Bookmark, BadgeCheck, Eye, Lock, MapPin } from 'lucide-react';
import type { Opportunity } from '@forsa/data';
import { useApp } from '@/lib/store';
import { cardFacts, categoryName, cityName, priceLabelKey, TYPE_COLOR_VAR, typeLabel } from '@/lib/opportunity';
import { useTransitionNavigate } from '@/lib/viewTransition';
import { formatCompact, formatSAR } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Media } from './Media';
import { Badge } from './Badge';

/** Real cards are one link; the wizard's live preview renders the same markup as an inert div. */
function Shell({ preview, href, onClick, className, children, ...rest }: { preview: boolean; href: string; onClick: (e: MouseEvent<HTMLAnchorElement>) => void; className: string; children: React.ReactNode; 'aria-label'?: string }) {
  if (preview) return <div className={className}>{children}</div>;
  return (
    <Link href={href} onClick={onClick} className={className} {...rest}>
      {children}
    </Link>
  );
}

/**
 * Opportunity card (US-OPP-01, US-OPP-03, US-OPP-04, US-A11Y-04).
 * Radius 16, media 16:10, type dot + label, headline title, city · category, labelled price and facts.
 * The whole card is one link (reads as one element); "حفظ" sits outside the link.
 */
export function OpportunityCard({ o, priority, className, preview = false }: { o: Opportunity; priority?: boolean; className?: string; preview?: boolean }) {
  const { t, locale, isSaved, toggleSaved, showToast } = useApp();
  const media = useRef<HTMLDivElement>(null);
  const navigate = useTransitionNavigate();
  const href = `/opportunities/${o.id}/`;
  const saved = isSaved(o.id);
  const facts = cardFacts(o, locale);
  const type = typeLabel(o.type, locale);
  const city = cityName(o.cityId, locale);
  const cat = categoryName(o.categoryId, locale);
  const price = formatSAR(o.priceSar, locale);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href, media.current, `opp-media-${o.id}`);
  };

  const a11y = [o.title, type, city, price, o.verified ? t('verified') : null].filter(Boolean).join('، ');

  return (
    <article className={cn('group relative h-full', className)}>
      <Shell
        preview={preview}
        href={href}
        onClick={onClick}
        aria-label={preview ? undefined : a11y}
        className="flex h-full flex-col overflow-hidden rounded-lg bg-bg-3 shadow-e1 ring-1 ring-separator/25 transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:shadow-e2 focus-visible:outline-offset-4"
      >
        <div ref={media} className="relative">
          <Media
            src={o.images[0]}
            alt=""
            categoryId={o.categoryId}
            priority={priority}
            className="aspect-[16/10]"
            imgClassName="transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
          <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
            {o.verified && (
              <Badge tone="success" className="bg-bg/90 backdrop-blur" icon={<BadgeCheck size={13} aria-hidden />}>
                {t('verified')}
              </Badge>
            )}
            {o.featured && <Badge className="bg-bg/90 text-label backdrop-blur">{t('featured')}</Badge>}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <p className="flex items-center gap-2 text-[13px] font-medium text-label-2">
            <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: TYPE_COLOR_VAR[o.type] }} />
            {type}
            {o.ndaRequired && (
              <span className="inline-flex items-center gap-1 text-label-2">
                <span aria-hidden>·</span>
                <Lock size={12} aria-hidden /> NDA
              </span>
            )}
          </p>
          <h3 className="t-headline line-clamp-2 text-label">{o.title}</h3>
          <p className="flex items-center gap-1 text-[15px] text-label-2">
            <MapPin size={14} aria-hidden className="shrink-0" />
            <span className="truncate">
              {city} · {cat}
            </span>
          </p>
          {facts.length > 0 && (
            <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
              {facts.map((f) => (
                <div key={f.key} className="flex gap-1">
                  <dt className="text-label-2">{t(f.key)}</dt>
                  <dd className="tabular font-bold text-label">
                    <bdi>{f.text}</bdi>
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            <div>
              <p className="text-[12px] text-label-2">{t(priceLabelKey(o.type))}</p>
              <p className="t-title3 tabular text-label">
                <bdi>{price}</bdi>
              </p>
            </div>
            <p className="flex items-center gap-1 text-[12px] text-label-2">
              <Eye size={13} aria-hidden />
              <bdi className="tabular">{formatCompact(o.views, locale)}</bdi> {t('views')}
            </p>
          </div>
        </div>
      </Shell>
      {!preview && <button
        type="button"
        onClick={() => {
          toggleSaved(o.id);
          showToast(saved ? t('unsaveToast') : t('saveToast'));
        }}
        aria-pressed={saved}
        aria-label={`${saved ? t('saved') : t('save')}: ${o.title}`}
        className="absolute end-3 top-3 grid size-11 place-items-center rounded-full bg-bg/85 text-label shadow-e1 backdrop-blur transition-transform active:scale-[0.97]"
      >
        <Bookmark size={18} aria-hidden className={saved ? 'fill-primary text-primary' : ''} />
      </button>}
    </article>
  );
}
