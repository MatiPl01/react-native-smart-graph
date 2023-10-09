/* eslint-disable import/no-unused-modules */
import { Vertices } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { EdgeArrowRendererProps } from '@/types/components';

export default function DefaultEdgeArrowRenderer({
  animationProgress,
  s // size
}: EdgeArrowRendererProps) {
  const color = '#999';
  const colors = [color, color, color];

  const transform = useDerivedValue(() => [{ scale: animationProgress.value }]);

  return (
    <Vertices
      colors={colors}
      transform={transform}
      vertices={[
        { x: -s / 2, y: -s / 4 },
        { x: -s / 2, y: s / 4 },
        { x: s / 2, y: 0 }
      ]}
    />
  );
}
