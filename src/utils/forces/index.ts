import { GraphConnections } from '@/types/graphs';
import { AnimatedVectorCoordinates } from '@/types/layout';
import { ForcesSettingsWithDefaults } from '@/types/settings';

import applyDefaultForces from './strategies/default.forces';

export const applyForces = (
  connections: GraphConnections,
  verticesPositions: Record<string, AnimatedVectorCoordinates>,
  settings: ForcesSettingsWithDefaults
): void => {
  'worklet';
  switch (settings?.strategy) {
    default:
    case 'default':
      // TODO - add attraction force between vertices and their placement positions
      applyDefaultForces(connections, verticesPositions, settings);
      break;
  }
};
