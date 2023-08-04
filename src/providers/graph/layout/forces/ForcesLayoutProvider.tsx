import { PropsWithChildren } from 'react';
import { useFrameCallback } from 'react-native-reanimated';

import { withComponentsData } from '@/providers/graph';
import { animateToValue } from '@/utils/animations';
import { applyForces } from '@/utils/forces';
import {
  alignPositionsToCenter,
  calcContainerBoundingRect
} from '@/utils/placement';

import { useForcesPlacementContext } from './ForcesPlacementProvider';

type ForcesLayoutProviderProps = PropsWithChildren<{
  // connections: GraphConnections;
  // forcesSettings: ForcesSettingsWithDefaults;
  // targetBoundingRect: SharedValue<BoundingRect>;
}>;

function ForcesLayoutProvider({
  children,
  connections,
  forcesSettings,
  targetBoundingRect
}: ForcesLayoutProviderProps) {
  console.log('ForcesLayoutProvider');
  return <>{children}</>;

  // CONTEXTS
  // Forces placement context
  const { lockedVertices, placedVerticesPositions } =
    useForcesPlacementContext();

  useFrameCallback(() => {
    const targetPositions = alignPositionsToCenter(
      applyForces(
        connections,
        lockedVertices,
        placedVerticesPositions,
        forcesSettings
      )
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

export default withComponentsData(
  ForcesLayoutProvider,
  ({ connections, targetBoundingRect }) => ({
    connections,
    targetBoundingRect
  })
);
