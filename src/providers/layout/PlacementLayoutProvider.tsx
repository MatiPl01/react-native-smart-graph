import { PropsWithChildren, useMemo } from 'react';
import { useAnimatedReaction } from 'react-native-reanimated';

import { withGraphData } from '@/providers/ComponentsDataProvider';
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
  // Component props
  graph: Graph<V, E>;
  settings: GraphSettingsWithDefaults<V, E>;
  // Injected props
  verticesRenderData: Record<string, VertexComponentRenderData>;
  edgesRenderData: Record<string, EdgeComponentRenderData>;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
}>;

function GraphPlacementLayoutProvider<V, E>({
  graph,
  settings,
  verticesRenderData,
  edgesRenderData,
  layoutAnimationSettings,
  children
}: GraphPlacementLayoutProviderProps<V, E>) {
  const graphLayout = useMemo<GraphLayout>(
    () =>
      placeVertices(
        graph,
        settings.components.vertex.radius,
        settings.placement
      ),
    [
      verticesRenderData,
      edgesRenderData,
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
          Object.entries(verticesRenderData).map(([key, { position }]) => [
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
  ({ verticesRenderData, edgesRenderData, layoutAnimationSettings }) => ({
    verticesRenderData,
    edgesRenderData,
    layoutAnimationSettings
  })
);
