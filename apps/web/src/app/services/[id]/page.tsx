import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getService, services } from '@forsa/data';
import { ServiceDetailView } from '@/components/services/ServiceDetailView';

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ id: String(s.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getService(Number(id))?.title ?? 'الخدمة' };
}

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = getService(Number(id));
  if (!s) notFound();
  return <ServiceDetailView s={s} />;
}
