import { PropsWithChildren } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { withGraphData } from '@/providers/graph';
import { VertexComponentRenderData } from '@/types/components';
import { AnimatedBoundingRect, BoundingRect } from '@/types/layout';
import { animateToValue } from '@/utils/animations';
import { calcAnimatedContainerBoundingRect } from '@/utils/placement';

type ContainerDimensionsProviderProps = PropsWithChildren<{
  boundingRect: AnimatedBoundingRect;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  vertexRadius: number;
}>;

function ContainerDimensionsProvider({
  boundingRect,
  children,
  renderedVerticesData,
  vertexRadius
}: ContainerDimensionsProviderProps) {
  // HELPER VALUES
  const targetBoundingRect = useSharedValue<BoundingRect>({
    bottom: 0,
    left: 0,
    right: 0,
    top: 0
  });

  const renderedVerticesPositions = Object.fromEntries(
    Object.entries(renderedVerticesData).map(([key, { position }]) => [
      key,
      position
    ])
  );

  useAnimatedReaction(
    () => ({ positions: renderedVerticesPositions }),
    ({ positions }) => {
      targetBoundingRect.value = calcAnimatedContainerBoundingRect(
        positions,
        vertexRadius
      );
    },
    [renderedVerticesPositions]
  );

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
  ({ renderedVerticesData }) => ({
    renderedVerticesData
  })
);
