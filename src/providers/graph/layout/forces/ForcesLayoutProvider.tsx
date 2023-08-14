import { PropsWithChildren } from 'react';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useFrameCallback,
  useSharedValue
} from 'react-native-reanimated';

import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
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

import { useForcesPlacementContext } from './ForcesPlacementProvider';

type ForcesLayoutProviderProps = PropsWithChildren<{
  connections: GraphConnections;
  settings: InternalForceLayoutSettings;
  targetBoundingRect: SharedValue<BoundingRect>;
  vertexRadius: SharedValue<number>;
}>;

function ForcesLayoutProvider({
  children,
  connections,
  settings,
  targetBoundingRect,
  vertexRadius
}: ForcesLayoutProviderProps) {
  // CONTEXTS
  // Forces placement context
  const { initialPlacementCompleted, lockedVertices, placedVerticesPositions } =
    useForcesPlacementContext();

  // Helper values
  const targetPositions = useSharedValue<PlacedVerticesPositions>({});
  const updatedVerticesKeys = useSharedValue<Array<string>>([]);
  const lastUpdateTimestamp = useSharedValue(0);

  const enableForces = () => {
    // Enable forces if locked vertices change
    frameCallback.setActive(true);
    lastUpdateTimestamp.value = 0;
  };

  const disableForces = () => {
    frameCallback.setActive(false);
  };

  const frameCallback = useFrameCallback(({ timestamp }) => {
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
          minUpdateDistance: settings.minUpdateDistance.value,
          repulsionScale: settings.repulsionScale.value,
          strategy: settings.strategy.value,
          type: settings.type
        }
      );
      updatedVerticesKeys.value = updatedKeys = result.keys;

      // Disable forces layout if there are no vertices to update
      if (!updatedKeys.length) {
        runOnJS(disableForces)();
        return;
      }

      targetPositions.value = newPositions = alignPositionsToCenter(
        result.positions
      ).verticesPositions;
      lastUpdateTimestamp.value = timestamp;
    }

    // Update positions of the vertices
    for (const key in newPositions) {
      const vertexPosition = placedVerticesPositions[key];
      const targetPosition = newPositions[key];
      if (!vertexPosition || !targetPosition) return;
      // Animate vertex position to the target position
      vertexPosition.x.value = animateToValue(
        vertexPosition.x.value,
        targetPosition.x
      );
      vertexPosition.y.value = animateToValue(
        vertexPosition.y.value,
        targetPosition.y
      );
    }
  }, false);

  useAnimatedReaction(
    () => ({
      completed: initialPlacementCompleted.value,
      padding: vertexRadius.value,
      positions: targetPositions.value
    }),
    ({ completed, padding, positions }) => {
      if (!completed) return;
      targetBoundingRect.value = calcContainerBoundingRect(positions, {
        padding
      });
    }
  );

  useAnimatedReaction(
    () => initialPlacementCompleted.value,
    completed => {
      if (!completed) return;
      runOnJS(enableForces)();
    },
    [connections]
  );

  return <>{children}</>;
}

export default withGraphSettings(
  withComponentsData(
    ForcesLayoutProvider,
    ({ connections, targetBoundingRect }) => ({
      connections,
      targetBoundingRect
    })
  ),
  ({ settings }) => ({
    settings: settings.layout as InternalForceLayoutSettings,
    vertexRadius: settings.components.vertex.radius
  })
);
