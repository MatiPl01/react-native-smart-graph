import { PropsWithChildren } from 'react';
import { useAnimatedReaction } from 'react-native-reanimated';

import { withGraphData } from '@/providers/graph';
import { VertexComponentRenderData } from '@/types/components';
import { AnimatedBoundingRect } from '@/types/layout';
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
  const renderedVerticesPositions = Object.fromEntries(
    Object.entries(renderedVerticesData).map(([key, { position }]) => [
      key,
      position
    ])
  );

  useAnimatedReaction(
    () => ({ positions: renderedVerticesPositions }),
    ({ positions }) => {
      Object.entries(
        calcAnimatedContainerBoundingRect(positions, vertexRadius)
      ).forEach(
        ([key, value]) =>
          (boundingRect[key as keyof AnimatedBoundingRect].value = value)
      );
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
