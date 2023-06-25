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

export const getCoordinatesRelativeToCenter = (
  canvasDimensions: Dimensions,
  position: Vector
): Vector => {
  'worklet';
  return {
    x: position.x - canvasDimensions.width / 2,
    y: position.y - canvasDimensions.height / 2
  };
};

export const getAlignedVertexAbsolutePosition = (
  canvasDimensions: Dimensions,
  alignment: Required<Alignment>,
  vertexRadius: number
): Vector => {
  'worklet';
  const {
    horizontalAlignment,
    horizontalOffset,
    verticalAlignment,
    verticalOffset
  } = alignment;

  const x =
    horizontalAlignment === 'left'
      ? vertexRadius + horizontalOffset
      : horizontalAlignment === 'right'
      ? canvasDimensions.width - vertexRadius - horizontalOffset
      : canvasDimensions.width / 2;
  const y =
    verticalAlignment === 'top'
      ? vertexRadius + verticalOffset
      : verticalAlignment === 'bottom'
      ? canvasDimensions.height - vertexRadius - verticalOffset
      : canvasDimensions.height / 2;

  return { x, y };
};
