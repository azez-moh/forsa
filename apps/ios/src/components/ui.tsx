import { radii } from '@forsa/tokens';
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { useT } from '@/i18n';
import { announce } from '@/lib/a11y';
import { MARGIN, useTheme } from '@/theme';

import { Button } from './Button';
import { Icon } from './Icon';
import { ScalePressable } from './Pressable';
import { Text } from './Text';

export function Badge({ label, tone = 'primary', icon }: { label: string; tone?: 'primary' | 'success' | 'warning' | 'neutral' | 'danger'; icon?: string }) {
  const { c } = useTheme();
  const fg = { primary: c.primary, success: c.success, warning: c.warning, neutral: c.labelSecondary, danger: c.danger }[tone];
  const bg = {
    primary: c.primaryTint,
    success: 'rgba(52,199,89,0.14)',
    warning: 'rgba(255,149,0,0.14)',
    neutral: c.fillTertiary,
    danger: 'rgba(255,59,48,0.12)',
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon ? <Icon name={icon} size={12} color={fg} weight="semibold" /> : null}
      <Text variant="caption1" weight="600" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}

/** Small "تجريبي" tag on every mocked step (OTP, Nafath, uploads). */
export function DemoTag() {
  const { t } = useT();
  return <Badge label={t('demo')} tone="warning" icon="flask" />;
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="title3" accessibilityRole="header" style={{ flex: 1 }}>
        {title}
      </Text>
      {action && onAction ? <Button title={action} variant="plain" size="medium" onPress={onAction} /> : null}
    </View>
  );
}

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  const { c } = useTheme();
  return (
    <View
      style={[
        { backgroundColor: c.card, borderRadius: radii.lg, borderCurve: 'continuous', padding: padded ? 16 : 0, overflow: 'hidden' },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Inset grouped list row (Settings style), 44pt minimum. */
export function Row({
  title,
  subtitle,
  icon,
  iconBg,
  value,
  onPress,
  last,
  destructive,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  iconBg?: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
  destructive?: boolean;
}) {
  const { c } = useTheme();
  return (
    <ScalePressable onPress={onPress} disabled={!onPress} pressScale={0.99} accessibilityRole={onPress ? 'button' : undefined}>
      <View style={[styles.row]}>
        {icon ? (
          <View style={[styles.rowIcon, { backgroundColor: iconBg ?? c.primary }]}>
            <Icon name={icon} size={16} color="#FFFFFF" weight="semibold" />
          </View>
        ) : null}
        <View style={[styles.rowBody, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.separator }]}>
          <View style={{ flex: 1 }}>
            <Text style={destructive ? { color: c.danger } : undefined}>{title}</Text>
            {subtitle ? (
              <Text variant="footnote" color="labelSecondary">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {value ? (
            <Text variant="body" color="labelSecondary">
              {value}
            </Text>
          ) : null}
          {onPress && !destructive ? <Icon name="chevron.forward" directional size={14} color={c.labelTertiary} weight="semibold" /> : null}
        </View>
      </View>
    </ScalePressable>
  );
}

export function EmptyState({ icon, title, body, action, onAction }: { icon: string; title: string; body?: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={styles.empty}>
      <Icon name={icon} size={44} color={c.labelTertiary} />
      <Text variant="title3" align="center">
        {title}
      </Text>
      {body ? (
        <Text variant="subhead" color="labelSecondary" align="center">
          {body}
        </Text>
      ) : null}
      {action && onAction ? <Button title={action} variant="tinted" size="medium" onPress={onAction} style={{ alignSelf: 'center', marginTop: 8 }} /> : null}
    </View>
  );
}

/** Lightweight toast (HUD), auto-dismiss. */
let pushToast: ((msg: string) => void) | null = null;
export const toast = (msg: string) => {
  pushToast?.(msg);
  announce(msg);
};

export function ToastHost() {
  const { c } = useTheme();
  const [msg, setMsg] = useState<{ text: string; key: number } | null>(null);
  useEffect(() => {
    pushToast = (text) => setMsg({ text, key: Date.now() });
    return () => {
      pushToast = null;
    };
  }, []);
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), 2200);
    return () => clearTimeout(id);
  }, [msg]);
  if (!msg) return null;
  return (
    <View pointerEvents="none" style={styles.toastWrap}>
      <Animated.View
        key={msg.key}
        entering={FadeInUp.springify().damping(18)}
        exiting={FadeOutUp.duration(200)}
        style={[styles.toast, { backgroundColor: c.navy }]}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        <Icon name="checkmark.circle.fill" size={18} color="#FFFFFF" />
        <Text variant="subhead" weight="600" style={{ color: '#FFFFFF' }}>
          {msg.text}
        </Text>
      </Animated.View>
    </View>
  );
}

export function Divider() {
  const { c } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.separator, marginVertical: 12 }} />;
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <ScalePressable
      onPress={onPress}
      haptics="selection"
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      hitSlop={{ top: 6, bottom: 6 }}
      style={[
        styles.chip,
        { backgroundColor: selected ? c.primary : c.fillTertiary },
      ]}
    >
      <Text variant="subhead" weight={selected ? '600' : '400'} style={{ color: selected ? c.onPrimary : c.labelPrimary }}>
        {label}
      </Text>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.xs, alignSelf: 'flex-start' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: MARGIN, marginTop: 32, marginBottom: 12, minHeight: 44 },
  row: { flexDirection: 'row', alignItems: 'center', paddingStart: 16, minHeight: 44, gap: 12 },
  rowIcon: { width: 29, height: 29, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingEnd: 16, gap: 8, minHeight: 44 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 8 },
  toastWrap: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center', zIndex: 1000 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, minHeight: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});

/** Inline error text that VoiceOver announces when it appears. */
export function ErrorText({ children, align }: { children: string; align?: 'center' }) {
  useEffect(() => {
    announce(children);
  }, [children]);
  return (
    <Text variant="footnote" color="danger" align={align} accessibilityRole="alert">
      {children}
    </Text>
  );
}
