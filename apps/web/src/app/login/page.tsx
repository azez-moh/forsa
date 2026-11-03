import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginView } from '@/components/content/StaticPages';

export const metadata: Metadata = { title: 'تسجيل الدخول' };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginView />
    </Suspense>
  );
}
