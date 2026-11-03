import type { Metadata } from 'next';
import { ArticlesView } from '@/components/content/ArticlesView';

export const metadata: Metadata = { title: 'المقالات' };

export default function ArticlesPage() {
  return <ArticlesView />;
}
