import { PropsWithChildren, useMemo } from 'react';
import { useAnimatedReaction } from 'react-native-reanimated';

import { withGraphData } from '@/providers/data';
import {
  EdgeComponentRenderData,
  VertexComponentRenderData
} from '@/types/components';
import { Graph } from '@/types/graphs';
import {
  AnimationSettingsWithDefaults,
  GraphLayout,
  GraphSettingsWithDefaults
} from '@/types/settings';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import { placeVertices } from '@/utils/placement';

export type GraphPlacementLayoutProviderProps<V, E> = PropsWithChildren<{
  graph: Graph<V, E>;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
  renderedEdgesData: Record<string, EdgeComponentRenderData>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphSettingsWithDefaults<V, E>;
}>;

function GraphPlacementLayoutProvider<V, E>({
  children,
  graph,
  layoutAnimationSettings,
  renderedEdgesData,
  renderedVerticesData,
  settings
}: GraphPlacementLayoutProviderProps<V, E>) {
  const graphLayout = useMemo<GraphLayout>(
    () =>
      placeVertices(
        graph,
        settings.components.vertex.radius,
        settings.placement
      ),
    [
      renderedVerticesData,
      renderedEdgesData,
      settings.components.vertex.radius,
      settings.placement
    ]
  );

  useAnimatedReaction(
    () => ({
      finalPositions: graphLayout.verticesPositions
    }),
    ({ finalPositions }) => {
      animateVerticesToFinalPositions(
        Object.fromEntries(
          Object.entries(renderedVerticesData).map(([key, { position }]) => [
            key,
            position
          ])
        ),
        finalPositions,
        layoutAnimationSettings
      );
    },
    [graphLayout]
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
