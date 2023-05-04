import { GraphConnections } from '@/types/graphs';
import { AnimatedPositionCoordinates } from '@/types/layout';
import { CalculatedForces, ForcesSettings } from '@/types/settings/forces';

import { applyForces } from './shared';
import calcDefaultForces from './strategies/default.forces';

export const applyForcesFrame = (
  connections: GraphConnections,
  verticesPositions: Record<string, AnimatedPositionCoordinates>,
  settings?: ForcesSettings,
  callback?: (appliedForces: CalculatedForces) => void
): void => {
  'worklet';

  let forces: CalculatedForces;

  switch (settings?.strategy) {
    case 'default':
    default:
      forces = calcDefaultForces(connections, verticesPositions, settings);
      break;
  }

  applyForces(forces, verticesPositions);
  callback?.(forces);
};
