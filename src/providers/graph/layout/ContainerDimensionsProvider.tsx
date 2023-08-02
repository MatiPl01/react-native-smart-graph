import { PropsWithChildren } from 'react';
import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';

import { withGraphData } from '@/providers/graph';
import { useCanvasContexts } from '@/providers/graph/contexts';
import { BoundingRect } from '@/types/layout';
import { animateToValue } from '@/utils/animations';

type ContainerDimensionsProviderProps = PropsWithChildren<{
  targetBoundingRect: SharedValue<BoundingRect>;
  vertexRadius: number;
}>;

function ContainerDimensionsProvider({
  children,
  targetBoundingRect
}: ContainerDimensionsProviderProps) {
  const {
    dataContext: { boundingRect }
  } = useCanvasContexts();

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
