import { Vector } from '@shopify/react-native-skia';

export const canvasCoordinatesToContainerCoordinates = (
  canvasCoordinates: Vector,
  translate: Vector,
  scale: number
): Vector => {
  'worklet';
  return {
    x: (canvasCoordinates.x - translate.x) / scale,
    y: (canvasCoordinates.y - translate.y) / scale
  };
};

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
