import { Easing, withTiming } from 'react-native-reanimated';

import { Vector } from '@shopify/react-native-skia';

import { AnimatedVectorCoordinates } from '@/types/layout';

export const animateVerticesToFinalPositions = (
  animatedPositions: Record<string, AnimatedVectorCoordinates>,
  finalPositions: Record<string, Vector>
) => {
  // TODO - improve this animation (add settings)
  Object.entries(finalPositions).forEach(([key, finalPosition]) => {
    const animatedPosition = animatedPositions[key];
    if (animatedPosition) {
      animateVertexToFinalPosition(animatedPosition, finalPosition);
    }
  });
};

export const animateVertexToFinalPosition = (
  animatedPosition: AnimatedVectorCoordinates,
  finalPosition: Vector
) => {
  // TODO - improve this animation (add settings)
  animatedPosition.x.value = withTiming(finalPosition.x, {
    duration: 300,
    easing: Easing.bezier(0.175, 0.885, 0.32, 1.275)
  });
  animatedPosition.y.value = withTiming(finalPosition.y, {
    duration: 300,
    easing: Easing.bezier(0.175, 0.885, 0.32, 1.275)
  });
};
