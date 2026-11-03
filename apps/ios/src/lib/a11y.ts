import { AccessibilityInfo, Platform } from 'react-native';

/** Speak a message with VoiceOver (accessibilityLiveRegion is Android-only). */
export function announce(message: string | null | undefined) {
  if (!message) return;
  if (Platform.OS === 'ios') {
    // queue: don't cut off what VoiceOver is currently reading (e.g. the button label)
    AccessibilityInfo.announceForAccessibilityWithOptions(message, { queue: true });
  } else {
    AccessibilityInfo.announceForAccessibility(message);
  }
}
