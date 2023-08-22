import { AnimatedVectorCoordinates, Vector } from '@/types/layout';
import { GraphConnections } from '@/types/models';
import { AllForceLayoutSettings } from '@/types/settings';

import { applyDefaultForces } from './strategies/default.forces';

export const applyForces = (
  connections: GraphConnections,
  lockedVertices: Record<string, boolean>,
  verticesPositions: Record<string, AnimatedVectorCoordinates>,
  settings: Omit<AllForceLayoutSettings, 'refreshInterval'>
): {
  keys: Array<string>;
  positions: Record<string, Vector>;
} => {
  'worklet';
  switch (settings.strategy) {
    default:
    case 'default':
      return applyDefaultForces(
        connections,
        lockedVertices,
        verticesPositions,
        settings
      );
  }
};
