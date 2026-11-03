import { button, type ButtonSize } from '@forsa/tokens';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useT } from '@/i18n';
import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { ScalePressable } from './Pressable';
import { Text } from './Text';

/** `onDark`: gray-style button for dark surfaces (the navy hero): translucent white fill, white label. */
export type Variant = 'filled' | 'tinted' | 'gray' | 'plain' | 'destructive' | 'destructiveTinted' | 'onDark';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  /** small = 28, medium = 34, large = 50 (radius 12). */
  size?: ButtonSize;
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  /** Light tap haptic. Turn off when the handler fires its own success/error haptic. */
  haptics?: boolean;
};

/**
 * Apple-standard button: filled / tinted / gray / plain / destructive.
 * Visual heights 28/34/50 with a guaranteed 44pt hit target, press scale 0.97, light haptic.
 */
export function Button({ title, onPress, variant = 'filled', size = 'large', icon, disabled, loading, full, style, accessibilityHint, accessibilityLabel, haptics = true }: Props) {
  const { c } = useTheme();
  const { lang } = useT();
  const spec = button.sizes[size];
  const bg: Record<Variant, string> = {
    filled: c.primary,
    tinted: c.primaryTint,
    gray: c.fillTertiary,
    onDark: 'rgba(255,255,255,0.16)',
    plain: 'transparent',
    destructive: c.danger,
    destructiveTinted: c.dangerTint,
  };
  const fg: Record<Variant, string> = {
    filled: c.onPrimary,
    tinted: c.primary,
    gray: c.labelPrimary,
    onDark: c.onDark,
    plain: c.primary,
    destructive: '#FFFFFF',
    destructiveTinted: c.danger,
  };
  const vPad = Math.max(0, (44 - spec.height) / 2);
  // Label line height (Arabic needs ~4pt more). Vertical padding is derived from it so the default
  // size is exactly 28 / 34 / 50, while larger Dynamic Type text still grows the button.
  const labelLine = spec.lineHeight + (lang === 'ar' ? 4 : 0);
  const padV = Math.max(0, (spec.height - labelLine) / 2);
  const radius = size === 'small' ? 999 : spec.radius;
  return (
    <ScalePressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      haptics={haptics ? 'light' : false}
      hitSlop={{ top: vPad, bottom: vPad, left: 8, right: 8 }}
      style={[{ opacity: disabled ? 0.4 : 1, alignSelf: full ? 'stretch' : 'flex-start' }, style]}
    >
      <View
        style={[
          styles.base,
          {
            minHeight: spec.height,
            paddingVertical: padV,
            minWidth: size === 'large' ? 88 : 44,
            paddingHorizontal: variant === 'plain' ? 4 : spec.paddingInline,
            borderRadius: radius,
            borderCurve: 'continuous',
            backgroundColor: bg[variant],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={fg[variant]} />
        ) : (
          <>
            {icon ? <Icon name={icon} size={spec.iconSize} color={fg[variant]} weight="semibold" /> : null}
            {title ? (
            <Text
              numberOfLines={size === 'small' ? 1 : 2}
              maxFontSizeMultiplier={size === 'small' ? 1.6 : 2.2}
              style={{ fontSize: spec.fontSize, lineHeight: labelLine, fontWeight: '600', color: fg[variant], textAlign: 'center', flexShrink: 1 }}
            >
              {title}
            </Text>
            ) : null}
          </>
        )}
      </View>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: button.iconGap },
});
