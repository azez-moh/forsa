import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ExploreView } from '@/components/explore/ExploreView';

export const metadata: Metadata = { title: 'الفرص' };

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ExploreView />
    </Suspense>
  );
}
