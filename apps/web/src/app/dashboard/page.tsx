import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DashboardView } from '@/components/dashboard/DashboardView';

export const metadata: Metadata = { title: 'لوحتي' };

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <DashboardView />
    </Suspense>
  );
}
