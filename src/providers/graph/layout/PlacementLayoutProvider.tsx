import { PropsWithChildren } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { EdgeComponentData, VertexComponentData } from '@/types/data';
import { BoundingRect } from '@/types/layout';
import { GraphConnections } from '@/types/models';
import {
  AllAnimationSettings,
  AllGraphPlacementSettings
} from '@/types/settings';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import { placeVertices } from '@/utils/placement';

export type GraphPlacementLayoutProviderProps<V, E> = PropsWithChildren<{
  connections: GraphConnections;
  edgesData: Record<string, EdgeComponentData<V, E>>;
  isGraphDirected: SharedValue<boolean>;
  layoutAnimationSettings: AllAnimationSettings;
  placementSettings: AllGraphPlacementSettings;
  targetBoundingRect: SharedValue<BoundingRect>;
  vertexRadius: SharedValue<number>;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function GraphPlacementLayoutProvider<V, E>({
  children,
  connections,
  edgesData,
  isGraphDirected,
  layoutAnimationSettings,
  placementSettings,
  targetBoundingRect,
  vertexRadius,
  verticesData
}: GraphPlacementLayoutProviderProps<V, E>) {
  // CONTEXTS
  // Canvas contexts
  const {
    transformContext: { handleGraphRender: onRender }
  } = useCanvasContexts();

  const isFirstRender = useSharedValue(true);

  useAnimatedReaction(
    () => ({
      radius: vertexRadius.value
    }),
    ({ radius }) => {
      const { boundingRect, verticesPositions } = placeVertices(
        connections,
        radius,
        placementSettings,
        isGraphDirected.value
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
    [verticesData, placementSettings, edgesData]
  );

  return <>{children}</>;
}

export default withGraphSettings(
  withComponentsData(
    GraphPlacementLayoutProvider,
    ({
      connections,
      edgesData,
      isGraphDirected,
      layoutAnimationSettings,
      targetBoundingRect,
      verticesData
    }) => ({
      connections,
      edgesData,
      isGraphDirected,
      layoutAnimationSettings,
      targetBoundingRect,
      verticesData
    })
  ),
  ({ settings }) => ({
    placementSettings: settings.placement,
    vertexRadius: settings.components.vertex.radius
  })
);
