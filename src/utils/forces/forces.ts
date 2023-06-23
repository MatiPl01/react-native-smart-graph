import { GraphConnections } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { ForcesSettingsWithDefaults } from '@/types/settings/forces';

import { applyDefaultForces } from './strategies/default.forces';

export const applyForces = (
  connections: GraphConnections,
  lockedVertices: Record<string, boolean>,
  verticesPositions: Record<string, AnimatedVectorCoordinates>,
  settings: ForcesSettingsWithDefaults
): void => {
  'worklet';
  switch (settings.strategy) {
    default:
    case 'default':
      applyDefaultForces(
        connections,
        lockedVertices,
        verticesPositions,
        settings
      );
      break;
  }
};
