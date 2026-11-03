import * as Updates from 'expo-updates';
import { DevSettings, I18nManager } from 'react-native';

/**
 * Switching between Arabic (RTL) and English (LTR) needs a JS reload, because I18nManager's
 * direction is read at startup.
 * - Release / TestFlight: Updates.reloadAsync(). It works without an `updates.url` too (the
 *   disabled controller still relaunches the React instance), so there is no isEnabled guard.
 * - Dev / Expo Go: DevSettings.reload(). It is a silent no-op in release builds, so it is only
 *   used under __DEV__.
 * Returns false when no reload could be started; callers must then continue in the current direction.
 */
export async function applyDirection(rtl: boolean): Promise<boolean> {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(rtl);
  if (__DEV__) {
    try {
      DevSettings.reload();
      return true;
    } catch {
      // fall through to expo-updates
    }
  }
  try {
    await Updates.reloadAsync();
    return true;
  } catch {
    return false;
  }
}
