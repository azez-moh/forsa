import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CultureView } from '@/components/content/CultureView';

export const metadata: Metadata = { title: 'مركز الثقافة والأعمال' };

export default function CulturePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CultureView />
    </Suspense>
  );
}
