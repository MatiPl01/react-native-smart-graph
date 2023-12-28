import { PropsWithChildren } from 'react';
import {
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { useTransformContext, useViewDataContext } from '@/providers/view';
import { EdgeComponentData, VertexComponentData } from '@/types/data';
import { GraphConnections } from '@/types/models';
import {
  AllAnimationSettings,
  InternalGraphPlacementSettings
} from '@/types/settings';
import { unsharedify } from '@/utils/objects';
import { placeVertices } from '@/utils/placement';
import { updateComponentsTransform } from '@/utils/transform';

type GraphPlacementLayoutProviderProps<V, E> = PropsWithChildren<{
  connections: GraphConnections;
  edgesData: Record<string, EdgeComponentData<E>>;
  isGraphDirected: SharedValue<boolean>;
  layoutAnimationSettings: AllAnimationSettings;
  placementSettings: InternalGraphPlacementSettings;
  verticesData: Record<string, VertexComponentData<V>>;
}>;

function GraphPlacementLayoutProvider<V, E>({
  children,
  connections,
  edgesData,
  isGraphDirected,
  layoutAnimationSettings,
  placementSettings,
  verticesData
}: GraphPlacementLayoutProviderProps<V, E>) {
  // CONTEXTS
  // Canvas contexts
  const { canvasDimensions, targetBoundingRect } = useViewDataContext();
  const { handleGraphRender: onRender } = useTransformContext();

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
        return;
      }

      targetBoundingRect.value = boundingRect;
      updateComponentsTransform(
        verticesData,
        edgesData,
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
      verticesData
    }) => ({
      connections,
      edgesData,
      isGraphDirected,
      layoutAnimationSettings,
      verticesData
    })
  ),
  ({ placementSettings }) => ({ placementSettings })
);
