import { PropsWithChildren } from 'react';
import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';

import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { BoundingRect } from '@/types/layout';
import { animateToValue } from '@/utils/animations';

type ContainerDimensionsProviderProps = PropsWithChildren<{
  targetBoundingRect: SharedValue<BoundingRect>;
  vertexRadius: number;
}>;

function ContainerDimensionsProvider({
  children,
  targetBoundingRect,
  vertexRadius
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
      padding: vertexRadius,
      targetRect: targetBoundingRect.value
    }),
    ({ currentRect, padding, targetRect }) => {
      boundingRect.left.value = animateToValue(
        currentRect.left,
        targetRect.left - padding
      );
      boundingRect.top.value = animateToValue(
        currentRect.top,
        targetRect.top - padding
      );
      boundingRect.right.value = animateToValue(
        currentRect.right,
        targetRect.right + padding
      );
      boundingRect.bottom.value = animateToValue(
        currentRect.bottom,
        targetRect.bottom + padding
      );
    }
  );

  return <>{children}</>;
}

export default withGraphSettings(
  withComponentsData(ContainerDimensionsProvider, ({ targetBoundingRect }) => ({
    targetBoundingRect
  })),
  ({ settings }) => ({ vertexRadius: settings.components.vertex.radius })
);
