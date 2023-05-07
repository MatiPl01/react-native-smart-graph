import React, { useEffect } from 'react';
import {
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { Group, Vertices, vec } from '@shopify/react-native-skia';

import EASING from '@/constants/easings';
import { DEFAULT_EDGE_RENDERER_SETTINGS } from '@/constants/renderers';
import { EdgeArrowRendererProps } from '@/types/renderer';

export default function DefaultEdgeArrowRenderer({
  size,
  centerPosition,
  rotation
}: EdgeArrowRendererProps) {
  const color = DEFAULT_EDGE_RENDERER_SETTINGS.color;
  const colors = [color, color, color];

  const scale = useSharedValue(0);
  const vertices = useDerivedValue(() => {
    const x = size.value / 2 - (1 - scale.value) * size.value;
    const y = 0.25 * size.value * scale.value;
    return [vec(-size.value / 2, 0), vec(x, -y), vec(x, y)];
  });
  const transform = useDerivedValue(
    () => [
      { translateX: centerPosition.value.x },
      { translateY: centerPosition.value.y },
      { rotate: rotation.value }
    ],
    [centerPosition]
  );

  useEffect(() => {
    // Animate arrow on mount
    scale.value = withTiming(1, {
      duration: 500,
      easing: EASING.bounce
    });
  }, []);

  return (
    <Group transform={transform}>
      <Vertices vertices={vertices} colors={colors} />
    </Group>
  );
}
