import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useT, type StringKey } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app';
import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { ScalePressable } from './Pressable';
import { Text } from './Text';

const TABS: Record<string, { label: StringKey; icon: string; iconActive: string }> = {
  '(discover)': { label: 'tabDiscover', icon: 'sparkle.magnifyingglass', iconActive: 'sparkle.magnifyingglass' },
  opportunities: { label: 'tabOpportunities', icon: 'square.grid.2x2', iconActive: 'square.grid.2x2.fill' },
  add: { label: 'tabAdd', icon: 'plus', iconActive: 'plus' },
  inbox: { label: 'tabInbox', icon: 'tray', iconActive: 'tray.fill' },
  profile: { label: 'tabProfile', icon: 'person.crop.circle', iconActive: 'person.crop.circle.fill' },
};

/**
 * Floating glass capsule tab bar (US-IOS-01): system material blur, hairline border,
 * center "+" opens the Add sheet (S05). Selection haptic on tab change.
 */
export function GlassTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { c, scheme } = useTheme();
  const { t } = useT();
  const badge = useApp((s) => s.incoming.filter((x) => x.unread).length);

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom - 6, 12) }]}>
      <View style={styles.shadow}>
      <View style={[styles.capsule, { borderColor: c.separator }]}>
        <BlurView
          intensity={80}
          tint={scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const meta = TABS[route.name];
            if (!meta) return null;
            const focused = state.index === index;
            const label = t(meta.label);
            const onPress = () => {
              if (route.name === 'add') {
                haptic.light();
                router.push('/listing/new');
                return;
              }
              const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                haptic.selection();
                navigateToTab(route.key);
              }
            };
            if (route.name === 'add') {
              return (
                <ScalePressable
                  key={route.key}
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityLabel={t('addTitle')}
                  style={styles.item}
                >
                  <View style={[styles.plus, { backgroundColor: c.primary }]}>
                    <Icon name="plus" size={22} color={c.onPrimary} weight="bold" />
                  </View>
                </ScalePressable>
              );
            }
            const showBadge = route.name === 'inbox' && badge > 0;
            return (
              <ScalePressable
                key={route.key}
                onPress={onPress}
                onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={showBadge ? `${label}، ${badge}` : label}
                testID={descriptors[route.key]?.options.tabBarButtonTestID}
                style={styles.item}
              >
                <View>
                  <Icon name={focused ? meta.iconActive : meta.icon} size={22} color={focused ? c.primary : c.labelSecondary} weight={focused ? 'semibold' : 'regular'} />
                  {showBadge ? (
                    <View style={[styles.badge, { backgroundColor: c.danger }]}>
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.2}
                  style={{ fontSize: 10, lineHeight: 13, fontWeight: focused ? '600' : '500', color: focused ? c.primary : c.labelSecondary }}
                >
                  {label}
                </Text>
              </ScalePressable>
            );
          })}
        </View>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'stretch' },
  shadow: { borderRadius: 32, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  capsule: { height: 64, borderRadius: 32, borderCurve: 'continuous', overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6 },
  item: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 2 },
  plus: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -4, end: -10, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 11, lineHeight: 14, fontWeight: '700' },
});
