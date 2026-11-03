import { Stack } from 'expo-router';

import { largeTitleOptions } from '@/components/Screen';
import { useT } from '@/i18n';
import { useTheme } from '@/theme';

export default function DiscoverStack() {
  const { c } = useTheme();
  const { t } = useT();
  return (
    <Stack screenOptions={{ ...largeTitleOptions(c), contentStyle: { backgroundColor: c.groupedBg } }}>
      <Stack.Screen name="index" options={{ title: t('tabDiscover') }} />
    </Stack>
  );
}
