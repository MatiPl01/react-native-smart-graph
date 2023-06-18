import { Vector } from '@shopify/react-native-skia';

import { BoundingRect, Dimensions } from '@/types/layout';
import { ObjectFit } from '@/types/views';

export const calcContainerScale = (
  objectFit: ObjectFit,
  { height: containerHeight, width: containerWidth }: Dimensions,
  { height: canvasHeight, width: canvasWidth }: Dimensions
): number => {
  'worklet';
  let scale = 1;

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
  { height: canvasHeight, width: canvasWidth }: Dimensions
): { x: number; y: number } => {
  'worklet';
  let x = 0;
  let y = 0;

  switch (objectFit) {
    case 'contain':
    case 'cover':
      x = (-left / (right - left)) * canvasWidth;
      y = (-top / (bottom - top)) * canvasHeight;
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
