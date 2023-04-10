import { Dimensions, ObjectFit } from '@/types/views';

export const getScaleInParent = (
  objectFit: ObjectFit,
  containerDimensions: Dimensions,
  parentDimensions: Dimensions
): { scale: number; dimensions: Dimensions } => {
  const { width: containerWidth, height: containerHeight } =
    containerDimensions;
  const { width: parentWidth, height: parentHeight } = parentDimensions;

  let scale = 1;

  switch (objectFit) {
    case 'contain':
      scale = Math.min(
        parentWidth / containerWidth,
        parentHeight / containerHeight
      );
      break;
    case 'cover':
      scale = Math.max(
        parentWidth / containerWidth,
        parentHeight / containerHeight
      );
      break;
    case 'none':
      scale = 1;
      break;
    default:
      scale = isNaN(objectFit) ? 1 : objectFit;
  }

  return {
    scale,
    dimensions: {
      width: containerWidth * scale,
      height: containerHeight * scale
    }
  };
};

export const getCenterInParent = (
  containerDimensions: Dimensions,
  parentDimensions: Dimensions
): { x: number; y: number } => {
  const { width: containerWidth, height: containerHeight } =
    containerDimensions;
  const { width: parentWidth, height: parentHeight } = parentDimensions;

  return {
    x: (parentWidth - containerWidth) / 2,
    y: (parentHeight - containerHeight) / 2
  };
};

export const clamp = (value: number, bounds: [number, number]) => {
  'worklet';
  return Math.min(Math.max(value, bounds[0]), bounds[1]);
};
