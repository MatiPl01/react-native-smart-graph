import { PropsWithChildren } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData } from '@/providers/graph/data/components/ComponentsDataProvider';
import { withGraphSettings } from '@/providers/graph/data/settings/context';
import { EdgeComponentData, VertexComponentData } from '@/types/components';
import { GraphConnections } from '@/types/graphs';
import { BoundingRect } from '@/types/layout';
import { AnimationSettingsWithDefaults } from '@/types/settings';
import { animateVerticesToFinalPositions } from '@/utils/animations';
import { placeVertices } from '@/utils/placement';

export type GraphPlacementLayoutProviderProps<V, E> = PropsWithChildren<{
  connections: GraphConnections;
  edgesData: Record<string, EdgeComponentData<E, V>>;
  isGraphDirected: SharedValue<boolean>;
  layoutAnimationSettings: AnimationSettingsWithDefaults;
  targetBoundingRect: SharedValue<BoundingRect>;
  vertexRadius: SharedValue<number>;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function GraphPlacementLayoutProvider<V, E>({
  children,
  connections,
  edgesData,
  layoutAnimationSettings,
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
    [verticesData, edgesData]
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
    vertexRadius: settings.components.vertex.radius
  })
);
