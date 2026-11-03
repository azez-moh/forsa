import type { Metadata } from 'next';
import { FaqView } from '@/components/content/StaticPages';

export const metadata: Metadata = { title: 'الأسئلة الشائعة' };

export default function FaqPage() {
  return <FaqView />;
}
