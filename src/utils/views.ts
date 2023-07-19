import { Vector } from '@shopify/react-native-skia';

import { BoundingRect, Dimensions } from '@/types/layout';
import { ObjectFit } from '@/types/views';

export const calcContainerScale = (
  objectFit: ObjectFit,
  initialScale: number,
  containerDimensions: Dimensions,
  { height: canvasHeight, width: canvasWidth }: Dimensions,
  padding: BoundingRect
): number => {
  'worklet';
  let scale = initialScale;

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
  }

  return scale || initialScale;
};

export const calcContainerTranslation = (
  { bottom, left, right, top }: BoundingRect,
  { height: canvasHeight, width: canvasWidth }: Dimensions,
  padding: BoundingRect
): { x: number; y: number } => {
  'worklet';
  const containerWidth = right - left + padding.left + padding.right;
  const containerHeight = bottom - top + padding.top + padding.bottom;

  return {
    x: ((-left + padding.left) / containerWidth) * canvasWidth,
    y: ((-top + padding.top) / containerHeight) * canvasHeight
  };
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
