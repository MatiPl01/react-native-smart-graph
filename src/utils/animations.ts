import { Vector } from '@shopify/react-native-skia';
import { withTiming } from 'react-native-reanimated';

import { AnimationSettings } from '@/types/animations';
import { AnimatedVectorCoordinates } from '@/types/layout';

export const animateVerticesToFinalPositions = (
  animatedPositions: Record<string, AnimatedVectorCoordinates>,
  finalPositions: Record<string, Vector>,
  { duration, easing }: AnimationSettings
) => {
  'worklet';
  Object.entries(finalPositions).forEach(([key, finalPosition]) => {
    const animatedPosition = animatedPositions[key];
    if (animatedPosition) {
      animatedPosition.x.value = withTiming(finalPosition.x, {
        duration,
        easing
      });
      animatedPosition.y.value = withTiming(finalPosition.y, {
        duration,
        easing
      });
    }
  });
};
