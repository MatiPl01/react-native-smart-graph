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
