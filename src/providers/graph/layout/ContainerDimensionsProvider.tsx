import { PropsWithChildren } from 'react';
import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';

import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData } from '@/providers/graph/data';
import { BoundingRect } from '@/types/layout';
import { animateToValue } from '@/utils/animations';

type ContainerDimensionsProviderProps = PropsWithChildren<{
  targetBoundingRect: SharedValue<BoundingRect>;
}>;

function ContainerDimensionsProvider({
  children,
  targetBoundingRect
}: ContainerDimensionsProviderProps) {
  // CONTEXTS
  // Canvas contexts
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

export default withComponentsData(
  ContainerDimensionsProvider,
  ({ targetBoundingRect }) => ({
    targetBoundingRect
  })
);
