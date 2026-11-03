'use client';

import Link from 'next/link';
import { Share2 } from 'lucide-react';
import { articles, opportunities, type Article } from '@forsa/data';
import { useApp } from '@/lib/store';
import { formatDate } from '@/lib/format';
import { Media } from '@/components/ui/Media';
import { Button, ButtonLink } from '@/components/ui/Button';
import { OpportunityCard } from '@/components/ui/OpportunityCard';
import { Breadcrumbs } from '@/components/layout/PageHeader';

const slugify = (_s: string, i: number) => `h-${i}`;

/**
 * S12 Article detail (US-LRN-02): author fallback "فريق فرصة وتمكين", date, reading time, TOC from
 * `headings`, share, related opportunities by `relatedTypes`, and a CTA. Body is the condensed excerpt
 * with section headings from the data; the full text links to the live article.
 */
export function ArticleView({ a }: { a: Article }) {
  const { t, locale, showToast } = useApp();
  const related = opportunities.filter((o) => a.relatedTypes?.includes(o.type)).sort((x, y) => y.views - x.views).slice(0, 3);
  const more = articles.filter((x) => x.slug !== a.slug).slice(0, 2);

  const share = async () => {
    try {
      const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
      if (nav.share) await nav.share({ title: a.title, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        showToast(t('copied'));
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <article className="pb-28 pt-20 md:pt-24">
      <div className="container-read">
        <Breadcrumbs label={t('breadcrumbHome')} items={[{ href: '/articles/', label: t('articlesTitle') }, { label: a.title }]} />
        <h1 className="t-display-m mt-6">{a.title}</h1>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[15px] text-label-2">
            <span className="font-bold text-label">{t('author')}</span> · <bdi className="tabular">{formatDate(a.publishedAt, locale)}</bdi> · <bdi className="tabular">{a.readingMinutes}</bdi> {t('readingTime')}
          </p>
          <Button variant="gray" icon={<Share2 size={17} aria-hidden />} onClick={share}>
            {t('share')}
          </Button>
        </div>
      </div>
      <div className="container-page mt-10">
        <Media src={a.image} alt="" categoryId="other" priority className="mx-auto aspect-[16/9] max-w-5xl rounded-xl" />
      </div>
      <div className="container-read mt-12">
        <p className="text-[21px] leading-[1.85] text-label">{a.excerpt}</p>
        {a.headings.length > 0 && (
          <nav aria-labelledby="toc-h" className="mt-10 rounded-xl bg-bg-2 p-6">
            <h2 id="toc-h" className="t-headline mb-3">
              {t('inThisArticle')}
            </h2>
            <ol className="list-decimal space-y-2 ps-5 text-[16px] leading-relaxed text-label-2 marker:tabular">
              {a.headings.map((h, i) => (
                <li key={h}>
                  <a href={`#${slugify(h, i)}`} className="hover:text-primary">
                    {h}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="mt-10 space-y-8">
          {a.headings.map((h, i) => (
            <section key={h} id={slugify(h, i)} className="scroll-mt-24">
              <h2 className="t-title2">{h}</h2>
            </section>
          ))}
        </div>
        {a.sourceUrl && (
          <p className="mt-10">
            <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[15px] font-bold text-primary hover:underline">
              {t('readOriginal')}
            </a>
          </p>
        )}
      </div>

      {related.length > 0 && (
        <section className="container-page mt-20" aria-labelledby="rel-h">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 id="rel-h" className="t-title1">
              {t('relatedOpps')}
            </h2>
            <ButtonLink href="/add/" variant="tinted">
              {t('addCta')}
            </ButtonLink>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((o) => (
              <li key={o.id}>
                <OpportunityCard o={o} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="container-page mt-20" aria-labelledby="more-h">
        <h2 id="more-h" className="t-title1 mb-6">
          {t('relatedArticles')}
        </h2>
        <ul className="grid gap-6 md:grid-cols-2">
          {more.map((m) => (
            <li key={m.slug}>
              <Link href={`/articles/${m.slug}/`} className="flex h-full gap-4 rounded-lg bg-bg-2 p-4 hover:bg-fill-3">
                <Media src={m.image} alt="" categoryId="other" className="aspect-square w-24 shrink-0 rounded-md" />
                <span className="t-headline">{m.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
