import { Vector } from '@shopify/react-native-skia';

import { Alignment, Dimensions } from '@/types/layout';

export const findCenterOfPoints = (positions: Array<Vector>): Vector | null => {
  'worklet';
  if (positions.length === 0) {
    return null;
  }
  const xSum = positions.reduce((acc, position) => acc + position.x, 0);
  const ySum = positions.reduce((acc, position) => acc + position.y, 0);
  return {
    x: xSum / positions.length,
    y: ySum / positions.length
  };
};

export const getAlignedVertexAbsolutePosition = (
  canvasDimensions: Dimensions,
  alignment: Alignment,
  vertexRadius: number
): Vector => {
  'worklet';
};
