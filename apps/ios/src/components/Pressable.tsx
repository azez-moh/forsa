import { motion } from '@forsa/tokens';
import type { ReactNode } from 'react';
import { Pressable as RNPressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

/** SwiftUI .snappy (response 0.35, damping 0.85) as a reanimated spring. */
export const SNAPPY = { duration: 350, dampingRatio: 0.85 } as const;
export const SMOOTH = { duration: 500, dampingRatio: 0.825 } as const;
export const BOUNCY = { duration: 500, dampingRatio: 0.7 } as const;

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** Scale while pressed (HIG/tokens: 0.97). */
  pressScale?: number;
  haptics?: 'light' | 'selection' | false;
};

/** Pressable with spring scale feedback (0.97) and optional light haptic. */
export function ScalePressable({ style, children, pressScale = motion.pressScale, haptics = false, onPressIn, onPressOut, onPress, ...rest }: Props) {
  const reduced = useReducedMotion();
  const s = useSharedValue(1);
  const o = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: o.value }));
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        if (!reduced) s.value = withSpring(pressScale, SNAPPY);
        o.value = withTiming(0.85, { duration: motion.duration.instant });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withSpring(1, SNAPPY);
        o.value = withTiming(1, { duration: motion.duration.fast });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptics === 'light') haptic.light();
        if (haptics === 'selection') haptic.selection();
        onPress?.(e);
      }}
      style={[style, anim]}
    >
      {children}
    </AnimatedPressable>
  );
}
