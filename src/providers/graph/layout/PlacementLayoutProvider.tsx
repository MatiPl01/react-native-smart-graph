import { PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import { useAnimatedReaction } from 'react-native-reanimated';

import { withGraphData } from '@/providers/graph/data';
import {
  EdgeComponentRenderData,
  VertexComponentRenderData
} from '@/types/components';
import { DirectedEdgeData, UndirectedEdgeData } from '@/types/data';
import { Graph } from '@/types/graphs';
import { BoundingRect } from '@/types/layout';
import {
  AnimationSettingsWithDefaults,
  GraphLayout,
  GraphSettingsWithDefaults
} from '@/types/settings';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import { placeVertices } from '@/utils/placement';

export type GraphPlacementLayoutProviderProps<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
> = PropsWithChildren<{
  graph: Graph<V, E>;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
  onRender: (boundingRect: BoundingRect) => void;
  renderedEdgesData: Record<string, EdgeComponentRenderData>;
  renderedVerticesData: Record<string, VertexComponentRenderData>;
  settings: GraphSettingsWithDefaults<V, E, ED>;
}>;

function GraphPlacementLayoutProvider<
  V,
  E,
  ED extends DirectedEdgeData<E> | UndirectedEdgeData<E>
>({
  children,
  graph,
  layoutAnimationSettings,
  onRender,
  renderedEdgesData,
  renderedVerticesData,
  settings
}: GraphPlacementLayoutProviderProps<V, E, ED>) {
  const isfirstRenderRef = useRef(true);
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

  useEffect(() => {
    if (isfirstRenderRef.current) {
      isfirstRenderRef.current = false;
      onRender(graphLayout.boundingRect);
      return;
    }
  }, [graphLayout]);

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
