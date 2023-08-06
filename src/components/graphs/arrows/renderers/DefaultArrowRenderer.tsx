/* eslint-disable import/no-unused-modules */
import { Group, Vertices } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { ArrowRendererProps } from '@/types/components';

export default function DefaultArrowRenderer({
  animationProgress,
  centerPosition,
  height,
  rotation,
  width
}: ArrowRendererProps) {
  const color = '#999';
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

  return (
    <Group transform={transform}>
      <Vertices colors={colors} vertices={vertices} />
    </Group>
  );
}
