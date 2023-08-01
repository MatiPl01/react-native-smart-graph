import { PropsWithChildren } from 'react';
import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';

import { withGraphData } from '@/providers/graph';
import { AnimatedBoundingRect, BoundingRect } from '@/types/layout';
import { animateToValue } from '@/utils/animations';

type ContainerDimensionsProviderProps = PropsWithChildren<{
  boundingRect: AnimatedBoundingRect; // This is the real bounding rect of the container
  targetBoundingRect: SharedValue<BoundingRect>; // This is the target bounding rect of the container
  vertexRadius: number;
}>;

function ContainerDimensionsProvider({
  boundingRect,
  children,
  targetBoundingRect
}: ContainerDimensionsProviderProps) {
  useAnimatedReaction(
    () => ({
      currentRect: {
        bottom: boundingRect.bottom.value,
        left: boundingRect.left.value,
        right: boundingRect.right.value,
        top: boundingRect.top.value
      },
      targetRect: targetBoundingRect.value
    }),
    ({ currentRect, targetRect }) => {
      Object.keys(boundingRect).forEach((key: string) => {
        const k = key as keyof BoundingRect;
        boundingRect[k].value = animateToValue(currentRect[k], targetRect[k]);
      });
    }
  );

  return <>{children}</>;
}

export default withGraphData(
  ContainerDimensionsProvider,
  ({ targetBoundingRect }) => ({
    targetBoundingRect
  })
);
