import { Dimensions } from '@/types/layout';
import { ObjectFit } from '@/types/views';

export const getScaleInParent = (
  objectFit: ObjectFit,
  containerDimensions: Dimensions,
  parentDimensions: Dimensions
): number => {
  const { width: containerWidth, height: containerHeight } =
    containerDimensions;
  const { width: parentWidth, height: parentHeight } = parentDimensions;

  switch (objectFit) {
    case 'contain':
      return Math.min(
        parentWidth / containerWidth,
        parentHeight / containerHeight
      );
    case 'cover':
      return Math.max(
        parentWidth / containerWidth,
        parentHeight / containerHeight
      );
    case 'none':
      return 1;
    default:
      return isNaN(objectFit) ? 1 : objectFit;
  }
};

export const clamp = (value: number, bounds: [number, number]) => {
  'worklet';
  return Math.min(Math.max(value, bounds[0]), bounds[1]);
};
