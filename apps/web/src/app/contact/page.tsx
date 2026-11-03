import type { Metadata } from 'next';
import { ContactView } from '@/components/content/StaticPages';

export const metadata: Metadata = { title: 'تواصل معنا' };

export default function ContactPage() {
  return <ContactView />;
}
