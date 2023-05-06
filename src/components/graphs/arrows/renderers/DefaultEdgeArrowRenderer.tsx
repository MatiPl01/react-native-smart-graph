import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { Group, Vertices, vec } from '@shopify/react-native-skia';

import { DEFAULT_EDGE_RENDERER_SETTINGS } from '@/constants/renderers';
import { EdgeArrowRendererProps } from '@/types/renderer';

export default function DefaultEdgeArrowRenderer({
  size,
  centerPosition,
  rotation
}: EdgeArrowRendererProps) {
  const vertices = [
    vec(-size / 2, 0),
    vec(size / 2, -0.25 * size),
    vec(size / 2, 0.25 * size)
  ];

  const color = DEFAULT_EDGE_RENDERER_SETTINGS.color;
  const colors = [color, color, color];

  const transform = useDerivedValue(
    () => [
      { translateX: centerPosition.value.x },
      { translateY: centerPosition.value.y },
      { rotate: rotation.value }
    ],
    [centerPosition]
  );

  return (
    <Group transform={transform}>
      <Vertices vertices={vertices} colors={colors} />
    </Group>
  );
}
