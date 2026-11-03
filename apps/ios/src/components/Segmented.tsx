import RNSegmentedControl, { type SegmentedControlProps } from '@react-native-segmented-control/segmented-control';
import type { ComponentType } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme';

// The package's mixin class typing predates RN 0.88's NativeMethods; re-type it as a plain component.
const SegmentedControl = RNSegmentedControl as unknown as ComponentType<SegmentedControlProps>;

/** Native UISegmentedControl with a selection haptic. */
export function Segmented({
  values,
  index,
  onChange,
  style,
}: {
  values: string[];
  index: number;
  onChange: (i: number) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { scheme } = useTheme();
  return (
    <SegmentedControl
      values={values}
      selectedIndex={index}
      appearance={scheme}
      onChange={(e) => {
        haptic.selection();
        onChange(e.nativeEvent.selectedSegmentIndex);
      }}
      style={[{ minHeight: 32 }, style]}
    />
  );
}
