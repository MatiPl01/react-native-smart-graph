import { PropsWithChildren } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useFrameCallback,
  useSharedValue
} from 'react-native-reanimated';

import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { EdgeComponentData, VertexComponentData } from '@/types/data';
import { BoundingRect } from '@/types/layout';
import { GraphConnections } from '@/types/models';
import {
  InternalForceLayoutSettings,
  PlacedVerticesPositions
} from '@/types/settings';
import { animateToValue } from '@/utils/animations';
import { applyForces } from '@/utils/forces';
import {
  alignPositionsToCenter,
  calcContainerBoundingRect
} from '@/utils/placement';
import { animatedVectorCoordinatesToVector } from '@/utils/vectors';

import { useForcesPlacementContext } from './ForcesPlacementProvider';

type ForcesLayoutProviderProps<V, E> = PropsWithChildren<{
  connections: GraphConnections;
  edgesData: Record<string, EdgeComponentData<V, E>>;
  settings: InternalForceLayoutSettings;
  targetBoundingRect: SharedValue<BoundingRect>;
  verticesData: Record<string, VertexComponentData<V, E>>;
}>;

function ForcesLayoutProvider<V, E>({
  children,
  connections,
  edgesData,
  settings,
  targetBoundingRect,
  verticesData
}: ForcesLayoutProviderProps<V, E>) {
  // CONTEXTS
  // Forces placement context
  const { initialPlacementCompleted, lockedVertices, placedVerticesPositions } =
    useForcesPlacementContext();

  // Helper values
  const targetPositions = useSharedValue<PlacedVerticesPositions | null>(null);
  const updatedVerticesKeys = useSharedValue<Array<string>>([]);
  const lastUpdateTimestamp = useSharedValue(0);

  const enableForces = () => {
    frameCallback.setActive(true);
    lastUpdateTimestamp.value = 0;
  };

  const disableForces = () => {
    frameCallback.setActive(false);
    targetPositions.value = null;
  };

  const frameCallback = useFrameCallback(({ timestamp }) => {
    const minUpdateDistance = settings.minUpdateDistance.value;
    let newPositions = targetPositions.value ?? {};
    let updatedKeys = updatedVerticesKeys.value ?? [];
    if (
      timestamp - lastUpdateTimestamp.value >=
      settings.refreshInterval.value
    ) {
      const result = applyForces(
        connections,
        lockedVertices,
        placedVerticesPositions,
        {
          attractionForceFactor: settings.attractionForceFactor.value,
          attractionScale: settings.attractionScale.value,
          minUpdateDistance,
          repulsionScale: settings.repulsionScale.value,
          strategy: settings.strategy.value,
          type: settings.type
        }
      );

      updatedVerticesKeys.value = updatedKeys = result.keys;
      targetPositions.value = newPositions = alignPositionsToCenter(
        result.positions
      ).verticesPositions;
      lastUpdateTimestamp.value = timestamp;

      // Disable forces layout if there are no vertices to update
      if (!updatedKeys.length) {
        runOnJS(disableForces)();
        return;
      }
    }

    // Update positions of the vertices
    for (const key of updatedKeys) {
      const vertexPosition = placedVerticesPositions[key];
      const targetPosition = newPositions[key];
      if (!vertexPosition || !targetPosition) return;
      // Animate vertex position to the target position
      const eps = 0.1 * minUpdateDistance;
      vertexPosition.x.value = animateToValue(
        vertexPosition.x.value,
        targetPosition.x,
        eps
      );
      vertexPosition.y.value = animateToValue(
        vertexPosition.y.value,
        targetPosition.y,
        eps
      );
    }
  }, false);

  useAnimatedReaction(
    () => ({
      completed: initialPlacementCompleted.value,
      positions: targetPositions.value
    }),
    ({ completed, positions }) => {
      if (!completed) return;
      targetBoundingRect.value = calcContainerBoundingRect(
        positions ??
          Object.fromEntries(
            Object.entries(placedVerticesPositions).map(([key, value]) => [
              key,
              animatedVectorCoordinatesToVector(value)
            ])
          )
      );
    }
  );

  useAnimatedReaction(
    () => initialPlacementCompleted.value,
    completed => {
      if (!completed) return;
      runOnJS(enableForces)();
    },
    [verticesData, edgesData]
  );

  return <>{children}</>;
}

export default withGraphSettings(
  withComponentsData(
    ForcesLayoutProvider,
    ({ connections, edgesData, targetBoundingRect, verticesData }) => ({
      connections,
      edgesData,
      targetBoundingRect,
      verticesData
    })
  ),
  ({ settings }) => ({
    settings: settings.layout as InternalForceLayoutSettings
  })
);
