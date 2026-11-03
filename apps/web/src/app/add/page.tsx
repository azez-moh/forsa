import type { Metadata } from 'next';
import { AddWizard } from '@/components/add/AddWizard';

export const metadata: Metadata = { title: 'أضف فرصتك' };

export default function AddPage() {
  return <AddWizard />;
}
