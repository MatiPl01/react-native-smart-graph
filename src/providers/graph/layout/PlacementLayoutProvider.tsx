import { PropsWithChildren, useMemo } from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { withGraphData } from '@/providers/graph';
import {
  EdgeComponentRenderData,
  VertexComponentRenderData
} from '@/types/components';
import { Graph } from '@/types/graphs';
import { BoundingRect } from '@/types/layout';
import {
  AnimationSettingsWithDefaults,
  GraphSettingsWithDefaults
} from '@/types/settings';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import { placeVertices } from '@/utils/placement';

export type GraphPlacementLayoutProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
  onRender: (boundingRect: BoundingRect) => void;
  renderedEdgesData: Record<string, EdgeComponentRenderData>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphSettingsWithDefaults<V, E>;
}>;

function GraphPlacementLayoutProvider<V, E>({
  children,
  graph,
  layoutAnimationSettings,
  onRender,
  renderedEdgesData,
  renderedVerticesData,
  settings
}: GraphPlacementLayoutProviderProps<V, E>) {
  const isFirstRender = useSharedValue(true);

  const layoutAnimationData = useMemo(
    () => ({
      connections: graph.connections,
      settings: settings.placement,
      vertexRadius: settings.components.vertex.radius
    }),
    [
      renderedVerticesData,
      renderedEdgesData,
      settings.components.vertex.radius,
      settings.placement
    ]
  );

  useAnimatedReaction(
    () => null,
    () => {
      const { boundingRect, verticesPositions } = placeVertices(
        layoutAnimationData.connections,
        layoutAnimationData.vertexRadius,
        layoutAnimationData.settings
      );

      if (isFirstRender.value) {
        isFirstRender.value = false;
        runOnJS(onRender)(boundingRect);
      }

      animateVerticesToFinalPositions(
        Object.fromEntries(
          Object.entries(renderedVerticesData).map(([key, { position }]) => [
            key,
            position
          ])
        ),
        verticesPositions,
        layoutAnimationSettings
      );
    },
    [layoutAnimationData]
  );

  return <>{children}</>;
}

export default withGraphData(
  GraphPlacementLayoutProvider,
  ({ layoutAnimationSettings, renderedEdgesData, renderedVerticesData }) => ({
    layoutAnimationSettings,
    renderedEdgesData,
    renderedVerticesData
  })
);
