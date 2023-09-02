/* eslint-disable import/no-unused-modules */
import { Vector } from '@shopify/react-native-skia';

import { translateAlongVector } from '@/utils/vectors';

export const calcArrowTransform = (
  tipPosition: Vector,
  dirVector: Vector,
  scale: number,
  vertexRadius: number
) => {
  'worklet';
  const center = translateAlongVector(
    tipPosition,
    dirVector,
    -(scale * vertexRadius) / 2
  );
  const rotation = Math.atan2(dirVector.y, dirVector.x);

  return [
    { translateX: center.x },
    { translateY: center.y },
    { rotate: rotation },
    { scale }
  ];
};
