import { Vector } from '@shopify/react-native-skia';
import { SharedValue, withTiming } from 'react-native-reanimated';

import EASING from '@/constants/easings';
import {
  AnimatedVectorCoordinates,
  BoundingRect,
  Dimensions
} from '@/types/layout';
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

// export const getTranslationClamp = (
//   scale: number,
//   { bottom, left, right, top }: BoundingRect,
//   { height: canvasHeight, width: canvasWidth }: Dimensions
// ): {
//   x: [number, number];
//   y: [number, number];
// } => {
//   'worklet';

//   return {
//     x: [
//       Math.min(-left * scale, canvasWidth - right * scale),
//       Math.max(canvasWidth - right * scale, -left * scale)
//     ],
//     y: [
//       Math.min(-top * scale, canvasHeight - bottom * scale),
//       Math.max(canvasHeight - bottom * scale, -top * scale)
//     ]
//   };
// };

// export const translateContentTo = (
//   { x: translateX, y: translateY }: Vector,
//   { x: currentX, y: currentY }: AnimatedVectorCoordinates,
//   clampTo?: { x?: [number, number]; y?: [number, number] },
//   animated?: boolean
// ) => {
//   'worklet';

//   const newTranslateX = clampTo?.x ? clamp(translateX, clampTo.x) : translateX;
//   const newTranslateY = clampTo?.y ? clamp(translateY, clampTo.y) : translateY;

//   if (animated) {
//     const timingConfig = { duration: 150, easing: EASING.ease };

//     currentX.value = withTiming(newTranslateX, timingConfig);
//     currentY.value = withTiming(newTranslateY, timingConfig);
//   } else {
//     currentX.value = newTranslateX;
//     currentY.value = newTranslateY;
//   }
// };

// export const scaleContentTo = (
//   newScale: number,
//   currentScale: SharedValue<number>,
//   currentTranslation: AnimatedVectorCoordinates,
//   boundingRect: BoundingRect,
//   canvasDimensions: Dimensions,
//   origin?: Vector,
//   animated = false
// ) => {
//   'worklet';
//   if (origin) {
//     const relativeScale = newScale / currentScale.value;
//     const { x: currentX, y: currentY } = currentTranslation;

//     translateContentTo(
//       {
//         x: currentX.value - (origin.x - currentX.value) * (relativeScale - 1),
//         y: currentY.value - (origin.y - currentY.value) * (relativeScale - 1)
//       },
//       currentTranslation,
//       getTranslationClamp(newScale, boundingRect, canvasDimensions),
//       animated
//     );
//   }

//   if (animated) {
//     currentScale.value = withTiming(newScale, {
//       duration: 150,
//       easing: EASING.ease
//     });
//   } else {
//     currentScale.value = newScale;
//   }
// };
