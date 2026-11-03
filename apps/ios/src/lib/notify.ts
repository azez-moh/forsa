import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { translate } from '@/i18n';
import { useApp, type SentInquiry } from '@/store/app';
import { statusKey } from './format';

/**
 * US-IOS-05 push-notification stubs (local notifications only; no APNs/server).
 * - Pre-permission explainer is shown after the first meaningful action (first inquiry sent),
 *   never at launch. The system prompt follows only if the user taps "فعّل".
 * - Mock events (inquiry status changes) schedule a local notification tagged "تجريبي" that
 *   deep-links to the right screen when tapped.
 */

// Show banners while the app is in the foreground too (demo-friendly).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function notificationsGranted(): Promise<boolean> {
  try {
    const { granted } = await Notifications.getPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const res = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: true, allowSound: true } });
    return res.granted;
  } catch {
    return false;
  }
}

/** Schedule a local notification (mock). `url` is an in-app route opened when the user taps it. */
export async function notifyLocal(title: string, body: string, url: string, delaySeconds = 2) {
  if (!(await notificationsGranted())) return;
  const lang = useApp.getState().lang;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, subtitle: translate(lang, 'demo'), body, data: { url } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, delaySeconds) },
    });
  } catch {
    // simulator without notification support, etc.
  }
}

/** Deep-link from a tapped notification. Returns an unsubscribe function. */
export function listenForNotificationTaps(): () => void {
  const open = (resp: Notifications.NotificationResponse | null) => {
    const url = resp?.notification.request.content.data?.url;
    if (typeof url === 'string' && url.startsWith('/')) router.push(url as never);
  };
  // Cold start from a tapped notification. Clear it once handled, because the native module keeps
  // the last response for the life of the process and an in-app reload (language switch) would
  // otherwise reopen the same deep link.
  Notifications.getLastNotificationResponseAsync()
    .then((resp) => {
      if (!resp) return;
      open(resp);
      Notifications.clearLastNotificationResponse();
    })
    .catch(() => {});
  const sub = Notifications.addNotificationResponseReceivedListener(open);
  return () => sub.remove();
}

/**
 * Watch the store: when one of my sent inquiries changes status (e.g. the owner approves document
 * access in the demo), post a local notification that opens the listing.
 */
export function watchInquiryStatus(): () => void {
  let prev = new Map(useApp.getState().sent.map((q) => [q.id, q.status]));
  return useApp.subscribe((state) => {
    const next = new Map(state.sent.map((q) => [q.id, q.status]));
    for (const q of state.sent as SentInquiry[]) {
      const before = prev.get(q.id);
      if (before && before !== q.status) {
        const lang = state.lang;
        notifyLocal(
          translate(lang, q.docsApproved ? 'notifDocsTitle' : 'notifStatusTitle'),
          `${translate(lang, statusKey[q.status])}`,
          `/opportunity/${q.opportunityId}`,
        );
      }
    }
    prev = next;
  });
}
