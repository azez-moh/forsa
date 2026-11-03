'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { AppProvider, useApp } from '@/lib/store';
import { ViewTransitionListener } from '@/lib/viewTransition';
import { DocumentTitle } from '@/lib/DocumentTitle';
import { GlassNav } from './GlassNav';
import { TabBar } from './TabBar';
import { Footer } from './Footer';
import { AuthSheet } from '@/components/flows/AuthSheet';
import { Toast } from '@/components/ui/Toast';

function SkipLink() {
  const { t } = useApp();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-on-primary"
    >
      {t('skip')}
    </a>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <MotionConfig reducedMotion="user">
        <SkipLink />
        <GlassNav />
        <main id="main" tabIndex={-1} className="min-h-[70vh] outline-none">
          {children}
        </main>
        <Footer />
        <TabBar />
        <AuthSheet />
        <Toast />
        <ViewTransitionListener />
        <DocumentTitle />
      </MotionConfig>
    </AppProvider>
  );
}
