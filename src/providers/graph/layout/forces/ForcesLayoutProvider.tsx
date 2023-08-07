import { PropsWithChildren } from 'react';
import { SharedValue, useFrameCallback } from 'react-native-reanimated';

import { withComponentsData, withGraphSettings } from '@/providers/graph/data';
import { BoundingRect } from '@/types/layout';
import { GraphConnections } from '@/types/models';
import { InternalForceLayoutSettings } from '@/types/settings';
import { animateToValue } from '@/utils/animations';
import { applyForces } from '@/utils/forces';
import {
  alignPositionsToCenter,
  calcContainerBoundingRect
} from '@/utils/placement';

import { useForcesPlacementContext } from './ForcesPlacementProvider';

type ForcesLayoutProviderProps = PropsWithChildren<{
  connections: GraphConnections;
  forcesSettings: InternalForceLayoutSettings;
  targetBoundingRect: SharedValue<BoundingRect>;
}>;

function ForcesLayoutProvider({
  children,
  connections,
  forcesSettings,
  targetBoundingRect
}: ForcesLayoutProviderProps) {
  // CONTEXTS
  // Forces placement context
  const { lockedVertices, placedVerticesPositions } =
    useForcesPlacementContext();

  useFrameCallback(() => {
    const targetPositions = alignPositionsToCenter(
      applyForces(connections, lockedVertices, placedVerticesPositions, {
        attractionForceFactor: forcesSettings.attractionForceFactor.value,
        attractionScale: forcesSettings.attractionScale.value,
        repulsionScale: forcesSettings.repulsionScale.value,
        strategy: forcesSettings.strategy.value,
        type: forcesSettings.type
      })
    ).verticesPositions;

    // Update the target bounding rect
    targetBoundingRect.value = calcContainerBoundingRect(targetPositions);

    // Update the positions of the vertices
    Object.entries(targetPositions).forEach(([key, targetPosition]) => {
      const vertexPosition = placedVerticesPositions[key];
      if (!vertexPosition) return;
      vertexPosition.x.value = animateToValue(
        vertexPosition.x.value,
        targetPosition.x
      );
      vertexPosition.y.value = animateToValue(
        vertexPosition.y.value,
        targetPosition.y
      );
    });
  });

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
    forcesSettings: settings.layout as InternalForceLayoutSettings
  })
);
