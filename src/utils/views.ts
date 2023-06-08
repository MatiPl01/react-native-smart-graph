import { Vector } from '@shopify/react-native-skia';

import { Dimensions } from '@/types/layout';
import { ObjectFit } from '@/types/views';

export const calcContainerScale = (
  objectFit: ObjectFit,
  { width: containerWidth, height: containerHeight }: Dimensions,
  { width: canvasWidth, height: canvasHeight }: Dimensions
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
  containerTop: number,
  containerLeft: number,
  { width: containerWidth, height: containerHeight }: Dimensions,
  { width: canvasWidth, height: canvasHeight }: Dimensions
): { x: number; y: number } => {
  'worklet';
  let x = 0;
  let y = 0;

  switch (objectFit) {
    case 'contain':
    case 'cover':
      x = (-containerLeft / containerWidth) * canvasWidth;
      y = (-containerTop / containerHeight) * canvasHeight;
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
