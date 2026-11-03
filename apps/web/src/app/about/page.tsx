import type { Metadata } from 'next';
import { AboutView } from '@/components/content/StaticPages';

export const metadata: Metadata = { title: 'عن فرصة وتمكين' };

export default function AboutPage() {
  return <AboutView />;
}
