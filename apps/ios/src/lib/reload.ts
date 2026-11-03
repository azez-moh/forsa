import * as Updates from 'expo-updates';
import { DevSettings, I18nManager } from 'react-native';

/**
 * Switching between Arabic (RTL) and English (LTR) needs a JS reload, because I18nManager's
 * direction is read at startup. Release builds use expo-updates reloadAsync; dev builds and
 * Expo Go fall back to DevSettings.reload(). Returns false when neither is possible.
 */
export async function applyDirection(rtl: boolean): Promise<boolean> {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(rtl);
  try {
    if (!__DEV__ && Updates.isEnabled) {
      await Updates.reloadAsync();
      return true;
    }
  } catch {
    // fall through
  }
  try {
    DevSettings.reload();
    return true;
  } catch {
    return false;
  }
}
