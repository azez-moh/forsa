import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles, getArticle } from '@forsa/data';
import { ArticleView } from '@/components/content/ArticleView';

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  return { title: a?.title ?? 'مقال', description: a?.excerpt };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  return <ArticleView a={a} />;
}
