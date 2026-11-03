import { brandSource, motion } from '@forsa/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useT } from '@/i18n';

import { Text } from './Text';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

/**
 * Discover hero (S01 wow moment): navy canvas with a slow drifting brand-blue glow and a value
 * counter that rolls up once to the platform's total listed value (2.47 مليار ر.س).
 * Reduce Motion: no drift, counter shows the final value immediately.
 */
export function ValueHero({ totalSar, children }: { totalSar: number; children?: React.ReactNode }) {
  const { t, lang } = useT();
  const reduced = useReducedMotion();
  const target = totalSar / 1e9;
  const value = useSharedValue(reduced ? target : 0);
  const [display, setDisplay] = useState(reduced ? target : 0);
  const drift = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      value.value = target;
      setDisplay(target);
      return;
    }
    value.value = withDelay(250, withTiming(target, { duration: motion.duration.cinematic, easing: Easing.out(Easing.cubic) }));
    drift.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [reduced, target, value, drift]);

  useAnimatedReaction(
    () => Math.round(value.value * 100) / 100,
    (v, prev) => {
      if (v !== prev) scheduleOnRN(setDisplay, v);
    },
  );

  const glowA = useAnimatedStyle(() => ({
    transform: [{ translateX: -60 + drift.value * 120 }, { translateY: -20 + drift.value * 40 }, { scale: 1 + drift.value * 0.15 }],
    opacity: 0.55 + drift.value * 0.15,
  }));
  const glowB = useAnimatedStyle(() => ({
    transform: [{ translateX: 40 - drift.value * 90 }, { translateY: 30 - drift.value * 50 }],
    opacity: 0.35 + (1 - drift.value) * 0.2,
  }));

  const digits = display.toFixed(2);

  return (
    <View style={styles.hero}>
      <LinearGradient colors={[brandSource.navy, '#0F1838']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <AnimatedGradient
        colors={['rgba(2,117,217,0.85)', 'rgba(2,117,217,0)']}
        style={[styles.glow, { top: -80, end: -60 }, glowA]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
      />
      <AnimatedGradient
        colors={['rgba(78,167,223,0.6)', 'rgba(78,167,223,0)']}
        style={[styles.glow, { bottom: -120, start: -80, width: 300, height: 300 }, glowB]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 0, y: 0 }}
      />
      <View style={styles.content}>
        <Animated.View entering={reduced ? undefined : FadeInDown.duration(500)}>
          <Text variant="title1" style={{ color: '#FFFFFF' }} accessibilityRole="header">
            {t('heroTagline')}
          </Text>
        </Animated.View>
        <View
          style={styles.counterRow}
          accessible
          accessibilityLabel={`${t('heroValueLabel')}: ${target.toFixed(2)} ${t('billionSar')}`}
        >
          {lang === 'en' ? (
            <Text style={[styles.unit, { color: brandSource.accent }]}>SAR </Text>
          ) : null}
          <Text style={styles.counter} tabular maxFontSizeMultiplier={1.3}>
            {digits}
          </Text>
          <Text style={[styles.unit, { color: brandSource.accent }]}>{lang === 'en' ? 'B' : ' مليار ر.س'}</Text>
        </View>
        <Text variant="subhead" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {t('heroValueLabel')} · {t('heroAsOf')}
        </Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 28, borderCurve: 'continuous', overflow: 'hidden', marginHorizontal: 16, minHeight: 300 },
  glow: { position: 'absolute', width: 340, height: 340, borderRadius: 170 },
  content: { padding: 22, paddingTop: 28, gap: 10, flex: 1, justifyContent: 'flex-end' },
  counterRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  counter: { color: '#FFFFFF', fontSize: 56, lineHeight: 64, fontWeight: '700', fontVariant: ['tabular-nums'] },
  unit: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
});
