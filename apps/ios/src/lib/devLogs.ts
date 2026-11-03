import { LogBox } from 'react-native';

/**
 * Imported first by the root layout, so it runs before expo-notifications is evaluated.
 * Expo Go logs "`expo-notifications` functionality is not fully supported in Expo Go" on import.
 * Local notifications (all this app uses) do work there, so hide that banner in dev builds only.
 */
if (__DEV__) {
  LogBox.ignoreLogs(['`expo-notifications` functionality is not fully supported in Expo Go']);
}
