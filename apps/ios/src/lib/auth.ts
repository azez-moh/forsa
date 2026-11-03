import { router } from 'expo-router';

import { useApp } from '@/store/app';

/** Action waiting for sign-in. The auth sheet runs it after a successful sign-in (US-AUTH: gate at the moment of action). */
let pending: (() => void) | null = null;

export function requireAuth(action: () => void) {
  if (useApp.getState().session) {
    action();
    return;
  }
  pending = action;
  router.push('/auth');
}

export function runPendingAuthAction() {
  const a = pending;
  pending = null;
  if (a) setTimeout(a, 350); // after the sheet has dismissed
}

export function clearPendingAuthAction() {
  pending = null;
}
