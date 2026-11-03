import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { requestNotificationPermission } from '@/lib/notify';
import { useApp } from '@/store/app';
import { useTheme } from '@/theme';

import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';
import { Card, DemoTag } from './ui';

/**
 * US-IOS-05 pre-permission explainer. Shown once, after the first meaningful action, before the
 * iOS system prompt. Nothing is requested unless the user taps "فعّل التنبيهات".
 */
export function NotifyPrompt({ onDone }: { onDone?: (granted: boolean) => void }) {
  const { c } = useTheme();
  const { t } = useT();
  const asked = useApp((s) => s.notifAsked);
  const [hidden, setHidden] = useState(false);
  if (asked || hidden) return null;
  const close = (granted: boolean) => {
    useApp.setState({ notifAsked: true });
    setHidden(true);
    onDone?.(granted);
  };
  return (
    <Animated.View entering={FadeIn.delay(400)} style={{ alignSelf: 'stretch' }}>
      <Card style={{ gap: 10, backgroundColor: c.primaryTint }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="bell.badge.fill" size={22} color={c.primary} />
          <Text variant="headline" style={{ flex: 1 }}>
            {t('notifAskTitle')}
          </Text>
          <DemoTag />
        </View>
        <Text variant="subhead" color="labelSecondary">
          {t('notifAskBody')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            title={t('notifEnable')}
            size="medium"
            style={{ flex: 1 }}
            full
            onPress={async () => {
              const granted = await requestNotificationPermission();
              if (granted) haptic.success();
              close(granted);
            }}
          />
          <Button title={t('notifLater')} variant="gray" size="medium" style={{ flex: 1 }} full onPress={() => close(false)} />
        </View>
      </Card>
    </Animated.View>
  );
}
