import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOpportunity, opportunities } from '@forsa/data';
import { DetailView } from '@/components/detail/DetailView';

export const dynamicParams = false;

export function generateStaticParams() {
  return opportunities.map((o) => ({ id: String(o.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const o = getOpportunity(Number(id));
  return { title: o?.title ?? 'الفرصة', description: o?.shortDescription };
}

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = getOpportunity(Number(id));
  if (!o) notFound();
  return <DetailView o={o} />;
}
