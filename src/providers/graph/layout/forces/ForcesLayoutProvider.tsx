import { PropsWithChildren } from 'react';
import { SharedValue, useFrameCallback } from 'react-native-reanimated';

import { animateToValue } from '@/utils/animations';
import { applyForces } from '@/utils/forces';
import {
  alignPositionsToCenter,
  calcContainerBoundingRect
} from '@/utils/placement';

import { useForcesPlacementContext } from './ForcesPlacementProvider';
import { GraphConnections } from '@/types/graphs';
import { ForcesSettingsWithDefaults } from '@/types/settings';
import { BoundingRect } from '@/types/layout';
import { withComponentsData } from '../../data/components/context';
import { withGraphSettings } from '../../data/settings/context';

type ForcesLayoutProviderProps = PropsWithChildren<{
  connections: GraphConnections;
  forcesSettings: ForcesSettingsWithDefaults;
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

export default withGraphSettings(
  withComponentsData(
    ForcesLayoutProvider,
    ({ connections, targetBoundingRect }) => ({
      connections,
      targetBoundingRect
    })
  ),
  ({ settings }) => ({
    forcesSettings: settings.layout
  })
);
