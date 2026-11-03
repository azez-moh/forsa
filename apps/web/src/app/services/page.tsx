import type { Metadata } from 'next';
import { ServicesView } from '@/components/services/ServicesView';

export const metadata: Metadata = { title: 'الخدمات' };

export default function ServicesPage() {
  return <ServicesView />;
}
