import { router } from 'expo-router';

import { useApp } from '@/store/app';

/**
 * Gate at the moment of action (US-AUTH-01): the action waits while the auth sheet is shown and
 * runs only after the sheet has FULLY dismissed (native-stack `transitionEnd` with closing=true),
 * so a follow-up presentation (another sheet or Modal) never collides with the dismissal.
 */
let pending: (() => void) | null = null;
let ready = false;

export function requireAuth(action: () => void) {
  if (useApp.getState().session) {
    action();
    return;
  }
  pending = action;
  ready = false;
  router.push('/auth');
}

/** Called by the auth sheet when sign-in succeeded (just before it dismisses itself). */
export function markAuthSucceeded() {
  ready = true;
}

/** Called by the auth sheet once its dismissal has finished. Runs the action only after a sign-in. */
export function flushPendingAuthAction() {
  const a = ready ? pending : null;
  pending = null;
  ready = false;
  a?.();
}
