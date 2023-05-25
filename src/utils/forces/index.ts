import { GraphConnections } from '@/types/graphs';
import { VerticesPositions } from '@/types/layout';
import { ForcesSettings } from '@/types/settings/forces';

import applyDefaultForces from './strategies/default.forces';

export const applyForces = (
  connections: GraphConnections,
  verticesPositions: VerticesPositions,
  settings?: ForcesSettings
): void => {
  'worklet';
  switch (settings?.strategy) {
    default:
    case 'default':
      applyDefaultForces(connections, verticesPositions, settings);
      break;
  }
};
