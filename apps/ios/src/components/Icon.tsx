import { SymbolView, type SFSymbol, type SymbolWeight } from 'expo-symbols';
import { Text as RNText, View, type StyleProp, type ViewStyle } from 'react-native';

import { isRTL } from '@/lib/direction';

/** Text glyph fallbacks for platforms or OS versions without SF Symbols. */
const FALLBACK: Record<string, string> = {
  'chevron.right': '›',
  'chevron.left': '‹',
  xmark: '✕',
  checkmark: '✓',
  plus: '+',
  heart: '♡',
  'heart.fill': '♥',
  'lock.fill': '🔒',
  star: '☆',
  'star.fill': '★',
};

type Props = {
  name: string;
  size?: number;
  color: string;
  weight?: SymbolWeight;
  /** Directional symbols (chevrons, arrows) mirror in RTL. */
  directional?: boolean;
  style?: StyleProp<ViewStyle>;
  type?: 'monochrome' | 'hierarchical';
};

export function Icon({ name, size = 20, color, weight = 'regular', directional, style, type = 'monochrome' }: Props) {
  // Resolve "forward/backward" to explicit left/right so mirroring is deterministic
  // (RTL: forward points left). Non-directional symbols are left untouched.
  let sym = name;
  if (directional) {
    const rtl = isRTL();
    sym = name
      .replace('.forward', rtl ? '.left' : '.right')
      .replace('.backward', rtl ? '.right' : '.left');
  }
  return (
    <SymbolView
      name={sym as SFSymbol}
      size={size}
      tintColor={color}
      weight={weight}
      type={type}
      resizeMode="scaleAspectFit"
      style={[{ width: size, height: size }, style]}
      fallback={
        <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
          <RNText style={{ color, fontSize: size * 0.8, lineHeight: size }}>{FALLBACK[sym] ?? '•'}</RNText>
        </View>
      }
    />
  );
}
