/* eslint-disable import/no-unused-modules */
import { Vertices } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { ArrowRendererProps } from '@/types/components';

export default function DefaultArrowRenderer({
  animationProgress,
  s // size
}: ArrowRendererProps) {
  const color = '#999';
  const colors = [color, color, color];

  const transform = useDerivedValue(() => [{ scale: animationProgress.value }]);

  return (
    <Vertices
      vertices={[
        { x: -s / 2, y: -s / 4 },
        { x: -s / 2, y: s / 4 },
        { x: s / 2, y: 0 }
      ]}
      colors={colors}
      transform={transform}
    />
  );
}
