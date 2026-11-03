/**
 * Web preview: no local notifications (expo-notifications has no web scheduler). Same API as
 * notify.ts so screens don't branch; the explainer card still shows and records the choice.
 */
export async function notificationsGranted(): Promise<boolean> {
  return false;
}
export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}
export async function notifyLocal(_title: string, _body: string, _url: string, _delaySeconds = 2): Promise<void> {}
export function listenForNotificationTaps(): () => void {
  return () => {};
}
export function watchInquiryStatus(): () => void {
  return () => {};
}
