import { Group, Vertices } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { DEFAULT_EDGE_RENDERER_SETTINGS } from '@/constants/renderers';
import { EdgeArrowRendererProps } from '@/types/renderer';

export default function DefaultEdgeArrowRenderer({
  animationProgress,
  centerPosition,
  focusTransitionProgress,
  height,
  rotation,
  width
}: EdgeArrowRendererProps) {
  const color = DEFAULT_EDGE_RENDERER_SETTINGS.color;
  const colors = [color, color, color];

  const vertices = useDerivedValue(() => {
    const x = height.value / 2 - (1 - animationProgress.value) * height.value;
    const y = 0.35 * width.value * animationProgress.value;
    return [
      { x: -height.value / 2, y: 0 },
      { x, y: -y },
      { x, y }
    ];
  }, []);

  const transform = useDerivedValue(() => [
    { translateX: centerPosition.value.x },
    { translateY: centerPosition.value.y },
    { rotate: rotation.value }
  ]);

  const opacity = useDerivedValue(() =>
    focusTransitionProgress.value >= 0
      ? 1
      : 1 + 0.75 * focusTransitionProgress.value
  );

  return (
    <Group opacity={opacity} transform={transform}>
      <Vertices colors={colors} vertices={vertices} />
    </Group>
  );
}
