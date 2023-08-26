import { PropsWithChildren } from 'react';
import {
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
  InternalGraphPlacementSettings
} from '@/types/settings';
import { updateVerticesTransform } from '@/utils/animations';
import { unsharedify } from '@/utils/objects';
import { placeVertices } from '@/utils/placement';

type GraphPlacementLayoutProviderProps<V, E> = PropsWithChildren<{
  connections: GraphConnections;
  edgesData: Record<string, EdgeComponentData<E>>;
  isGraphDirected: SharedValue<boolean>;
  layoutAnimationProgress: SharedValue<number>;
  layoutAnimationSettings: AllAnimationSettings;
  placementSettings: InternalGraphPlacementSettings;
  targetBoundingRect: SharedValue<BoundingRect>;
  verticesData: Record<string, VertexComponentData<V>>;
}>;

function GraphPlacementLayoutProvider<V, E>({
  children,
  connections,
  edgesData,
  isGraphDirected,
  layoutAnimationProgress,
  layoutAnimationSettings,
  placementSettings,
  targetBoundingRect,
  verticesData
}: GraphPlacementLayoutProviderProps<V, E>) {
  // CONTEXTS
  // Canvas contexts
  const {
    dataContext: { canvasDimensions },
    transformContext: { handleGraphRender: onRender }
  } = useCanvasContexts();

  const isFirstRender = useSharedValue(true);

  useAnimatedReaction(
    () => ({
      canvasDims: {
        height: canvasDimensions.height.value,
        width: canvasDimensions.width.value
      },
      isDirected: isGraphDirected.value,
      settings: unsharedify(placementSettings)
    }),
    ({ canvasDims, isDirected, settings }) => {
      const { boundingRect, verticesPositions } = placeVertices(
        connections,
        canvasDims,
        settings,
        isDirected
      );

      if (isFirstRender.value) {
        isFirstRender.value = false;
        onRender(boundingRect);
      }

      targetBoundingRect.value = boundingRect;

      updateVerticesTransform(
        verticesData,
        verticesPositions,
        layoutAnimationProgress,
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
      layoutAnimationProgress,
      layoutAnimationSettings,
      targetBoundingRect,
      verticesData
    }) => ({
      connections,
      edgesData,
      isGraphDirected,
      layoutAnimationProgress,
      layoutAnimationSettings,
      targetBoundingRect,
      verticesData
    })
  ),
  ({ settings }) => ({
    placementSettings: settings.placement
  })
);
