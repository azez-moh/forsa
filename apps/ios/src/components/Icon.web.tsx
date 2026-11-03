import { createElement } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useApp } from '@/store/app';

import { FILLED, ICONS } from './webIcons';

type Props = {
  name: string;
  size?: number;
  color: string;
  weight?: 'unspecified' | 'ultraLight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
  directional?: boolean;
  style?: StyleProp<ViewStyle>;
  type?: 'monochrome' | 'hierarchical';
};

const STROKE: Record<string, number> = { ultraLight: 1.25, thin: 1.5, light: 1.75, regular: 2, medium: 2.15, semibold: 2.4, bold: 2.75, heavy: 3, black: 3 };

/** Web: SF Symbols are not available, so draw the matching Lucide outline as inline SVG. */
export function Icon({ name, size = 20, color, weight = 'regular', directional, style }: Props) {
  const rtl = useApp((s) => s.lang === 'ar');
  let sym = name;
  if (directional) {
    sym = name.replace('.forward', rtl ? '.left' : '.right').replace('.backward', rtl ? '.right' : '.left');
  }
  const nodes = ICONS[sym] ?? ICONS.circle;
  const fill = FILLED.has(sym) ? color : 'none';
  return (
    <View style={[{ width: size, height: size }, style]} accessibilityElementsHidden importantForAccessibility="no">
      {createElement(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill,
          stroke: color,
          strokeWidth: STROKE[weight] ?? 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          style: { display: 'block' },
        },
        nodes.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs })),
      )}
    </View>
  );
}
