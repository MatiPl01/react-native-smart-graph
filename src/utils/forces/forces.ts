import { Vector } from '@shopify/react-native-skia';

import { AnimatedVectorCoordinates } from '@/types/layout';
import { GraphConnections } from '@/types/models';
import { AllForcesStrategySettings } from '@/types/settings';

import { applyDefaultForces } from './strategies/default.forces';

export const applyForces = (
  connections: GraphConnections,
  lockedVertices: Record<string, boolean>,
  verticesPositions: Record<string, AnimatedVectorCoordinates>,
  settings: AllForcesStrategySettings
): Record<string, Vector> => {
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
