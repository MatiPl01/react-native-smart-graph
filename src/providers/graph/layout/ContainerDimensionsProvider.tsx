import { PropsWithChildren } from 'react';
import { useAnimatedReaction } from 'react-native-reanimated';

import { useCanvasContexts } from '@/providers/graph/contexts';
import { withGraphSettings } from '@/providers/graph/data';
import { animateToValue } from '@/utils/animations';

type ContainerDimensionsProviderProps = PropsWithChildren<{
  vertexRadius: number;
}>;

function ContainerDimensionsProvider({
  children,
  vertexRadius
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
      targetRect: targetBoundingRect.value
    }),
    ({ currentRect, targetRect }) => {
      boundingRect.left.value = animateToValue(
        currentRect.left,
        targetRect.left - vertexRadius
      );
      boundingRect.top.value = animateToValue(
        currentRect.top,
        targetRect.top - vertexRadius
      );
      boundingRect.right.value = animateToValue(
        currentRect.right,
        targetRect.right + vertexRadius
      );
      boundingRect.bottom.value = animateToValue(
        currentRect.bottom,
        targetRect.bottom + vertexRadius
      );
    }
  );

  return <>{children}</>;
}

export default withGraphSettings(
  ContainerDimensionsProvider,
  ({ componentsSettings }) => ({
    vertexRadius: componentsSettings.vertex.radius
  })
);
