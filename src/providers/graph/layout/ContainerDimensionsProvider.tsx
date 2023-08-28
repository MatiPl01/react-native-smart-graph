import { PropsWithChildren } from 'react';
import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';

import { useCanvasContexts } from '@/providers/graph/contexts';
import { withGraphSettings } from '@/providers/graph/data';
import { animateToValue } from '@/utils/animations';

type ContainerDimensionsProviderProps = PropsWithChildren<{
  vertexRadius: number;
  vertexScale: SharedValue<number>;
}>;

function ContainerDimensionsProvider({
  children,
  vertexRadius,
  vertexScale
}: ContainerDimensionsProviderProps) {
  // CONTEXTS
  // Canvas contexts
  const {
    dataContext: { boundingRect, targetBoundingRect }
  } = useCanvasContexts();

  useAnimatedReaction(
    () => ({
      currentRect: {
        bottom: boundingRect.bottom.value,
        left: boundingRect.left.value,
        right: boundingRect.right.value,
        top: boundingRect.top.value
      },
      padding: vertexRadius * vertexScale.value,
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
  ContainerDimensionsProvider,
  ({ settings }) => ({
    vertexRadius: settings.components.vertex.radius,
    vertexScale: settings.components.vertex.scale
  })
);
