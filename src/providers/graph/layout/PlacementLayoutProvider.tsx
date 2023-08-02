import { PropsWithChildren, useMemo } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { withGraphData } from '@/providers/graph';
import { EdgeComponentData, VertexComponentData } from '@/types/components';
import { Graph } from '@/types/graphs';
import { BoundingRect } from '@/types/layout';
import {
  AnimationSettingsWithDefaults,
  GraphSettingsWithDefaults
} from '@/types/settings';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import { placeVertices } from '@/utils/placement';

export type GraphPlacementLayoutProviderProps<V, E> = PropsWithChildren<{
  edgesData: Record<string, EdgeComponentData<E, V>>;
  graph: Graph<V, E>;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
  onRender: (boundingRect: BoundingRect) => void;
  settings: GraphSettingsWithDefaults<V>;
  targetBoundingRect: SharedValue<BoundingRect>;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function GraphPlacementLayoutProvider<V, E>({
  children,
  edgesData,
  graph,
  layoutAnimationSettings,
  onRender,
  settings,
  targetBoundingRect,
  verticesData
}: GraphPlacementLayoutProviderProps<V, E>) {
  const isFirstRender = useSharedValue(true);

  const layoutAnimationData = useMemo(
    () => ({
      connections: graph.connections,
      isGraphDirected: graph.isDirected(),
      settings: settings.placement,
      vertexRadius: settings.components.vertex.radius
    }),
    [
      verticesData,
      edgesData,
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
        layoutAnimationData.settings,
        layoutAnimationData.isGraphDirected
      );

      if (isFirstRender.value) {
        isFirstRender.value = false;
        runOnJS(onRender)(boundingRect);
      }

      targetBoundingRect.value = boundingRect;

      animateVerticesToFinalPositions(
        Object.fromEntries(
          Object.entries(verticesData).map(([key, { position }]) => [
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
  ({
    edgesData,
    layoutAnimationSettings,
    targetBoundingRect,
    verticesData
  }) => ({
    edgesData,
    layoutAnimationSettings,
    targetBoundingRect,
    verticesData
  })
);
