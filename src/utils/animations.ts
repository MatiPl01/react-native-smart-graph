import { Vector } from '@shopify/react-native-skia';
import { runOnJS, withTiming } from 'react-native-reanimated';

import { AnimationSettings } from '@/types/animations';
import { AnimatedVectorCoordinates } from '@/types/layout';

export function animateVerticesToFinalPositions(
  animatedPositions: Record<string, AnimatedVectorCoordinates>,
  finalPositions: Record<string, Vector>,
  { duration, easing, onComplete }: AnimationSettings
) {
  'worklet';
  const finalPositionsEntries = Object.entries(finalPositions);

  finalPositionsEntries.forEach(([key, finalPosition], idx) => {
    const animatedPosition = animatedPositions[key];
    if (animatedPosition) {
      animatedPosition.x.value = withTiming(finalPosition.x, {
        duration,
        easing
      });
      animatedPosition.y.value = withTiming(
        finalPosition.y,
        {
          duration,
          easing
        },
        // Call onComplete only once, when the last vertex animation is complete
        onComplete && idx === finalPositionsEntries.length - 1
          ? () => {
              runOnJS(onComplete)();
            }
          : undefined
      );
    }
  });
}
