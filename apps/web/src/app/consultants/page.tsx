import type { Metadata } from 'next';
import { ConsultantsView } from '@/components/consultants/ConsultantsView';

export const metadata: Metadata = { title: 'المستشارون المعتمدون' };

export default function ConsultantsPage() {
  return <ConsultantsView />;
}
