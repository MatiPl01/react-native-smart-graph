import { PropsWithChildren } from 'react';
import { useAnimatedReaction } from 'react-native-reanimated';

import { withGraphData } from '@/providers/data';
import { VertexComponentRenderData } from '@/types/components';
import { AnimatedBoundingRect } from '@/types/layout';
import { calcContainerBoundingRect } from '@/utils/placement';

type ContainerDimensionsProviderProps = PropsWithChildren<{
  boundingRect: AnimatedBoundingRect;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
}>;

function ContainerDimensionsProvider({
  boundingRect,
  children,
  renderedVerticesData
}: ContainerDimensionsProviderProps) {
  useAnimatedReaction(
    () => ({
      positions: Object.fromEntries(
        Object.entries(renderedVerticesData).map(([key, { position }]) => [
          key,
          {
            x: position.x.value,
            y: position.y.value
          }
        ])
      )
    }),
    ({ positions }) => {
      Object.entries(
        calcContainerBoundingRect(
          positions,
          // Padding near the edges of the container
          // TODO - make this padding configurable
          20,
          20
        )
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
