import { PropsWithChildren } from 'react';
import { useFrameCallback } from 'react-native-reanimated';

import { withGraphData } from '@/providers/graph';
import { GraphConnections } from '@/types/graphs';
import { ForcesSettingsWithDefaults } from '@/types/settings';
import { animateToValue } from '@/utils/animations';
import { applyForces } from '@/utils/forces';
import { alignPositionsToCenter } from '@/utils/placement';

import { useForcesPlacementContext } from './ForcesPlacementProvider';

type ForcesLayoutProviderProps = PropsWithChildren<{
  connections: GraphConnections;
  forcesSettings: ForcesSettingsWithDefaults;
}>;

function ForcesLayoutProvider({
  children,
  connections,
  forcesSettings
}: ForcesLayoutProviderProps) {
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

export default withGraphData(ForcesLayoutProvider, ({ connections }) => ({
  connections
}));
