import * as Haptics from 'expo-haptics';

/** Haptic map from US-IOS-02. Every call is fire-and-forget and never throws. */
const safe = (p: () => Promise<void>) => {
  try {
    p().catch(() => {});
  } catch {
    // devices without a Taptic Engine, or haptics disabled: do nothing
  }
};

export const haptic = {
  /** Segmented control, filter and tab changes */
  selection: () => safe(() => Haptics.selectionAsync()),
  /** Save, light taps on primary buttons */
  light: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** NDA signed, listing published, booking confirmed, inquiry sent */
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Validation failures */
  error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  warning: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
