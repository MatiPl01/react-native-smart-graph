import { Vector } from '@shopify/react-native-skia';
import { PropsWithChildren } from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useFrameCallback,
  useSharedValue
} from 'react-native-reanimated';

import { useCanvasContexts } from '@/providers/graph/contexts';
import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { EdgeComponentData } from '@/types/data';
import { GraphConnections } from '@/types/models';
import {
  InternalForceLayoutSettings,
  PlacedVerticesPositions
} from '@/types/settings';
import { animateToValue } from '@/utils/animations';
import { applyForces } from '@/utils/forces';
import { alignPositionsToCenter } from '@/utils/placement';
import { getVerticesPositions, setVerticesPositions } from '@/utils/transform';

import { useForcesPlacementContext } from './ForcesPlacementProvider';

type ForcesLayoutProviderProps<E> = PropsWithChildren<{
  connections: GraphConnections;
  edgesData: Record<string, EdgeComponentData<E>>;
  settings: InternalForceLayoutSettings;
}>;

function ForcesLayoutProvider<E>({
  children,
  connections,
  edgesData,
  settings
}: ForcesLayoutProviderProps<E>) {
  // CONTEXTS
  // Canvas contexts
  const {
    dataContext: { targetBoundingRect }
  } = useCanvasContexts();
  // Forces placement context
  const { initialPlacementCompleted, lockedVertices, placedVerticesData } =
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
        getVerticesPositions(placedVerticesData),
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
      const { boundingRect, verticesPositions } = alignPositionsToCenter(
        result.positions
      );
      targetPositions.value = newPositions = verticesPositions;
      if (initialPlacementCompleted.value && updatedKeys.length) {
        targetBoundingRect.value = boundingRect;
      }
      lastUpdateTimestamp.value = timestamp;

      // Disable forces layout if there are no vertices to update
      if (!updatedKeys.length) {
        runOnJS(disableForces)();
        return;
      }
    }

    const updatedPositions: Record<string, Vector> = {};
    for (const key of updatedKeys) {
      const vertexData = placedVerticesData[key];
      const targetPosition = newPositions[key];
      if (
        !vertexData ||
        !targetPosition ||
        // Don't update positions of vertices that are still being animated
        vertexData.transformProgress.value < 1
      ) {
        return;
      }
      // Animate vertex position to the target position
      const eps = 0.1 * minUpdateDistance;
      updatedPositions[key] = {
        x: animateToValue(vertexData.points.value.target.x, targetPosition.x, {
          eps
        }),
        y: animateToValue(vertexData.points.value.target.y, targetPosition.y, {
          eps
        })
      };
    }

    // Apply updated positions
    setVerticesPositions(updatedPositions, placedVerticesData, edgesData);
  }, false);

  useAnimatedReaction(
    () => initialPlacementCompleted.value,
    completed => {
      if (!completed) return;
      runOnJS(enableForces)();
    },
    [placedVerticesData, edgesData]
  );

  return <>{children}</>;
}

export default withGraphSettings(
  withComponentsData(ForcesLayoutProvider, ({ connections, edgesData }) => ({
    connections,
    edgesData
  })),
  ({ layoutSettings }) => ({
    settings: layoutSettings as InternalForceLayoutSettings
  })
);
