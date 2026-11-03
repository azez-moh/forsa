import { button, type ButtonSize } from '@forsa/tokens';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { ScalePressable } from './Pressable';
import { Text } from './Text';

export type Variant = 'filled' | 'tinted' | 'gray' | 'plain' | 'destructive' | 'destructiveTinted';

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
};

/**
 * Apple-standard button: filled / tinted / gray / plain / destructive.
 * Visual heights 28/34/50 with a guaranteed 44pt hit target, press scale 0.97, light haptic.
 */
export function Button({ title, onPress, variant = 'filled', size = 'large', icon, disabled, loading, full, style, accessibilityHint, accessibilityLabel }: Props) {
  const { c } = useTheme();
  const spec = button.sizes[size];
  const bg: Record<Variant, string> = {
    filled: c.primary,
    tinted: c.primaryTint,
    gray: c.fillTertiary,
    plain: 'transparent',
    destructive: c.danger,
    destructiveTinted: 'rgba(255,59,48,0.12)',
  };
  const fg: Record<Variant, string> = {
    filled: c.onPrimary,
    tinted: c.primary,
    gray: c.labelPrimary,
    plain: c.primary,
    destructive: '#FFFFFF',
    destructiveTinted: c.danger,
  };
  const vPad = Math.max(0, (44 - spec.height) / 2);
  const radius = size === 'small' ? 999 : spec.radius;
  return (
    <ScalePressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      haptics="light"
      hitSlop={{ top: vPad, bottom: vPad, left: 8, right: 8 }}
      style={[{ opacity: disabled ? 0.4 : 1, alignSelf: full ? 'stretch' : 'flex-start' }, style]}
    >
      <View
        style={[
          styles.base,
          {
            height: spec.height,
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
              numberOfLines={1}
              style={{ fontSize: spec.fontSize, lineHeight: spec.lineHeight + 4, fontWeight: '600', color: fg[variant] }}
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
