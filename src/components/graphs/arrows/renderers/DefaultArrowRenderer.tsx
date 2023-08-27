/* eslint-disable import/no-unused-modules */
import { Vertices } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import { ArrowRendererProps } from '@/types/components';

export default function DefaultArrowRenderer({
  animationProgress
}: ArrowRendererProps) {
  const color = '#999';
  const colors = [color, color, color];

  const transform = useDerivedValue(() => [
    {
      scale: animationProgress.value
    }
  ]);

  return (
    <Vertices
      vertices={[
        { x: -20, y: -10 },
        { x: -20, y: 10 },
        { x: 20, y: 0 }
      ]}
      colors={colors}
      transform={transform}
    />
  );
}
