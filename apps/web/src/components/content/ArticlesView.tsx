'use client';

import Link from 'next/link';
import { articles } from '@forsa/data';
import { useApp } from '@/lib/store';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/layout/PageHeader';
import { Media } from '@/components/ui/Media';
import { typeLabel } from '@/lib/opportunity';

/** S12 Articles list (US-LRN-02). */
export function ArticlesView() {
  const { t, locale } = useApp();
  const [lead, ...rest] = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (
    <>
      <PageHeader title={t('articlesTitle')} lead={t('articlesLead')} />
      <div className="container-page pb-28">
        {lead && (
          <Link href={`/articles/${lead.slug}/`} className="group grid gap-6 md:grid-cols-2 md:items-center md:gap-12">
            <Media src={lead.image} alt="" categoryId="other" className="aspect-[16/10] rounded-xl" imgClassName="transition-transform duration-500 group-hover:scale-[1.03]" />
            <div>
              <Meta a={lead} />
              <h2 className="t-display-m mt-3 group-hover:text-primary">{lead.title}</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-label-2">{lead.excerpt}</p>
            </div>
          </Link>
        )}
        <ul className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <li key={a.slug}>
              <Link href={`/articles/${a.slug}/`} className="group block">
                <Media src={a.image} alt="" categoryId="other" className="aspect-[16/10] rounded-lg" imgClassName="transition-transform duration-500 group-hover:scale-[1.03]" />
                <div className="mt-4">
                  <Meta a={a} />
                  <h2 className="t-title3 mt-2 group-hover:text-primary">{a.title}</h2>
                  <p className="mt-2 line-clamp-2 text-[15px] text-label-2">{a.excerpt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  function Meta({ a }: { a: (typeof articles)[number] }) {
    return (
      <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-label-2">
        {a.relatedTypes?.[0] && <span className="font-bold text-primary">{typeLabel(a.relatedTypes[0], locale)}</span>}
        <bdi className="tabular">{formatDate(a.publishedAt, locale)}</bdi>
        <span aria-hidden>·</span>
        <span>
          <bdi className="tabular">{a.readingMinutes}</bdi> {t('readingTime')}
        </span>
      </p>
    );
  }
}
