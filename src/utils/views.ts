import { Vector } from '@shopify/react-native-skia';

import { BoundingRect, Dimensions } from '@/types/layout';
import { ObjectFit } from '@/types/views';

export const calcContainerScale = (
  objectFit: ObjectFit,
  containerDimensions: Dimensions,
  { height: canvasHeight, width: canvasWidth }: Dimensions,
  padding: BoundingRect
): number => {
  'worklet';
  let scale = 1;

  const containerWidth =
    containerDimensions.width + padding.left + padding.right;
  const containerHeight =
    containerDimensions.height + padding.top + padding.bottom;

  switch (objectFit) {
    case 'contain':
      scale = Math.min(
        canvasWidth / containerWidth,
        canvasHeight / containerHeight
      );
      break;
    case 'cover':
      scale = Math.max(
        canvasWidth / containerWidth,
        canvasHeight / containerHeight
      );
      break;
    case 'none':
      scale = 1;
      break;
    default:
      scale = isNaN(objectFit) ? 1 : objectFit;
  }

  return scale;
};

export const calcContainerTranslation = (
  objectFit: ObjectFit,
  { bottom, left, right, top }: BoundingRect,
  { height: canvasHeight, width: canvasWidth }: Dimensions,
  padding: BoundingRect
): { x: number; y: number } => {
  'worklet';
  let x = 0;
  let y = 0;

  switch (objectFit) {
    case 'contain':
    case 'cover':
      const containerWidth = right - left + padding.left + padding.right;
      const containerHeight = bottom - top + padding.top + padding.bottom;
      x = ((-left + padding.left) / containerWidth) * canvasWidth;
      y = ((-top + padding.top) / containerHeight) * canvasHeight;
      break;
  }

  return { x, y };
};

export const calcScaleOnProgress = (
  progress: number,
  startScale: number,
  endScale: number
): number => {
  'worklet';
  return startScale + progress * (endScale - startScale);
};

export const calcTranslationOnProgress = (
  progress: number,
  startTranslation: Vector,
  endTranslation: Vector
): Vector => {
  'worklet';
  return {
    x: startTranslation.x + progress * (endTranslation.x - startTranslation.x),
    y: startTranslation.y + progress * (endTranslation.y - startTranslation.y)
  };
};

export const clamp = (value: number, bounds: [number, number]) => {
  'worklet';
  return Math.min(Math.max(value, bounds[0]), bounds[1]);
};
