import { GraphConnections } from '@/types/graphs';
import { VerticesPositions } from '@/types/layout';
import { ForcesScale, ForcesSettings } from '@/types/settings/forces';

import applyDefaultForces from './strategies/default.forces';

export const applyForces = (
  connections: GraphConnections,
  verticesPositions: VerticesPositions,
  forcesScale: ForcesScale,
  settings?: ForcesSettings
): void => {
  'worklet';
  switch (settings?.strategy) {
    default:
    case 'default':
      applyDefaultForces(connections, verticesPositions, forcesScale, settings);
      break;
  }
};
