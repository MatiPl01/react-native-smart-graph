import { Vector } from '@shopify/react-native-skia';
import { withTiming } from 'react-native-reanimated';

import EASING from '@/constants/easings';
import { AnimatedVectorCoordinates } from '@/types/layout';

export const animateVerticesToFinalPositions = (
  animatedPositions: Record<string, AnimatedVectorCoordinates>,
  finalPositions: Record<string, Vector>
) => {
  'worklet';
  // TODO - improve this animation (add settings)
  Object.entries(finalPositions).forEach(([key, finalPosition]) => {
    const animatedPosition = animatedPositions[key];
    if (animatedPosition) {
      animatedPosition.x.value = withTiming(finalPosition.x, {
        duration: 300,
        easing: EASING.ease
      });
      animatedPosition.y.value = withTiming(finalPosition.y, {
        duration: 300,
        easing: EASING.ease
      });
    }
  });
};
