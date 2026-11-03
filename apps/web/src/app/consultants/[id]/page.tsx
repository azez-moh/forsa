import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { consultants, getConsultant } from '@forsa/data';
import { ConsultantDetailView } from '@/components/consultants/ConsultantDetailView';

export const dynamicParams = false;

export function generateStaticParams() {
  return consultants.filter((c) => !c.placeholder).map((c) => ({ id: String(c.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getConsultant(Number(id))?.name ?? 'المستشار' };
}

export default async function ConsultantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getConsultant(Number(id));
  if (!c || c.placeholder) notFound();
  return <ConsultantDetailView c={c} />;
}
